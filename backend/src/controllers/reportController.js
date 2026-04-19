import User from "../models/User.js";
import Room from "../models/Room.js";
import Complaint from "../models/Complaint.js";
import Payment from "../models/Payment.js";
import MessSubscription from "../models/MessSubscription.js";
import Hostel from "../models/Hostel.js";
import RoomAllocation from "../models/RoomAllocation.js";
import RoomRequest from "../models/RoomRequest.js";
import VacateRequest from "../models/VacateRequest.js";
import Block from "../models/Block.js";
import MessPlan from "../models/MessPlan.js";
import Notification from "../models/Notification.js";
import { expireSubscriptionsAndNotify } from "../services/notificationService.js";

const toObjectId = (value) => {
  if (!value) return null;
  return value;
};

const normalizeDateRange = (from, to) => {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid from/to date provided.");
  }

  if (start > end) {
    throw new Error("The 'from' date must be earlier than or equal to 'to' date.");
  }

  return { start, end };
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const getBucketKey = (date, granularity) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (granularity === "month") return `${year}-${month}`;
  return `${year}-${month}-${day}`;
};

const formatBucketLabel = (date, granularity) => {
  if (granularity === "month") {
    return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const getBuckets = (start, end, granularity) => {
  const buckets = [];
  let cursor = new Date(start);

  if (granularity === "month") {
    cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  }

  while (cursor <= end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = granularity === "month"
      ? new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999)
      : new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 23, 59, 59, 999);

    buckets.push({
      key: getBucketKey(cursor, granularity),
      label: formatBucketLabel(cursor, granularity),
      start: bucketStart,
      end: bucketEnd > end ? new Date(end) : bucketEnd,
    });

    cursor = granularity === "month" ? addMonths(cursor, 1) : addDays(cursor, 1);
  }

  return buckets;
};

const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

const calculateTrend = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return {
      value: currentValue > 0 ? 100 : 0,
      trend: currentValue > 0 ? "up" : "down",
    };
  }

  const change = ((currentValue - previousValue) / previousValue) * 100;
  return {
    value: Number(Math.abs(change).toFixed(1)),
    trend: change >= 0 ? "up" : "down",
  };
};

export const adminDashboard = async (req, res) => {
  const now = new Date();
  const currentMonth = getMonthRange(now);
  const previousMonth = getMonthRange(
    new Date(now.getFullYear(), now.getMonth() - 1, 1)
  );

  const [
    totalStudents,
    totalRooms,
    complaints,
    resolvedComplaints,
    payments,
    currentMonthStudents,
    previousMonthStudents,
    currentMonthPayments,
    previousMonthPayments,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Room.countDocuments(),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: "resolved" }),
    Payment.countDocuments(),
    User.countDocuments({
      role: "student",
      createdAt: { $gte: currentMonth.start, $lt: currentMonth.end },
    }),
    User.countDocuments({
      role: "student",
      createdAt: { $gte: previousMonth.start, $lt: previousMonth.end },
    }),
    Payment.countDocuments({
      createdAt: { $gte: currentMonth.start, $lt: currentMonth.end },
    }),
    Payment.countDocuments({
      createdAt: { $gte: previousMonth.start, $lt: previousMonth.end },
    }),
  ]);

  const studentTrend = calculateTrend(currentMonthStudents, previousMonthStudents);
  const paymentTrend = calculateTrend(currentMonthPayments, previousMonthPayments);
  const complaintResolutionRate =
    complaints > 0 ? Number(((resolvedComplaints / complaints) * 100).toFixed(1)) : 0;

  res.json({
    success: true,
    data: {
      totalStudents,
      totalRooms,
      complaints,
      payments,
      complaintResolutionRate,
      studentTrend,
      paymentTrend,
    }
  });

};

const parseAnnouncementMessage = (value = "") => {
  const full = String(value || "").trim();
  const [titleLine, ...rest] = full.split("\n\n");
  const title = (titleLine || "Announcement").trim();
  const message = (rest.length ? rest.join("\n\n") : full).trim();

  return {
    title,
    message: message || title,
  };
};

