import Complaint from "../models/Complaint.js";
import Hostel from "../models/Hostel.js";
import RoomAllocation from "../models/RoomAllocation.js";

const emitWardenUpdate = (req) => {
  const io = req.app.get("io");
  if (!io) return;
  io.emit("warden_update", {
    source: "complaint",
    at: new Date().toISOString(),
  });
};

const roomPopulateConfig = {
  path: "roomId",
  select: "roomNumber blockId",
  populate: {
    path: "blockId",
    select: "name",
  },
};

export const createComplaint = async (req, res) => {

  try {

    const activeAllocation = await RoomAllocation.findOne({
      studentId: req.user._id,
      status: "active",
    })
      .select("hostelId roomId")
      .lean();

    const complaint = await Complaint.create({
      ...req.body,
      studentId: req.user._id,
      hostelId: activeAllocation?.hostelId || req.body.hostelId,
      roomId: activeAllocation?.roomId || req.body.roomId,
    });

    res.status(201).json({
      success: true,
      data: complaint
    });

    emitWardenUpdate(req);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const getComplaints = async (req, res) => {

  try {

    let filter = {};

    if (req.user.role === "student") {
      filter.studentId = req.user._id;
    }

    if (req.user.role === "warden") {
      const managedHostels = await Hostel.find({ wardenId: req.user._id }).select("_id").lean();
      const managedHostelIds = managedHostels.map((hostel) => hostel._id);

      if (!managedHostelIds.length) {
        return res.json({ success: true, data: [] });
      }

      const managedStudentIds = await RoomAllocation.distinct("studentId", {
        hostelId: { $in: managedHostelIds },
        status: "active",
      });

      filter = {
        ...filter,
        $or: [
          { hostelId: { $in: managedHostelIds } },
        ],
      };

      if (managedStudentIds.length) {
        filter.$or.push({ studentId: { $in: managedStudentIds } });
      }
    }

    const complaints = await Complaint.find(filter)
      .populate("studentId", "name email")
      .populate(roomPopulateConfig);

    res.json({
      success: true,
      data: complaints
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const getComplaintById = async (req, res) => {

  try {

    const complaint = await Complaint.findById(req.params.id)
      .populate("studentId", "name email")
      .populate(roomPopulateConfig);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      success: true,
      data: complaint
    });

    emitWardenUpdate(req);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const updateComplaintStatus = async (req, res) => {

  try {

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = req.body.status;
    complaint.remark = req.body.remark;

    await complaint.save();

    await complaint.populate("studentId", "name email");
    await complaint.populate(roomPopulateConfig);

    res.json({
      success: true,
      data: complaint
    });

    emitWardenUpdate(req);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const resolveComplaint = async (req, res) => {

  try {

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "resolved";
    complaint.resolvedAt = new Date();

    await complaint.save();

    res.json({
      success: true,
      message: "Complaint resolved"
    });

    emitWardenUpdate(req);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const deleteComplaint = async (req, res) => {

  try {

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.studentId.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await complaint.deleteOne();

    res.json({
      success: true,
      message: "Complaint deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};