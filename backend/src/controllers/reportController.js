import User from "../models/User.js";
import Room from "../models/Room.js";
import Complaint from "../models/Complaint.js";
import Payment from "../models/Payment.js";
import MessSubscription from "../models/MessSubscription.js";
import Hostel from "../models/Hostel.js";
import RoomAllocation from "../models/RoomAllocation.js";

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

export const adminDashboard = async(req,res)=>{
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
    success:true,
    data:{
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

export const wardenDashboard = async(req,res)=>{

  const complaints = await Complaint.countDocuments({
    status:"pending"
  });

  const rooms = await Room.countDocuments();

  res.json({
    success:true,
    data:{
      complaints,
      rooms
    }
  });

};

export const occupancyReport = async(req,res)=>{

  const rooms = await Room.find();

  const report = rooms.map(room=>({

    roomNumber:room.roomNumber,
    capacity:room.capacity,
    occupied:room.occupied

  }));

  res.json({
    success:true,
    data:report
  });

};

export const paymentReport = async(req,res)=>{

  const payments = await Payment.find();

  const totalRevenue = payments.reduce(
    (sum,p)=>sum+p.amount,
    0
  );

  res.json({
    success:true,
    totalRevenue,
    payments
  });

};

export const complaintReport = async(req,res)=>{

  const complaints = await Complaint.find();

  res.json({
    success:true,
    data:complaints
  });

};

export const messReport = async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [activeSubscriptions, totalPlans, pendingRefundRequests, revenueResult] = await Promise.all([
    MessSubscription.countDocuments({ status: "active" }),
    MessPlan.countDocuments(),
    MessSubscription.countDocuments({ "refund.requested": true, "refund.approved": false }),
    Payment.aggregate([
      {
        $match: {
          type: "mess",
          status: "success",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const monthlyRevenue = revenueResult[0]?.total ?? 0;

  res.json({
    success: true,
    data: {
      activeSubscriptions,
      totalPlans,
      pendingRefundRequests,
      monthlyRevenue,
    },
  });
};

export const hostelStudentsReport = async (req, res) => {
  try {
    const [hostels, allocations] = await Promise.all([
      Hostel.find().select("_id name type").sort({ name: 1 }).lean(),
      RoomAllocation.find({ status: "active" })
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
        .lean(),
    ]);

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