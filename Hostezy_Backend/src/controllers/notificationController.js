import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const getNotifications = async(req,res)=>{

  const notifications = await Notification.find({
    userId:req.user._id
  }).sort({createdAt:-1});

  res.json({
    success:true,
    data:notifications
  });

};

export const markRead = async(req,res)=>{

  const notification = await Notification.findById(req.params.id);

  notification.isRead=true;

  await notification.save();

  res.json({
    success:true
  });

};

export const markAllRead = async(req,res)=>{

  await Notification.updateMany(
    {userId:req.user._id},
    {isRead:true}
  );

  res.json({
    success:true
  });

};

export const deleteNotification = async(req,res)=>{

  await Notification.findByIdAndDelete(req.params.id);

  res.json({
    success:true
  });

};

export const broadcastNotification = async(req,res)=>{

  const users = await User.find();

  const notifications = users.map(user=>({

    userId:user._id,
    title:req.body.title,
    message:req.body.message,
    type:"system"

  }));

  await Notification.insertMany(notifications);

  res.json({
    success:true,
    message:"Broadcast sent"
  });

};

export const getAllNotifications = async(req,res)=>{

  const notifications = await Notification.find()
  .populate("userId","name email");

  res.json({
    success:true,
    data:notifications
  });

};