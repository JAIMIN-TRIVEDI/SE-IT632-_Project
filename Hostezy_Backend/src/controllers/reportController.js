import User from "../models/User.js";
import Room from "../models/Room.js";
import Complaint from "../models/Complaint.js";
import Payment from "../models/Payment.js";
import MessSubscription from "../models/MessSubscription.js";

export const adminDashboard = async(req,res)=>{

  const totalStudents = await User.countDocuments({role:"student"});
  const totalRooms = await Room.countDocuments();
  const complaints = await Complaint.countDocuments();
  const payments = await Payment.countDocuments();

  res.json({
    success:true,
    data:{
      totalStudents,
      totalRooms,
      complaints,
      payments
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

export const messReport = async(req,res)=>{

  const subs = await MessSubscription.countDocuments({
    status:"active"
  });

  res.json({
    success:true,
    activeSubscriptions:subs
  });

};