import VacateRequest from "../models/vacateRequest.js";


export const requestVacate = async(req,res)=>{

  const request = await VacateRequest.create({
    studentId:req.user._id,
    roomId:req.user.roomId,
    reason:req.body.reason
  });

  res.json({
    success:true,
    data:request
  });

};

export const approveVacate = async(req,res)=>{

  const request = await VacateRequest.findById(req.params.id);

  request.status="approved";

  await request.save();

  res.json({
    success:true
  });

};

export const rejectVacate = async(req,res)=>{

  const request = await VacateRequest.findById(req.params.id);

  request.status="rejected";

  await request.save();

  res.json({
    success:true
  });

};