const buildRoomAvailability = (rooms = []) => {
  const counters = {
    single: { available: 0, total: 0 },
    double: { available: 0, total: 0 },
  };

  rooms.forEach((room) => {
    const type = String(room.roomType || "").toLowerCase();
    if (type === "single") {
      counters.single.total += 1;
      if ((room.status || "") === "available" && Number(room.occupiedCount || 0) < Number(room.capacity || 0)) {
        counters.single.available += 1;
      }
    }

    if (type === "double") {
      counters.double.total += 1;
      if ((room.status || "") === "available" && Number(room.occupiedCount || 0) < Number(room.capacity || 0)) {
        counters.double.available += 1;
      }
    }
  });

  return {
    singleRooms: counters.single,
    doubleRooms: counters.double,
  };
};

export const wardenDashboard = async (req, res) => {
  const managedHostels = await Hostel.find({ wardenId: req.user._id }).select("_id").lean();
  const managedHostelIds = managedHostels.map((hostel) => hostel._id);

  if (!managedHostelIds.length) {
    return res.json({
      success: true,
      data: {
        totalRooms: 0,
        totalCapacity: 0,
        occupiedRooms: 0,
        pendingComplaints: 0,
        studentsOnLeave: 0,
        recentActivity: [],
        announcements: [],
        roomAvailability: {
          singleRooms: { available: 0, total: 0 },
          doubleRooms: { available: 0, total: 0 },
        },
      },
    });
  }

  const [
    roomDocs,
    pendingComplaints,
    pendingVacateRequests,
    recentAllocations,
    recentVacates,
    announcementDocs,
  ] = await Promise.all([
    Room.find({ hostelId: { $in: managedHostelIds } }, { roomType: 1, capacity: 1, occupiedCount: 1, status: 1 }).lean(),
    Complaint.countDocuments({ status: "pending", hostelId: { $in: managedHostelIds } }),
    VacateRequest.countDocuments({ status: "pending", hostelId: { $in: managedHostelIds } }),
    RoomAllocation.find({ status: "active", hostelId: { $in: managedHostelIds } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate({ path: "studentId", select: "name" })
      .populate({ path: "roomId", select: "roomNumber" })
      .lean(),
    VacateRequest.find({ status: "approved", hostelId: { $in: managedHostelIds } })
      .sort({ processedAt: -1, updatedAt: -1 })
      .limit(8)
      .populate({ path: "studentId", select: "name" })
      .populate({ path: "roomId", select: "roomNumber" })
      .lean(),
    Notification.find({
      userId: req.user._id,
      isDeleted: { $ne: true },
      type: { $regex: "^system:(warden|both):", $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const totalRooms = roomDocs.length;
  const totalCapacity = roomDocs.reduce((sum, room) => sum + Number(room.capacity || 0), 0);
  const occupiedRooms = roomDocs.filter((room) => Number(room.occupiedCount || 0) > 0).length;

  const checkInActivity = recentAllocations.map((row) => ({
    studentName: row.studentId?.name || "Student",
    roomNumber: row.roomId?.roomNumber || "-",
    status: "CHECK-IN",
    time: row.updatedAt || row.createdAt,
  }));

  const checkOutActivity = recentVacates.map((row) => ({
    studentName: row.studentId?.name || "Student",
    roomNumber: row.roomId?.roomNumber || "-",
    status: "CHECK-OUT",
    time: row.processedAt || row.updatedAt || row.createdAt,
  }));

  const recentActivity = [...checkInActivity, ...checkOutActivity]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 10);

  const announcements = announcementDocs.map((row) => {
    const parsed = parseAnnouncementMessage(row.message);
    return {
      title: parsed.title,
      message: parsed.message,
      createdAt: row.createdAt,
    };
  });

  return res.json({
    success: true,
    data: {
      totalRooms,
      totalCapacity,
      occupiedRooms,
      pendingComplaints,
      studentsOnLeave: pendingVacateRequests,
      recentActivity,
      announcements,
      roomAvailability: buildRoomAvailability(roomDocs),
    },
  });
};

export const occupancyReport = async (req, res) => {

  const rooms = await Room.find();

  const report = rooms.map(room => ({

    roomNumber: room.roomNumber,
    capacity: room.capacity,
    occupied: room.occupied

  }));

  res.json({
    success: true,
    data: report
  });

};

export const paymentReport = async (req, res) => {

  const payments = await Payment.find();

  const totalRevenue = payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  res.json({
    success: true,
    totalRevenue,
    payments
  });

};

export const complaintReport = async (req, res) => {

  const complaints = await Complaint.find();

  res.json({
    success: true,
    data: complaints
  });

};

export const messReport = async (req, res) => {
  await expireSubscriptionsAndNotify();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const trendEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    totalStudentsAgg,
    grossRevenueAgg,
    subscriptionStatsAgg,
    monthlyRevenueTrendAgg,
    pendingRefundsAgg,
    currentMonthRevenueAgg,
    totalPlansAgg,
    totalRefundsAgg,
    totalRefundedAmountAgg,
    monthlyRefundTrendAgg,
  ] = await Promise.all([
    User.aggregate([
      { $match: { role: "student" } },
      { $count: "total" },
    ]),
    Payment.aggregate([
      {
        $match: {
          type: "mess",
          status: "success",
          purpose: { $ne: "Mess Refund" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    MessSubscription.aggregate([
      {
        $group: {
          _id: null,
          active: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
          expired: {
            $sum: {
              $cond: [{ $eq: ["$status", "expired"] }, 1, 0],
            },
          },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          type: "mess",
          status: "success",
          purpose: { $ne: "Mess Refund" },
          createdAt: {
            $gte: trendStart,
            $lt: trendEnd,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
    MessSubscription.aggregate([
      {
        $match: {
          "refund.requested": true,
          "refund.approved": false,
        },
      },
      { $count: "total" },
    ]),
    Payment.aggregate([
      {
        $match: {
          type: "mess",
          status: "success",
          purpose: { $ne: "Mess Refund" },
          createdAt: {
            $gte: startOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    MessPlan.aggregate([{ $count: "total" }]),
    MessSubscription.aggregate([
      {
        $match: {
          $or: [
            { "refund.status": "approved" },
            { "refund.status": "refunded" },
            { "refund.approved": true },
            { status: "refund_approved" },
          ],
        },
      },
      { $count: "total" },
    ]),
    MessSubscription.aggregate([
      {
        $match: {
          $or: [
            { "refund.status": "approved" },
            { "refund.status": "refunded" },
            { "refund.approved": true },
            { status: "refund_approved" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$refund.amount", 0] } },
        },
      },
    ]),
    MessSubscription.aggregate([
      {
        $match: {
          $or: [
            { "refund.status": "approved" },
            { "refund.status": "refunded" },
            { "refund.approved": true },
            { status: "refund_approved" },
          ],
          $expr: {
            $and: [
              {
                $gte: [
                  { $ifNull: ["$refund.processedAt", "$updatedAt"] },
                  trendStart,
                ],
              },
              {
                $lt: [
                  { $ifNull: ["$refund.processedAt", "$updatedAt"] },
                  trendEnd,
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: {
                $ifNull: ["$refund.processedAt", "$updatedAt"],
              },
            },
            month: {
              $month: {
                $ifNull: ["$refund.processedAt", "$updatedAt"],
              },
            },
          },
          amount: { $sum: { $ifNull: ["$refund.amount", 0] } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
  ]);

  const totalStudents = totalStudentsAgg[0]?.total || 0;
  const totalRevenue = grossRevenueAgg[0]?.total || 0;
  const activeSubscriptions = subscriptionStatsAgg[0]?.active || 0;
  const expiredSubscriptions = subscriptionStatsAgg[0]?.expired || 0;
  const pendingRefundRequests = pendingRefundsAgg[0]?.total || 0;
  const monthlyRevenue = currentMonthRevenueAgg[0]?.total || 0;
  const totalPlans = totalPlansAgg[0]?.total || 0;
  const totalRefundsCount = totalRefundsAgg[0]?.total || 0;
  const totalRefundedAmount = totalRefundedAmountAgg[0]?.total || 0;
  const netRevenue = totalRevenue - totalRefundedAmount;

  const monthlyRevenueTrend = monthlyRevenueTrendAgg.map((item) => {
    const month = String(item._id.month).padStart(2, "0");
    return {
      month: `${item._id.year}-${month}`,
      revenue: item.revenue,
    };
  });

  const monthlyRefundTrend = monthlyRefundTrendAgg.map((item) => {
    const month = String(item._id.month).padStart(2, "0");
    return {
      month: `${item._id.year}-${month}`,
      refundedAmount: item.amount,
      refundCount: item.count,
    };
  });

  res.json({
    success: true,
    data: {
      totalStudents,
      totalPlans,
      totalRevenue,
      netRevenue,
      activeSubscriptions,
      expiredSubscriptions,
      subscriptions: {
        active: activeSubscriptions,
        expired: expiredSubscriptions,
      },
      monthlyRevenueTrend,
      monthlyRefundTrend,
      totalRefundsCount,
      totalRefundedAmount,
      // Legacy fields kept for current frontend compatibility.
      pendingRefundRequests,
      monthlyRevenue,
    },
  });
};

export const hostelStudentsReport = async (req, res) => {
  try {
    const hostels = await Hostel.find()
      .select("_id name type")
      .sort({ name: 1 })
      .lean();

    const allocations = await RoomAllocation.find({
      status: "active",
    })
      .populate({
        path: "studentId",
        select: "name email phone enrollmentNo gender isActive",
      })
      .populate({
        path: "hostelId",
        select: "name type",
      })
      .populate({
        path: "roomId",
        select: "roomNumber roomType status",
      })
      .sort({ createdAt: -1 })
      .lean();

    const hostelMap = new Map(
      hostels.map((hostel) => [
        hostel._id.toString(),
        {
          hostelId: hostel._id,
          hostelName: hostel.name,
          hostelType: hostel.type,
          totalStudents: 0,
          students: [],
        },
      ])
    );

    allocations.forEach((allocation) => {
      const hostel = allocation.hostelId;
      const student = allocation.studentId;

      if (!hostel || !student) return;

      const hostelKey = hostel._id.toString();
      if (!hostelMap.has(hostelKey)) {
        hostelMap.set(hostelKey, {
          hostelId: hostel._id,
          hostelName: hostel.name,
          hostelType: hostel.type,
          totalStudents: 0,
          students: [],
        });
      }

      const currentHostel = hostelMap.get(hostelKey);
      currentHostel.students.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        enrollmentNo: student.enrollmentNo,
        gender: student.gender,
        isActive: student.isActive,
        roomNumber: allocation.roomId?.roomNumber || null,
        roomType: allocation.roomId?.roomType || null,
        roomStatus: allocation.roomId?.status || null,
        allocatedAt: allocation.allocatedAt,
      });
    });

    const data = Array.from(hostelMap.values())
      .map((hostel) => {
        const seenStudentIds = new Set();
        const uniqueStudents = hostel.students.filter((student) => {
          const studentKey = student.studentId?.toString();
          if (!studentKey || seenStudentIds.has(studentKey)) return false;
          seenStudentIds.add(studentKey);
          return true;
        });

        return {
          ...hostel,
          totalStudents: uniqueStudents.length,
          students: uniqueStudents.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          ),
        };
      })
      .sort((a, b) => a.hostelName.localeCompare(b.hostelName));

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const wardenHostelStudentsReport = async (req, res) => {
  try {
    const wardenId = req.user?._id;

    const hostels = await Hostel.find({ wardenId })
      .select("_id name type")
      .sort({ name: 1 })
      .lean();

    const allowedHostelIds = hostels.map((hostel) => hostel._id);

    if (allowedHostelIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const allocations = await RoomAllocation.find({
      status: "active",
      hostelId: { $in: allowedHostelIds },
    })
      .populate({
        path: "studentId",
        select: "name email phone enrollmentNo gender isActive",
      })
      .populate({
        path: "hostelId",
        select: "name type",
      })
      .populate({
        path: "roomId",
        select: "roomNumber roomType status",
      })
      .sort({ createdAt: -1 })
      .lean();

    const hostelMap = new Map(
      hostels.map((hostel) => [
        hostel._id.toString(),
        {
          hostelId: hostel._id,
          hostelName: hostel.name,
          hostelType: hostel.type,
          totalStudents: 0,
          students: [],
        },
      ])
    );

    allocations.forEach((allocation) => {
      const hostel = allocation.hostelId;
      const student = allocation.studentId;

      if (!hostel || !student) return;

      const hostelKey = hostel._id.toString();
      if (!hostelMap.has(hostelKey)) {
        hostelMap.set(hostelKey, {
          hostelId: hostel._id,
          hostelName: hostel.name,
          hostelType: hostel.type,
          totalStudents: 0,
          students: [],
        });
      }

      const currentHostel = hostelMap.get(hostelKey);
      currentHostel.students.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        enrollmentNo: student.enrollmentNo,
        gender: student.gender,
        isActive: student.isActive,
        roomNumber: allocation.roomId?.roomNumber || null,
        roomType: allocation.roomId?.roomType || null,
        roomStatus: allocation.roomId?.status || null,
        allocatedAt: allocation.allocatedAt,
      });
    });

    const data = Array.from(hostelMap.values())
      .map((hostel) => {
        const seenStudentIds = new Set();
        const uniqueStudents = hostel.students.filter((student) => {
          const studentKey = student.studentId?.toString();
          if (!studentKey || seenStudentIds.has(studentKey)) return false;
          seenStudentIds.add(studentKey);
          return true;
        });

        return {
          ...hostel,
          totalStudents: uniqueStudents.length,
          students: uniqueStudents.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          ),
        };
      })
      .sort((a, b) => a.hostelName.localeCompare(b.hostelName));

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const hostelAdminAnalytics = async (req, res) => {
  try {
    const { from, to, hostelId, blockId } = req.query;
    const { start, end } = normalizeDateRange(from, to);

    const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const granularity = dayDiff > 60 ? "month" : "day";

    const roomMatch = {};
    const allocationMatch = {};
    const requestMatch = { createdAt: { $gte: start, $lte: end } };
    const paymentMatch = {
      createdAt: { $gte: start, $lte: end },
      type: { $in: ["hostel", "room_request"] },
    };

    if (hostelId) {
      roomMatch.hostelId = toObjectId(hostelId);
      allocationMatch.hostelId = toObjectId(hostelId);
      requestMatch.hostelId = toObjectId(hostelId);
    }

    if (blockId) {
      roomMatch.blockId = toObjectId(blockId);
      allocationMatch.roomId = {
        $in: (await Room.find({ blockId: toObjectId(blockId) }).select("_id").lean()).map(
          (room) => room._id
        ),
      };
      requestMatch.roomId = {
        $in: (await Room.find({ blockId: toObjectId(blockId) }).select("_id").lean()).map(
          (room) => room._id
        ),
      };
    }

    const [totalCapacityAgg, occupiedNowAgg, blockOccupancyAgg, roomRequestAgg, paymentAgg] =
      await Promise.all([
        Room.aggregate([
          { $match: roomMatch },
          { $group: { _id: null, totalCapacity: { $sum: "$capacity" } } },
        ]),
        Room.aggregate([
          { $match: roomMatch },
          { $group: { _id: null, occupiedBeds: { $sum: "$occupiedCount" } } },
        ]),
        Room.aggregate([
          { $match: roomMatch },
          {
            $group: {
              _id: "$blockId",
              totalCapacity: { $sum: "$capacity" },
              occupiedBeds: { $sum: "$occupiedCount" },
            },
          },
          {
            $lookup: {
              from: "blocks",
              localField: "_id",
              foreignField: "_id",
              as: "block",
            },
          },
          { $unwind: { path: "$block", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              blockId: "$_id",
              blockName: { $ifNull: ["$block.name", "Unknown Block"] },
              totalCapacity: 1,
              occupiedBeds: 1,
              occupancyPct: {
                $cond: [
                  { $gt: ["$totalCapacity", 0] },
                  {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$occupiedBeds", "$totalCapacity"] },
                          100,
                        ],
                      },
                      1,
                    ],
                  },
                  0,
                ],
              },
            },
          },
          { $sort: { occupancyPct: -1, blockName: 1 } },
        ]),
        RoomRequest.aggregate([
          { $match: requestMatch },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        Payment.aggregate([
          { $match: paymentMatch },
          {
            $project: {
              amount: 1,
              status: 1,
              bucket: {
                $dateToString: {
                  format: granularity === "month" ? "%Y-%m" : "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
            },
          },
          {
            $group: {
              _id: "$bucket",
              collected: {
                $sum: {
                  $cond: [{ $eq: ["$status", "success"] }, "$amount", 0],
                },
              },
              dues: {
                $sum: {
                  $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const totalCapacity = totalCapacityAgg[0]?.totalCapacity || 0;
    const occupiedNow = occupiedNowAgg[0]?.occupiedBeds || 0;
    const currentOccupancyPct =
      totalCapacity > 0 ? Number(((occupiedNow / totalCapacity) * 100).toFixed(1)) : 0;

    const buckets = getBuckets(start, end, granularity);

    const activeBeforeStart = await RoomAllocation.countDocuments({
      ...allocationMatch,
      allocatedAt: { $lt: start },
      $or: [{ vacatedAt: null }, { vacatedAt: { $gte: start } }],
    });

    const [allocatedEvents, vacatedEvents] = await Promise.all([
      RoomAllocation.aggregate([
        {
          $match: {
            ...allocationMatch,
            allocatedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: granularity === "month" ? "%Y-%m" : "%Y-%m-%d",
                date: "$allocatedAt",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      RoomAllocation.aggregate([
        {
          $match: {
            ...allocationMatch,
            vacatedAt: { $ne: null, $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: granularity === "month" ? "%Y-%m" : "%Y-%m-%d",
                date: "$vacatedAt",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const allocatedMap = new Map(allocatedEvents.map((item) => [item._id, item.count]));
    const vacatedMap = new Map(vacatedEvents.map((item) => [item._id, item.count]));
    const paymentMap = new Map(paymentAgg.map((item) => [item._id, item]));

    let runningOccupied = activeBeforeStart;

    const occupancyTrend = buckets.map((bucket) => {
      const allocated = allocatedMap.get(bucket.key) || 0;
      const vacated = vacatedMap.get(bucket.key) || 0;
      runningOccupied = Math.max(0, runningOccupied + allocated - vacated);

      const occupancyPct =
        totalCapacity > 0 ? Number(((runningOccupied / totalCapacity) * 100).toFixed(1)) : 0;

      return {
        key: bucket.key,
        label: bucket.label,
        occupiedBeds: runningOccupied,
        totalBeds: totalCapacity,
        occupancyPct,
      };
    });

    const paymentTrend = buckets.map((bucket) => {
      const point = paymentMap.get(bucket.key);
      const collected = point?.collected || 0;
      const dues = point?.dues || 0;
      const collectionEfficiency = dues > 0
        ? Number(((collected / (collected + dues)) * 100).toFixed(1))
        : collected > 0
          ? 100
          : 0;

      return {
        key: bucket.key,
        label: bucket.label,
        collected,
        dues,
        collectionEfficiency,
      };
    });

    const funnelBase = {
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
    };

    roomRequestAgg.forEach((item) => {
      const status = item._id;
      if (status === "approved") funnelBase.approved = item.count;
      if (status === "rejected") funnelBase.rejected = item.count;
      if (status === "pending") funnelBase.pending = item.count;
    });

    funnelBase.total = funnelBase.approved + funnelBase.rejected + funnelBase.pending;

    const funnelRates = {
      approvalRate: funnelBase.total
        ? Number(((funnelBase.approved / funnelBase.total) * 100).toFixed(1))
        : 0,
      rejectionRate: funnelBase.total
        ? Number(((funnelBase.rejected / funnelBase.total) * 100).toFixed(1))
        : 0,
      pendingRate: funnelBase.total
        ? Number(((funnelBase.pending / funnelBase.total) * 100).toFixed(1))
        : 0,
    };

    res.json({
      success: true,
      data: {
        filters: {
          from: start,
          to: end,
          hostelId: hostelId || null,
          blockId: blockId || null,
          granularity,
        },
        kpis: {
          totalBeds: totalCapacity,
          occupiedBeds: occupiedNow,
          occupancyPct: currentOccupancyPct,
          pendingRequests: funnelBase.pending,
          totalDues: paymentTrend.reduce((sum, item) => sum + item.dues, 0),
        },
        occupancyTrend,
        blockWiseOccupancy: blockOccupancyAgg,
        roomRequestFunnel: {
          ...funnelBase,
          ...funnelRates,
        },
        paymentsAndDuesTrend: paymentTrend,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};