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

const getMonthDay = (dateValue) => {
  const value = new Date(dateValue);
  return {
    month: value.getMonth(),
    day: value.getDate(),
  };
};

const buildDateFromTemplate = (year, template) => {
  const value = new Date(year, template.month, template.day);
  return value;
};

const getSemesterType = (semesterNumber) => (Number(semesterNumber) % 2 === 0 ? "even" : "odd");

const getBaseAcademicYearForSemester = ({ admissionYear, semesterNumber }) => {
  const semNo = Number(semesterNumber);
  return Number(admissionYear) + Math.floor((semNo - 1) / 2);
};

const getSemesterStartDateForCourse = ({
  course,
  semesterNumber,
  admissionYear,
}) => {
  const semesterType = getSemesterType(semesterNumber);
  const oddTemplate = getMonthDay(course.oddSemesterStartDate);
  const evenTemplate = getMonthDay(course.evenSemesterStartDate);

  let year = getBaseAcademicYearForSemester({ admissionYear, semesterNumber });

  if (semesterType === "even") {
    const evenEarlierThanOdd =
      evenTemplate.month < oddTemplate.month ||
      (evenTemplate.month === oddTemplate.month && evenTemplate.day < oddTemplate.day);

    if (evenEarlierThanOdd) {
      year += 1;
    }
  }

  return startOfDay(
    buildDateFromTemplate(year, semesterType === "odd" ? oddTemplate : evenTemplate),
  );
};

const getSemesterEndDateForCourse = ({
  course,
  semesterNumber,
  semesterStartDate,
}) => {
  const semesterType = getSemesterType(semesterNumber);
  const template = getMonthDay(
    semesterType === "odd" ? course.oddSemesterEndDate : course.evenSemesterEndDate,
  );

  let endDate = endOfDay(
    buildDateFromTemplate(semesterStartDate.getFullYear(), template),
  );

  if (endDate <= semesterStartDate) {
    endDate = endOfDay(buildDateFromTemplate(semesterStartDate.getFullYear() + 1, template));
  }

  return endDate;
};

