import Room from "../models/Room.js";
import RoomAllocation from "../models/RoomAllocation.js";
import User from "../models/User.js";
import { createNotification } from "./notificationService.js";
import {
  getAcademicCycleDates,
  getSemesterTimelineForStudent,
  isStudentCourseCompleted,
} from "./academicPolicyService.js";

const SEMESTER_DURATION_DAYS = Math.max(1, Number(process.env.HOSTEL_SEMESTER_DAYS) || 180);
const RENEWAL_WINDOW_DAYS = Math.max(1, Number(process.env.HOSTEL_RENEWAL_WINDOW_DAYS) || 7);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days || 0));
  return next;
};

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

const toCycleKey = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStudentAcademicSnapshot = async (studentId) => {
  return User.findById(studentId)
    .select("course studyYear admissionYear isActive")
    .lean();
};

export const getDefaultCycleDates = (seedDate = new Date()) => {
  const semesterStartDate = startOfDay(seedDate);
  const semesterEndDate = endOfDay(addDays(semesterStartDate, SEMESTER_DURATION_DAYS - 1));
  const renewalWindowStart = startOfDay(addDays(semesterStartDate, -RENEWAL_WINDOW_DAYS));
  const renewalWindowEnd = endOfDay(addDays(semesterStartDate, -1));

  return {
    semesterStartDate,
    semesterEndDate,
    renewalWindowStart,
    renewalWindowEnd,
  };
};

export const getConfiguredCycleDates = async (seedDate = new Date()) => {
  const configured = await getAcademicCycleDates();
  if (configured?.semesterStartDate && configured?.semesterEndDate) {
    return {
      semesterStartDate: configured.semesterStartDate,
      semesterEndDate: configured.semesterEndDate,
      renewalWindowStart: configured.renewalWindowStart,
      renewalWindowEnd: configured.renewalWindowEnd,
    };
  }

  return getDefaultCycleDates(seedDate);
};

const buildAllocationCycleFromStudent = async ({ allocationDoc, student }) => {
  if (!student?.course) {
    return null;
  }

  const semesterNumber = Number(allocationDoc.currentSemester || student.studyYear || 1);
  const timeline = await getSemesterTimelineForStudent({
    course: student.course,
    semesterNumber,
    admissionYear: student.admissionYear,
  });

  return {
    ...timeline,
    admissionYear: Number(student.admissionYear) || new Date().getFullYear(),
    courseName: timeline.course,
  };
};

export const ensureAllocationCycle = async (allocationDoc, { session } = {}) => {
  if (!allocationDoc) return null;

  let mutated = false;
  const student = await getStudentAcademicSnapshot(allocationDoc.studentId);
  let computedCycle = null;

  if (student?.course) {
    try {
      computedCycle = await buildAllocationCycleFromStudent({ allocationDoc, student });
    } catch {
      computedCycle = null;
    }
  }

  const fallbackCycle = await getConfiguredCycleDates(
    allocationDoc.allocatedAt || allocationDoc.createdAt || new Date(),
  );

  const target = computedCycle || {
    semesterStartDate: fallbackCycle.semesterStartDate,
    semesterEndDate: fallbackCycle.semesterEndDate,
    renewalWindowStart: fallbackCycle.renewalWindowStart,
    renewalWindowEnd: fallbackCycle.renewalWindowEnd,
    semesterNumber: Number(allocationDoc.currentSemester || student?.studyYear || 1),
    totalSemesters: Number(allocationDoc.totalSemesters || student?.studyYear || 1),
    admissionYear: Number(student?.admissionYear || new Date().getFullYear()),
    courseName: student?.course || allocationDoc.courseName || "",
  };

  const fields = [
    ["semesterStartDate", target.semesterStartDate],
    ["semesterEndDate", target.semesterEndDate],
    ["renewalWindowStart", target.renewalWindowStart || null],
    ["renewalWindowEnd", target.renewalWindowEnd || null],
    ["currentSemester", Number(target.semesterNumber || allocationDoc.currentSemester || 1)],
    ["totalSemesters", Number(target.totalSemesters || allocationDoc.totalSemesters || 1)],
    ["admissionYear", Number(target.admissionYear || allocationDoc.admissionYear || new Date().getFullYear())],
    ["courseName", target.courseName || allocationDoc.courseName || ""],
  ];

  for (const [key, value] of fields) {
    const current = allocationDoc[key] instanceof Date ? allocationDoc[key]?.getTime() : allocationDoc[key];
    const next = value instanceof Date ? value?.getTime() : value;
    if (current !== next) {
      allocationDoc[key] = value;
      mutated = true;
    }
  }

  if (!allocationDoc.renewalStatus) {
    allocationDoc.renewalStatus = "not_due";
    mutated = true;
  }

  if (mutated) {
    await allocationDoc.save({ session });
  }

  return allocationDoc;
};

