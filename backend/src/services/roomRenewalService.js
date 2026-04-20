import Room from "../models/Room.js";
import RoomAllocation from "../models/RoomAllocation.js";
import User from "../models/User.js";
import { createNotification } from "./notificationService.js";
import {
  getAcademicCycleDates,
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

export const getDefaultCycleDates = (seedDate = new Date()) => {
  const semesterStartDate = startOfDay(seedDate);
  const semesterEndDate = endOfDay(addDays(semesterStartDate, SEMESTER_DURATION_DAYS - 1));
  const renewalWindowStart = startOfDay(addDays(semesterEndDate, 1));
  const renewalWindowEnd = endOfDay(addDays(renewalWindowStart, RENEWAL_WINDOW_DAYS - 1));

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

export const ensureAllocationCycle = async (allocationDoc, { session } = {}) => {
  if (!allocationDoc) return null;

  let mutated = false;
  const configuredCycle = await getConfiguredCycleDates(
    allocationDoc.allocatedAt || allocationDoc.createdAt || new Date(),
  );

  if (!allocationDoc.semesterStartDate || !allocationDoc.semesterEndDate || !allocationDoc.renewalWindowStart || !allocationDoc.renewalWindowEnd) {
    allocationDoc.semesterStartDate = configuredCycle.semesterStartDate;
    allocationDoc.semesterEndDate = configuredCycle.semesterEndDate;
    allocationDoc.renewalWindowStart = configuredCycle.renewalWindowStart;
    allocationDoc.renewalWindowEnd = configuredCycle.renewalWindowEnd;
    mutated = true;
  }

  const currentStart = allocationDoc.semesterStartDate ? new Date(allocationDoc.semesterStartDate).getTime() : null;
  const currentEnd = allocationDoc.semesterEndDate ? new Date(allocationDoc.semesterEndDate).getTime() : null;
  const currentWindowStart = allocationDoc.renewalWindowStart ? new Date(allocationDoc.renewalWindowStart).getTime() : null;
  const currentWindowEnd = allocationDoc.renewalWindowEnd ? new Date(allocationDoc.renewalWindowEnd).getTime() : null;

  if (
    currentStart !== new Date(configuredCycle.semesterStartDate).getTime() ||
    currentEnd !== new Date(configuredCycle.semesterEndDate).getTime() ||
    currentWindowStart !== new Date(configuredCycle.renewalWindowStart).getTime() ||
    currentWindowEnd !== new Date(configuredCycle.renewalWindowEnd).getTime()
  ) {
    allocationDoc.semesterStartDate = configuredCycle.semesterStartDate;
    allocationDoc.semesterEndDate = configuredCycle.semesterEndDate;
    allocationDoc.renewalWindowStart = configuredCycle.renewalWindowStart;
    allocationDoc.renewalWindowEnd = configuredCycle.renewalWindowEnd;
    mutated = true;
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
    message: "Your room allocation was auto-vacated because the next semester hostel rent was not paid within the 1-week payment window.",
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

  const current = new Date(now);
  const semesterEndDate = new Date(allocationDoc.semesterEndDate);
  const renewalWindowEnd = new Date(allocationDoc.renewalWindowEnd);

  let nextStatus = allocationDoc.renewalStatus || "not_due";

  if (current < semesterEndDate) {
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
      "Renewal payment not completed within one-week window after semester start.",
      { session },
    );
  }

  return allocationDoc;
};

export const renewAllocationForNextSemester = async (allocationDoc, { session } = {}) => {
  if (!allocationDoc) return null;

  await ensureAllocationCycle(allocationDoc, { session });

  const nextCycle = await getConfiguredCycleDates(
    allocationDoc.renewalWindowStart || addDays(new Date(), 1),
  );

  allocationDoc.semesterStartDate = nextCycle.semesterStartDate;
  allocationDoc.semesterEndDate = nextCycle.semesterEndDate;
  allocationDoc.renewalWindowStart = nextCycle.renewalWindowStart;
  allocationDoc.renewalWindowEnd = nextCycle.renewalWindowEnd;
  allocationDoc.renewalStatus = "paid";
  allocationDoc.lastRenewedAt = new Date();
  allocationDoc.autoVacatedReason = "";

  await allocationDoc.save({ session });

  // Once this request lifecycle is completed, mark next cycle as not due.
  allocationDoc.renewalStatus = "not_due";
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
  };
};

export const processRoomRenewalLifecycle = async ({ studentId } = {}) => {
  const query = { status: "active" };
  if (studentId) {
    query.studentId = studentId;
  }

  const allocations = await RoomAllocation.find(query);

  for (const allocation of allocations) {
    const student = await User.findById(allocation.studentId).select("course studyYear").lean();
    const completedCourse = await isStudentCourseCompleted({
      course: student?.course,
      studyYear: student?.studyYear,
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