const dedupeCourses = (courses = []) => {
  const seen = new Set();
  const normalized = [];

  for (const course of courses) {
    const name = String(course?.name || "").trim();
    const totalSemesters = Number(course?.totalSemesters);
    const isActive = course?.isActive !== false;
    const oddSemesterStartDate = startOfDay(course?.oddSemesterStartDate);
    const oddSemesterEndDate = endOfDay(course?.oddSemesterEndDate);
    const evenSemesterStartDate = startOfDay(course?.evenSemesterStartDate);
    const evenSemesterEndDate = endOfDay(course?.evenSemesterEndDate);

    if (!name) {
      throw new AppError("Each course must include a valid name.", 400);
    }

    if (!Number.isInteger(totalSemesters) || totalSemesters < 1) {
      throw new AppError(`Course \"${name}\" must have a valid semester count.`, 400);
    }

    if (
      Number.isNaN(oddSemesterStartDate.getTime()) ||
      Number.isNaN(oddSemesterEndDate.getTime()) ||
      Number.isNaN(evenSemesterStartDate.getTime()) ||
      Number.isNaN(evenSemesterEndDate.getTime())
    ) {
      throw new AppError(`Course \"${name}\" must include all odd/even semester start and end dates.`, 400);
    }

    if (oddSemesterEndDate <= oddSemesterStartDate) {
      throw new AppError(`Course \"${name}\" has invalid odd semester date range.`, 400);
    }

    if (evenSemesterEndDate <= evenSemesterStartDate) {
      throw new AppError(`Course \"${name}\" has invalid even semester date range.`, 400);
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw new AppError(`Duplicate course is not allowed: ${name}`, 400);
    }

    seen.add(key);
    normalized.push({
      name,
      totalSemesters,
      oddSemesterStartDate,
      oddSemesterEndDate,
      evenSemesterStartDate,
      evenSemesterEndDate,
      isActive,
    });
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
  const normalizedCourses = dedupeCourses(courses).filter((course) => course.isActive !== false);

  if (normalizedCourses.length === 0) {
    throw new AppError("At least one active course must be configured.", 400);
  }

  const suppliedStartDate = semesterStartDate ? startOfDay(semesterStartDate) : null;
  const suppliedEndDate = semesterEndDate ? endOfDay(semesterEndDate) : null;

  let startDate = suppliedStartDate;
  let endDate = suppliedEndDate;

  if (!startDate || Number.isNaN(startDate.getTime())) {
    const allStarts = normalizedCourses.flatMap((course) => [
      new Date(course.oddSemesterStartDate),
      new Date(course.evenSemesterStartDate),
    ]);
    startDate = new Date(Math.min(...allStarts.map((date) => date.getTime())));
  }

  if (!endDate || Number.isNaN(endDate.getTime())) {
    const allEnds = normalizedCourses.flatMap((course) => [
      new Date(course.oddSemesterEndDate),
      new Date(course.evenSemesterEndDate),
    ]);
    endDate = new Date(Math.max(...allEnds.map((date) => date.getTime())));
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError("Valid semester dates are required.", 400);
  }

  if (endDate <= startDate) {
    throw new AppError("Semester end date must be after start date.", 400);
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
    renewalWindowStart: startOfDay(addDays(semesterStartDate, -windowDays)),
    renewalWindowEnd: endOfDay(addDays(semesterStartDate, -1)),
    renewalWindowDays: windowDays,
  };
};

export const getCoursePolicyByName = async (courseName) => {
  const settings = await getAcademicSettings();
  if (!settings?.courses?.length) {
    return null;
  }

  return (
    settings.courses.find(
      (item) =>
        item?.isActive !== false
        && String(item.name || "").trim().toLowerCase() === String(courseName || "").trim().toLowerCase(),
    ) || null
  );
};

export const getSemesterTimelineForStudent = async ({
  course,
  semesterNumber,
  admissionYear,
}) => {
  const matchedCourse = await getCoursePolicyByName(course);

  if (!matchedCourse) {
    throw new AppError("Selected course is not allowed by hostel admin.", 400);
  }

  const semNo = Number(semesterNumber);
  if (!Number.isInteger(semNo) || semNo < 1) {
    throw new AppError("Valid current semester is required.", 400);
  }

  if (semNo > Number(matchedCourse.totalSemesters || 0)) {
    throw new AppError("You have completed your course and are no longer eligible for hostel room allocation.", 400);
  }

  const baseAdmissionYear = Number(admissionYear) || new Date().getFullYear();
  const renewalWindowDays = Math.max(
    1,
    Number((await getAcademicSettings())?.renewalWindowDays) || DEFAULT_RENEWAL_WINDOW_DAYS,
  );

  const currentStart = getSemesterStartDateForCourse({
    course: matchedCourse,
    semesterNumber: semNo,
    admissionYear: baseAdmissionYear,
  });
  const currentEnd = getSemesterEndDateForCourse({
    course: matchedCourse,
    semesterNumber: semNo,
    semesterStartDate: currentStart,
  });

  const hasNextSemester = semNo < Number(matchedCourse.totalSemesters || 0);

  let nextStart = null;
  let nextEnd = null;
  let renewalWindowStart = null;
  let renewalWindowEnd = null;

  if (hasNextSemester) {
    nextStart = getSemesterStartDateForCourse({
      course: matchedCourse,
      semesterNumber: semNo + 1,
      admissionYear: baseAdmissionYear,
    });
    nextEnd = getSemesterEndDateForCourse({
      course: matchedCourse,
      semesterNumber: semNo + 1,
      semesterStartDate: nextStart,
    });

    renewalWindowStart = startOfDay(addDays(nextStart, -renewalWindowDays));
    renewalWindowEnd = endOfDay(addDays(nextStart, -1));
  }

  return {
    course: matchedCourse.name,
    totalSemesters: Number(matchedCourse.totalSemesters || 0),
    semesterNumber: semNo,
    semesterStartDate: currentStart,
    semesterEndDate: currentEnd,
    nextSemesterNumber: hasNextSemester ? semNo + 1 : null,
    nextSemesterStartDate: nextStart,
    nextSemesterEndDate: nextEnd,
    renewalWindowStart,
    renewalWindowEnd,
    renewalWindowDays,
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