export const getAllocationRenewalCycleKey = (allocation) => {
  const source = allocation?.renewalWindowStart || allocation?.semesterEndDate || new Date();
  return `hostel-renewal:${toCycleKey(source)}`;
};

export const isRenewalWindowOpen = (allocation, now = new Date()) => {
  if (!allocation?.renewalWindowStart || !allocation?.renewalWindowEnd) {
    return false;
  }

  const current = new Date(now);
  return current >= new Date(allocation.renewalWindowStart) && current <= new Date(allocation.renewalWindowEnd);
};

const autoVacateAllocation = async (allocationDoc, reason, { session } = {}) => {
  if (!allocationDoc || allocationDoc.status !== "active") {
    return allocationDoc;
  }

  const roomQuery = Room.findById(allocationDoc.roomId);
  if (session) {
    roomQuery.session(session);
  }
  const room = await roomQuery;

  allocationDoc.status = "vacated";
  allocationDoc.vacatedAt = new Date();
  allocationDoc.renewalStatus = "vacated";
  allocationDoc.autoVacatedReason = reason;
  await allocationDoc.save({ session });

  if (room) {
    room.occupiedCount = Math.max(Number(room.occupiedCount || 0) - 1, 0);
    if (room.status !== "maintenance") {
      room.status = room.occupiedCount >= Number(room.capacity || 0) ? "full" : "available";
    }
    await room.save({ session });
  }

  await createNotification({
    userId: allocationDoc.studentId,
    type: "room_auto_vacated",
    message: reason || "Your room allocation was auto-vacated due to academic eligibility or renewal policy.",
  });

  return allocationDoc;
};

export const syncAllocationRenewalStatus = async (
  allocationDoc,
  { now = new Date(), autoVacateIfExpired = false, session } = {},
) => {
  if (!allocationDoc) return null;

  await ensureAllocationCycle(allocationDoc, { session });

  if (allocationDoc.status !== "active") {
    return allocationDoc;
  }

  if (!allocationDoc.renewalWindowStart || !allocationDoc.renewalWindowEnd) {
    allocationDoc.renewalStatus = "not_due";
    await allocationDoc.save({ session });
    return allocationDoc;
  }

  const current = new Date(now);
  const renewalWindowStart = new Date(allocationDoc.renewalWindowStart);
  const renewalWindowEnd = new Date(allocationDoc.renewalWindowEnd);

  let nextStatus = allocationDoc.renewalStatus || "not_due";

  if (current < renewalWindowStart) {
    nextStatus = "not_due";
  } else if (current <= renewalWindowEnd) {
    nextStatus = "due";
  } else {
    nextStatus = "overdue";
  }

  if (nextStatus !== allocationDoc.renewalStatus) {
    allocationDoc.renewalStatus = nextStatus;
    await allocationDoc.save({ session });
  }

  if (autoVacateIfExpired && allocationDoc.renewalStatus === "overdue" && current > renewalWindowEnd) {
    await autoVacateAllocation(
      allocationDoc,
      "Hostel renewal was not paid within the admin-configured semester renewal window.",
      { session },
    );
  }

  return allocationDoc;
};

