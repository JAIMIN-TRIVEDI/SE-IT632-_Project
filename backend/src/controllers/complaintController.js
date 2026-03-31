import Complaint from "../models/Complaint.js";

export const createComplaint = async(req,res)=>{

  try{

    const complaint = await Complaint.create({
      ...req.body,
      studentId:req.user._id,
      hostelId:req.user.hostelId,
      roomId:req.user.roomId
    });

    res.status(201).json({
      success:true,
      data:complaint
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }

};

export const getComplaints = async(req,res)=>{

  try{

    let filter={};

    if(req.user.role==="student"){
      filter.studentId=req.user._id;
    }

    const complaints = await Complaint.find(filter)
    .populate("studentId","name email");

    res.json({
      success:true,
      data:complaints
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }

};

export const getComplaintById = async(req,res)=>{

  try{

    const complaint = await Complaint.findById(req.params.id)
    .populate("studentId","name email");

    if(!complaint){
      return res.status(404).json({message:"Complaint not found"});
    }

    res.json({
      success:true,
      data:complaint
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }

};

export const updateComplaintStatus = async(req,res)=>{

  try{

    const complaint = await Complaint.findById(req.params.id);

    if(!complaint){
      return res.status(404).json({message:"Complaint not found"});
    }

    complaint.status=req.body.status;
    complaint.remark=req.body.remark;

    await complaint.save();

    res.json({
      success:true,
      data:complaint
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }

};

export const resolveComplaint = async(req,res)=>{

  try{

    const complaint = await Complaint.findById(req.params.id);

    if(!complaint){
      return res.status(404).json({message:"Complaint not found"});
    }

    complaint.status="resolved";
    complaint.resolvedAt=new Date();

    await complaint.save();

    res.json({
      success:true,
      message:"Complaint resolved"
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }

};

export const deleteComplaint = async(req,res)=>{

  try{

    const complaint = await Complaint.findById(req.params.id);

    if(!complaint){
      return res.status(404).json({message:"Complaint not found"});
    }

    if(!complaint.studentId.equals(req.user._id)){
      return res.status(403).json({message:"Not allowed"});
    }

    await complaint.deleteOne();

    res.json({
      success:true,
      message:"Complaint deleted"
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }

};