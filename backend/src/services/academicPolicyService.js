import AcademicSettings from "../models/AcademicSettings.js";
import AppError from "../utils/AppError.js";

const DEFAULT_RENEWAL_WINDOW_DAYS = 7;

const startOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const addDays = (date, days) => {
  const value = new Date(date);
  value.setDate(value.getDate() + Number(days || 0));
  return value;
};

const dedupeCourses = (courses = []) => {
  const seen = new Set();
  const normalized = [];

  for (const course of courses) {
    const name = String(course?.name || "").trim();
    const totalSemesters = Number(course?.totalSemesters);
    const isActive = course?.isActive !== false;

    if (!name) {
      throw new AppError("Each course must include a valid name.", 400);
    }

    if (!Number.isInteger(totalSemesters) || totalSemesters < 1) {
      throw new AppError(`Course \"${name}\" must have a valid semester count.`, 400);
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw new AppError(`Duplicate course is not allowed: ${name}`, 400);
    }

    seen.add(key);
    normalized.push({ name, totalSemesters, isActive });
  }

  return normalized;
};

export const getAcademicSettings = async () => {
  return AcademicSettings.findOne({ singletonKey: "default" }).lean();
};

export const upsertAcademicSettings = async ({
  semesterStartDate,
  semesterEndDate,
  renewalWindowDays = DEFAULT_RENEWAL_WINDOW_DAYS,
  courses = [],
  updatedBy,
}) => {
  const startDate = startOfDay(semesterStartDate);
  const endDate = endOfDay(semesterEndDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError("Semester start and end dates are required.", 400);
  }

  if (endDate <= startDate) {
    throw new AppError("Semester end date must be after start date.", 400);
  }

  const normalizedCourses = dedupeCourses(courses).filter((course) => course.isActive !== false);

  if (normalizedCourses.length === 0) {
    throw new AppError("At least one active course must be configured.", 400);
  }

  const safeWindowDays = Math.max(1, Number(renewalWindowDays) || DEFAULT_RENEWAL_WINDOW_DAYS);

  const updated = await AcademicSettings.findOneAndUpdate(
    { singletonKey: "default" },
    {
      $set: {
        semesterStartDate: startDate,
        semesterEndDate: endDate,
        renewalWindowDays: safeWindowDays,
        courses: normalizedCourses,
        updatedBy,
      },
      $setOnInsert: {
        singletonKey: "default",
      },
    },
    { new: true, upsert: true },
  ).lean();

  return updated;
};

export const getAcademicCycleDates = async () => {
  const settings = await getAcademicSettings();

  if (!settings?.semesterStartDate || !settings?.semesterEndDate) {
    return null;
  }

  const semesterStartDate = startOfDay(settings.semesterStartDate);
  const semesterEndDate = endOfDay(settings.semesterEndDate);
  const windowDays = Math.max(1, Number(settings.renewalWindowDays) || DEFAULT_RENEWAL_WINDOW_DAYS);

  return {
    semesterStartDate,
    semesterEndDate,
    renewalWindowStart: semesterStartDate,
    renewalWindowEnd: endOfDay(addDays(semesterStartDate, windowDays - 1)),
    renewalWindowDays: windowDays,
  };
};

export const validateStudentCourseAndSemester = async ({ course, studyYear }) => {
  const settings = await getAcademicSettings();

  if (!settings?.courses?.length) {
    throw new AppError("Academic settings are not configured by hostel admin yet.", 400);
  }

  const normalizedCourse = String(course || "").trim();
  const normalizedSemester = Number(studyYear);

  if (!normalizedCourse) {
    throw new AppError("Course is required.", 400);
  }

  if (!Number.isInteger(normalizedSemester) || normalizedSemester < 1) {
    throw new AppError("Valid current semester is required.", 400);
  }

  const matchedCourse = settings.courses.find(
    (item) => item?.isActive !== false && String(item.name || "").trim().toLowerCase() === normalizedCourse.toLowerCase(),
  );

  if (!matchedCourse) {
    throw new AppError("Selected course is not allowed by hostel admin.", 400);
  }

  if (normalizedSemester > Number(matchedCourse.totalSemesters || 0)) {
    throw new AppError("You have completed your course and are no longer eligible for hostel room allocation.", 400);
  }

  return {
    course: matchedCourse.name,
    studyYear: normalizedSemester,
    totalSemesters: Number(matchedCourse.totalSemesters || 0),
  };
};

export const isStudentCourseCompleted = async ({ course, studyYear }) => {
  const settings = await getAcademicSettings();
  if (!settings?.courses?.length) return false;

  const matchedCourse = settings.courses.find(
    (item) => item?.isActive !== false && String(item.name || "").trim().toLowerCase() === String(course || "").trim().toLowerCase(),
  );

  if (!matchedCourse) {
    return false;
  }

  const currentSemester = Number(studyYear);
  if (!Number.isInteger(currentSemester) || currentSemester < 1) {
    return false;
  }

  return currentSemester > Number(matchedCourse.totalSemesters || 0);
};
