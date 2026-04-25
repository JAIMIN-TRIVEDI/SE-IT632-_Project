import { jest } from "@jest/globals";

const Complaint = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

const Hostel = {
  find: jest.fn(),
};

const RoomAllocation = {
  findOne: jest.fn(),
  distinct: jest.fn(),
};

jest.unstable_mockModule("../../backend/src/models/Complaint.js", () => ({ default: Complaint }));
jest.unstable_mockModule("../../backend/src/models/Hostel.js", () => ({ default: Hostel }));
jest.unstable_mockModule("../../backend/src/models/RoomAllocation.js", () => ({ default: RoomAllocation }));

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  resolveComplaint,
  deleteComplaint,
} = await import("../../backend/src/controllers/complaintController.js");

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const makeLeanSelectQuery = (value) => {
  const query = {
    select: jest.fn(() => query),
    lean: jest.fn().mockResolvedValue(value),
  };
  return query;
};

const makePopulateAwaitableQuery = (value) => {
  const query = {
    populate: jest.fn(() => query),
    then: (onFulfilled, onRejected) => Promise.resolve(value).then(onFulfilled, onRejected),
    catch: (onRejected) => Promise.resolve(value).catch(onRejected),
  };
  return query;
};

const makePopulateRejectQuery = (error) => {
  const query = {
    populate: jest.fn(() => query),
    then: (onFulfilled, onRejected) => Promise.reject(error).then(onFulfilled, onRejected),
    catch: (onRejected) => Promise.reject(error).catch(onRejected),
  };
  return query;
};

