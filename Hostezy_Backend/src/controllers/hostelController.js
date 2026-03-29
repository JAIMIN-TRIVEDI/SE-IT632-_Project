import Hostel from "../models/Hostel.js";

export const createHostel = async(req,res)=>{

  try{

    const hostel = await Hostel.create(req.body);

    res.status(201).json({
      success:true,
      data:hostel
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const getHostels = async(req,res)=>{

  try{

    const hostels = await Hostel.find().populate("wardenId","name email");

    res.json({
      success:true,
      data:hostels
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const getHostelById = async(req,res)=>{

  try{

    const hostel = await Hostel.findById(req.params.id)
    .populate("wardenId","name email");

    if(!hostel){
      return res.status(404).json({message:"Hostel not found"});
    }

    res.json({
      success:true,
      data:hostel
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const updateHostel = async (req, res) => {

  try {

    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: hostel
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const deleteHostel = async (req, res) => {

  try {

    await Hostel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Hostel deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const assignWarden = async (req, res) => {
  try {

    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    hostel.wardenId = req.body.wardenId;

    await hostel.save();

    res.json({
      success: true,
      message: "Warden assigned successfully",
      data: hostel
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};