export const renewAllocationForNextSemester = async (allocationDoc, { session } = {}) => {
  if (!allocationDoc) return null;

  await ensureAllocationCycle(allocationDoc, { session });

  const student = await getStudentAcademicSnapshot(allocationDoc.studentId);
  if (!student?.course) {
    throw new Error("Student academic course is missing for renewal.");
  }

  if (student.isActive === false) {
    await autoVacateAllocation(
      allocationDoc,
      "Student is inactive in college and not eligible for hostel continuation.",
      { session },
    );
    return allocationDoc;
  }

  const nextSemesterNumber = Number(allocationDoc.currentSemester || student.studyYear || 1) + 1;
  const totalSemesters = Number(allocationDoc.totalSemesters || 0);

  if (totalSemesters > 0 && nextSemesterNumber > totalSemesters) {
    await autoVacateAllocation(
      allocationDoc,
      "Course completed. Student is no longer eligible for hostel continuation.",
      { session },
    );
    return allocationDoc;
  }

  const timeline = await getSemesterTimelineForStudent({
    course: student.course,
    semesterNumber: nextSemesterNumber,
    admissionYear: student.admissionYear,
  });

  allocationDoc.currentSemester = Number(timeline.semesterNumber);
  allocationDoc.totalSemesters = Number(timeline.totalSemesters);
  allocationDoc.courseName = timeline.course;
  allocationDoc.admissionYear = Number(student.admissionYear || allocationDoc.admissionYear || new Date().getFullYear());
  allocationDoc.semesterStartDate = timeline.semesterStartDate;
  allocationDoc.semesterEndDate = timeline.semesterEndDate;
  allocationDoc.renewalWindowStart = timeline.renewalWindowStart;
  allocationDoc.renewalWindowEnd = timeline.renewalWindowEnd;
  allocationDoc.renewalStatus = "not_due";
  allocationDoc.lastRenewedAt = new Date();
  allocationDoc.autoVacatedReason = "";

  await allocationDoc.save({ session });

  return allocationDoc;
};

export const getRenewalInfoFromAllocation = ({ allocation, roomPrice, now = new Date() }) => {
  if (!allocation || allocation.status !== "active") {
    return null;
  }

  const current = new Date(now);
  const dueDate = allocation.semesterEndDate ? new Date(allocation.semesterEndDate) : null;
  const paymentWindowStart = allocation.renewalWindowStart ? new Date(allocation.renewalWindowStart) : null;
  const paymentWindowEnd = allocation.renewalWindowEnd ? new Date(allocation.renewalWindowEnd) : null;

  const windowOpen = paymentWindowStart && paymentWindowEnd
    ? current >= paymentWindowStart && current <= paymentWindowEnd
    : false;

  return {
    status: allocation.renewalStatus || "not_due",
    dueDate,
    semesterStartDate: allocation.semesterStartDate || null,
    semesterEndDate: allocation.semesterEndDate || null,
    paymentWindowStart,
    paymentWindowEnd,
    windowOpen,
    amount: Number(roomPrice || 0),
    billingCycleKey: getAllocationRenewalCycleKey(allocation),
    currentSemester: Number(allocation.currentSemester || 0),
    totalSemesters: Number(allocation.totalSemesters || 0),
  };
};

export const processRoomRenewalLifecycle = async ({ studentId } = {}) => {
  const query = { status: "active" };
  if (studentId) {
    query.studentId = studentId;
  }

  const allocations = await RoomAllocation.find(query);

  for (const allocation of allocations) {
    const student = await getStudentAcademicSnapshot(allocation.studentId);

    if (!student || student.isActive === false) {
      await autoVacateAllocation(
        allocation,
        "Student is inactive in college and not eligible for hostel room occupancy.",
      );
      continue;
    }

    const completedCourse = await isStudentCourseCompleted({
      course: student?.course,
      studyYear: allocation.currentSemester || student?.studyYear,
    });

    if (completedCourse) {
      await autoVacateAllocation(
        allocation,
        "Course completed. Student is no longer eligible for hostel room occupancy.",
      );
      continue;
    }

    await syncAllocationRenewalStatus(allocation, { autoVacateIfExpired: true });
  }

  return allocations.length;
};