describe("complaintController", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    res = makeRes();
    req = {
      user: { _id: "student1", role: "student" },
      body: { title: "Water leak", description: "Tap leaking", hostelId: "h-body", roomId: "r-body" },
      params: { id: "c1" },
      app: { get: jest.fn().mockReturnValue({ emit: jest.fn() }) },
    };

    RoomAllocation.findOne.mockImplementation(() => makeLeanSelectQuery(null));
    Hostel.find.mockImplementation(() => makeLeanSelectQuery([]));
    Complaint.find.mockImplementation(() => makePopulateAwaitableQuery([]));
    Complaint.findById.mockResolvedValue(null);
    RoomAllocation.distinct.mockResolvedValue([]);
    Complaint.create.mockResolvedValue({ _id: "c1" });
  });

  describe("createComplaint", () => {
    test("creates complaint using active allocation details and emits update", async () => {
      RoomAllocation.findOne.mockImplementationOnce(() =>
        makeLeanSelectQuery({ hostelId: "h-active", roomId: "r-active" })
      );

      await createComplaint(req, res);

      expect(Complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: "student1",
          hostelId: "h-active",
          roomId: "r-active",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: "c1" } });
      expect(req.app.get).toHaveBeenCalledWith("io");
    });

    test("falls back to body hostelId and roomId when no active allocation", async () => {
      await createComplaint(req, res);

      expect(Complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hostelId: "h-body",
          roomId: "r-body",
        })
      );
    });

    test("does not emit when io is not available", async () => {
      req.app.get.mockReturnValueOnce(null);

      await createComplaint(req, res);

      expect(req.app.get).toHaveBeenCalledWith("io");
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("returns 500 when creation fails", async () => {
      Complaint.create.mockRejectedValueOnce(new Error("create failed"));

      await createComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "create failed" });
    });
  });

  describe("getComplaints", () => {
    test("filters by student id for student role", async () => {
      Complaint.find.mockImplementationOnce(() => makePopulateAwaitableQuery([{ _id: "c1" }]));

      await getComplaints(req, res);

      expect(Complaint.find).toHaveBeenCalledWith({ studentId: "student1" });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ _id: "c1" }] });
    });

    test("returns empty data for warden with no managed hostels", async () => {
      req.user = { _id: "warden1", role: "warden" };
      Hostel.find.mockImplementationOnce(() => makeLeanSelectQuery([]));

      await getComplaints(req, res);

      expect(RoomAllocation.distinct).not.toHaveBeenCalled();
      expect(Complaint.find).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
    });

    test("builds warden filter with managed students when present", async () => {
      req.user = { _id: "warden1", role: "warden" };
      Hostel.find.mockImplementationOnce(() => makeLeanSelectQuery([{ _id: "h1" }, { _id: "h2" }]));
      RoomAllocation.distinct.mockResolvedValueOnce(["student1", "student2"]);
      Complaint.find.mockImplementationOnce(() => makePopulateAwaitableQuery([{ _id: "c2" }]));

      await getComplaints(req, res);

      expect(Complaint.find).toHaveBeenCalledWith({
        $or: [
          { hostelId: { $in: ["h1", "h2"] } },
          { studentId: { $in: ["student1", "student2"] } },
        ],
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ _id: "c2" }] });
    });

    test("builds warden filter without student condition when distinct is empty", async () => {
      req.user = { _id: "warden1", role: "warden" };
      Hostel.find.mockImplementationOnce(() => makeLeanSelectQuery([{ _id: "h1" }]));
      RoomAllocation.distinct.mockResolvedValueOnce([]);
      Complaint.find.mockImplementationOnce(() => makePopulateAwaitableQuery([{ _id: "c3" }]));

      await getComplaints(req, res);

      expect(Complaint.find).toHaveBeenCalledWith({
        $or: [{ hostelId: { $in: ["h1"] } }],
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ _id: "c3" }] });
    });

    test("returns 500 on unexpected error", async () => {
      Complaint.find.mockImplementationOnce(() => {
        throw new Error("find failed");
      });

      await getComplaints(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "find failed" });
    });
  });

  describe("getComplaintById", () => {
    test("returns complaint when found and emits update", async () => {
      Complaint.findById.mockImplementationOnce(() => makePopulateAwaitableQuery({ _id: "c1" }));

      await getComplaintById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: "c1" } });
      expect(req.app.get).toHaveBeenCalledWith("io");
    });

    test("returns 404 when complaint is missing", async () => {
      Complaint.findById.mockImplementationOnce(() => makePopulateAwaitableQuery(null));

      await getComplaintById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Complaint not found" });
    });

    test("returns 500 on error", async () => {
      Complaint.findById.mockImplementationOnce(() => makePopulateRejectQuery(new Error("bad id")));

      await getComplaintById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "bad id" });
    });
  });

  describe("updateComplaintStatus", () => {
    test("updates complaint status and remark", async () => {
      const complaintDoc = {
        status: "pending",
        remark: "",
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true),
      };
      req.body = { status: "in_progress", remark: "Working on it" };
      Complaint.findById.mockResolvedValueOnce(complaintDoc);

      await updateComplaintStatus(req, res);

      expect(complaintDoc.status).toBe("in_progress");
      expect(complaintDoc.remark).toBe("Working on it");
      expect(complaintDoc.save).toHaveBeenCalled();
      expect(complaintDoc.populate).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: complaintDoc });
    });

    test("returns 404 when complaint to update is missing", async () => {
      Complaint.findById.mockResolvedValueOnce(null);

      await updateComplaintStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Complaint not found" });
    });

    test("returns 500 when update fails", async () => {
      Complaint.findById.mockRejectedValueOnce(new Error("update failed"));

      await updateComplaintStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "update failed" });
    });
  });

  describe("resolveComplaint", () => {
    test("marks complaint resolved", async () => {
      const complaintDoc = {
        status: "open",
        resolvedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };
      Complaint.findById.mockResolvedValueOnce(complaintDoc);

      await resolveComplaint(req, res);

      expect(complaintDoc.status).toBe("resolved");
      expect(complaintDoc.resolvedAt).toBeInstanceOf(Date);
      expect(complaintDoc.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Complaint resolved" });
    });

    test("returns 404 when complaint to resolve is missing", async () => {
      Complaint.findById.mockResolvedValueOnce(null);

      await resolveComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Complaint not found" });
    });

    test("returns 500 when resolve fails", async () => {
      Complaint.findById.mockRejectedValueOnce(new Error("resolve failed"));

      await resolveComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "resolve failed" });
    });
  });

  describe("deleteComplaint", () => {
    test("returns 404 when complaint to delete is missing", async () => {
      Complaint.findById.mockResolvedValueOnce(null);

      await deleteComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Complaint not found" });
    });

    test("returns 403 when complaint does not belong to the current student", async () => {
      const complaintDoc = {
        studentId: { equals: jest.fn().mockReturnValue(false) },
      };
      Complaint.findById.mockResolvedValueOnce(complaintDoc);

      await deleteComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Not allowed" });
    });

    test("deletes complaint when complaint belongs to current student", async () => {
      const complaintDoc = {
        studentId: { equals: jest.fn().mockReturnValue(true) },
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      Complaint.findById.mockResolvedValueOnce(complaintDoc);

      await deleteComplaint(req, res);

      expect(complaintDoc.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Complaint deleted" });
    });

    test("returns 500 when delete fails", async () => {
      Complaint.findById.mockRejectedValueOnce(new Error("delete failed"));

      await deleteComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "delete failed" });
    });
  });
});

