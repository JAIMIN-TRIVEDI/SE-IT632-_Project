import { jest } from "@jest/globals";

const VacateRequest = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};

const RoomAllocation = {
  findOne: jest.fn(),
  findById: jest.fn(),
  distinct: jest.fn(),
};

const Room = {
  findById: jest.fn(),
};

const Hostel = {
  findById: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const Notification = {
  create: jest.fn(),
};

const startSessionMock = jest.fn();

jest.unstable_mockModule("../../backend/src/models/VacateRequest.js", () => ({ default: VacateRequest }));
jest.unstable_mockModule("../../backend/src/models/RoomAllocation.js", () => ({ default: RoomAllocation }));
jest.unstable_mockModule("../../backend/src/models/Room.js", () => ({ default: Room }));
jest.unstable_mockModule("../../backend/src/models/Hostel.js", () => ({ default: Hostel }));
jest.unstable_mockModule("../../backend/src/models/Notification.js", () => ({ default: Notification }));
jest.unstable_mockModule("mongoose", () => ({
  default: {
    startSession: startSessionMock,
  },
}));

const {
  requestVacate,
  getMyVacateRequest,
  getHostelAdminVacateRequests,
  approveVacate,
  rejectVacate,
} = await import("../../backend/src/controllers/vacateController.js");

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const makeSelectLeanQuery = (value) => {
  const query = {
    select: jest.fn(() => query),
    lean: jest.fn().mockResolvedValue(value),
  };
  return query;
};

const makePopulateLeanQuery = (value) => {
  const query = {
    populate: jest.fn(() => query),
    sort: jest.fn(() => query),
    lean: jest.fn().mockResolvedValue(value),
    then: (onFulfilled, onRejected) => Promise.resolve(value).then(onFulfilled, onRejected),
    catch: (onRejected) => Promise.resolve(value).catch(onRejected),
  };
  return query;
};

const makeSessionQuery = (value) => ({
  session: jest.fn().mockResolvedValue(value),
});

describe("vacateController", () => {
  let req;
  let res;
  let io;
  let session;

  beforeEach(() => {
    jest.clearAllMocks();

    io = { emit: jest.fn() };
    req = {
      body: { reason: "Leaving hostel" },
      params: { id: "v1" },
      user: { _id: "u1", name: "Student A" },
      app: { get: jest.fn().mockReturnValue(io) },
    };
    res = makeRes();

    session = {
      startTransaction: jest.fn(),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn(),
    };
    startSessionMock.mockResolvedValue(session);

    RoomAllocation.findOne.mockImplementation(() => makeSelectLeanQuery(null));
    VacateRequest.findOne.mockImplementation(() => makeSelectLeanQuery(null));
    VacateRequest.findById.mockResolvedValue(null);
    VacateRequest.find.mockImplementation(() => makePopulateLeanQuery([]));
    Hostel.find.mockImplementation(() => makeSelectLeanQuery([]));
    Hostel.findById.mockImplementation(() => makeSelectLeanQuery(null));
    Hostel.findOne.mockImplementation(() => makeSelectLeanQuery(null));
    Notification.create.mockResolvedValue(undefined);
  });

  describe("requestVacate", () => {
    test("returns 400 when reason is missing", async () => {
      req.body = { reason: "   " };

      await requestVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Reason is required." });
    });

    test("returns 400 when active allocation not found", async () => {
      await requestVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No active room allocation found." });
    });

    test("returns 400 when pending request already exists", async () => {
      RoomAllocation.findOne.mockImplementationOnce(() =>
        makeSelectLeanQuery({ _id: "a1", hostelId: "h1", roomId: "r1" })
      );
      VacateRequest.findOne.mockImplementationOnce(() => makeSelectLeanQuery({ _id: "vPending" }));

      await requestVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "You already have a pending vacate request." });
    });

    test("creates request and notification when warden exists", async () => {
      RoomAllocation.findOne.mockImplementationOnce(() =>
        makeSelectLeanQuery({ _id: "a1", hostelId: "h1", roomId: "r1" })
      );
      VacateRequest.create.mockResolvedValueOnce({ _id: "v1" });
      Hostel.findById.mockImplementationOnce(() =>
        makeSelectLeanQuery({ _id: "h1", name: "Hostel A", wardenId: "warden1" })
      );
      VacateRequest.findById.mockImplementationOnce(() => makePopulateLeanQuery({ _id: "v1", status: "pending" }));

      await requestVacate(req, res);

      expect(VacateRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: "u1",
          hostelId: "h1",
          roomId: "r1",
          allocationId: "a1",
          reason: "Leaving hostel",
          status: "pending",
        })
      );
      expect(Notification.create).toHaveBeenCalled();
      expect(io.emit).toHaveBeenCalledWith(
        "warden_update",
        expect.objectContaining({ source: "vacate_request" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: "v1", status: "pending" } });
    });

    test("creates request without notification when hostel has no warden", async () => {
      RoomAllocation.findOne.mockImplementationOnce(() =>
        makeSelectLeanQuery({ _id: "a1", hostelId: "h1", roomId: "r1" })
      );
      VacateRequest.create.mockResolvedValueOnce({ _id: "v1" });
      Hostel.findById.mockImplementationOnce(() => makeSelectLeanQuery({ _id: "h1", name: "Hostel A" }));
      VacateRequest.findById.mockImplementationOnce(() => makePopulateLeanQuery({ _id: "v1", status: "pending" }));

      await requestVacate(req, res);

      expect(Notification.create).not.toHaveBeenCalled();
    });

    test("returns 500 on unexpected failure", async () => {
      RoomAllocation.findOne.mockImplementationOnce(() => {
        throw new Error("allocation fail");
      });

      await requestVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "allocation fail" });
    });
  });

  describe("getMyVacateRequest", () => {
    test("returns latest student request", async () => {
      VacateRequest.findOne.mockImplementationOnce(() => makePopulateLeanQuery({ _id: "v1" }));

      await getMyVacateRequest(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: "v1" } });
    });

    test("returns 500 on error", async () => {
      VacateRequest.findOne.mockImplementationOnce(() => {
        throw new Error("query fail");
      });

      await getMyVacateRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "query fail" });
    });
  });

  describe("getHostelAdminVacateRequests", () => {
    test("returns empty list when warden manages no hostels", async () => {
      Hostel.find.mockImplementationOnce(() => makeSelectLeanQuery([]));

      await getHostelAdminVacateRequests(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
      expect(VacateRequest.find).not.toHaveBeenCalled();
    });

    test("returns requests for managed hostels", async () => {
      Hostel.find.mockImplementationOnce(() => makeSelectLeanQuery([{ _id: "h1" }]));
      VacateRequest.find.mockImplementationOnce(() => makePopulateLeanQuery([{ _id: "v1" }]));

      await getHostelAdminVacateRequests(req, res);

      expect(VacateRequest.find).toHaveBeenCalledWith({ hostelId: { $in: ["h1"] } });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ _id: "v1" }] });
    });

    test("returns 500 on error", async () => {
      Hostel.find.mockImplementationOnce(() => {
        throw new Error("hostel fail");
      });

      await getHostelAdminVacateRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "hostel fail" });
    });
  });

  describe("approveVacate", () => {
    test("returns 404 when request not found", async () => {
      VacateRequest.findById.mockImplementationOnce(() => makeSessionQuery(null));

      await approveVacate(req, res);

      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("returns 403 when warden is not authorized", async () => {
      VacateRequest.findById.mockImplementationOnce(() => makeSessionQuery({ _id: "v1", hostelId: "h1" }));
      Hostel.findOne.mockImplementationOnce(() => makeSessionQuery(null));

      await approveVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to approve this request." });
    });

    test("returns 400 when request already processed", async () => {
      VacateRequest.findById.mockImplementationOnce(() =>
        makeSessionQuery({ _id: "v1", hostelId: "h1", status: "approved" })
      );
      Hostel.findOne.mockImplementationOnce(() => makeSessionQuery({ _id: "h1", name: "Hostel A" }));

      await approveVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Request is already approved." });
    });

    test("returns 404 when allocation is missing", async () => {
      VacateRequest.findById.mockImplementationOnce(() =>
        makeSessionQuery({ _id: "v1", hostelId: "h1", allocationId: "a1", status: "pending" })
      );
      Hostel.findOne.mockImplementationOnce(() => makeSessionQuery({ _id: "h1", name: "Hostel A" }));
      RoomAllocation.findById.mockImplementationOnce(() => makeSessionQuery(null));

      await approveVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Room allocation not found for this request." });
    });

    test("returns 404 when room is missing", async () => {
      VacateRequest.findById.mockImplementationOnce(() =>
        makeSessionQuery({ _id: "v1", hostelId: "h1", allocationId: "a1", roomId: "r1", status: "pending" })
      );
      Hostel.findOne.mockImplementationOnce(() => makeSessionQuery({ _id: "h1", name: "Hostel A" }));
      RoomAllocation.findById.mockImplementationOnce(() => makeSessionQuery({ _id: "a1", status: "active" }));
      Room.findById.mockImplementationOnce(() => makeSessionQuery(null));

      await approveVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Room not found for this request." });
    });

    test("returns 400 when allocation is already vacated", async () => {
      VacateRequest.findById.mockImplementationOnce(() =>
        makeSessionQuery({ _id: "v1", hostelId: "h1", allocationId: "a1", roomId: "r1", status: "pending" })
      );
      Hostel.findOne.mockImplementationOnce(() => makeSessionQuery({ _id: "h1", name: "Hostel A" }));
      RoomAllocation.findById.mockImplementationOnce(() => makeSessionQuery({ _id: "a1", status: "vacated" }));
      Room.findById.mockImplementationOnce(() => makeSessionQuery({ _id: "r1" }));

      await approveVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "This allocation is already vacated." });
    });

    test("approves request and updates room status when not under maintenance", async () => {
      const requestDoc = {
        _id: "v1",
        studentId: "u1",
        hostelId: "h1",
        allocationId: "a1",
        roomId: "r1",
        status: "pending",
        save: jest.fn().mockResolvedValue(undefined),
      };
      const allocationDoc = {
        _id: "a1",
        status: "active",
        save: jest.fn().mockResolvedValue(undefined),
      };
      const roomDoc = {
        _id: "r1",
        occupiedCount: 2,
        capacity: 2,
        status: "full",
        save: jest.fn().mockResolvedValue(undefined),
      };

      VacateRequest.findById
        .mockImplementationOnce(() => makeSessionQuery(requestDoc))
        .mockImplementationOnce(() => makePopulateLeanQuery({ _id: "v1", status: "approved" }));
      Hostel.findOne.mockImplementationOnce(() => makeSessionQuery({ _id: "h1", name: "Hostel A" }));
      RoomAllocation.findById.mockImplementationOnce(() => makeSessionQuery(allocationDoc));
      Room.findById.mockImplementationOnce(() => makeSessionQuery(roomDoc));

      await approveVacate(req, res);

      expect(requestDoc.status).toBe("approved");
      expect(allocationDoc.status).toBe("vacated");
      expect(roomDoc.occupiedCount).toBe(1);
      expect(roomDoc.status).toBe("available");
      expect(Notification.create).toHaveBeenCalled();
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(io.emit).toHaveBeenCalledWith("warden_update", expect.objectContaining({ source: "vacate_approved" }));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Vacate request approved and room released.",
        })
      );
    });

    test("keeps maintenance status and sets occupiedCount floor to zero", async () => {
      const requestDoc = {
        _id: "v1",
        studentId: "u1",
        hostelId: "h1",
        allocationId: "a1",
        roomId: "r1",
        status: "pending",
        save: jest.fn().mockResolvedValue(undefined),
      };
      const allocationDoc = {
        _id: "a1",
        status: "active",
        save: jest.fn().mockResolvedValue(undefined),
      };
      const roomDoc = {
        _id: "r1",
        occupiedCount: 0,
        capacity: 2,
        status: "maintenance",
        save: jest.fn().mockResolvedValue(undefined),
      };

      VacateRequest.findById
        .mockImplementationOnce(() => makeSessionQuery(requestDoc))
        .mockImplementationOnce(() => makePopulateLeanQuery({ _id: "v1", status: "approved" }));
      Hostel.findOne.mockImplementationOnce(() => makeSessionQuery({ _id: "h1", name: "Hostel A" }));
      RoomAllocation.findById.mockImplementationOnce(() => makeSessionQuery(allocationDoc));
      Room.findById.mockImplementationOnce(() => makeSessionQuery(roomDoc));

      await approveVacate(req, res);

      expect(roomDoc.occupiedCount).toBe(0);
      expect(roomDoc.status).toBe("maintenance");
    });

    test("returns 500 when inner transaction step throws", async () => {
      VacateRequest.findById.mockImplementationOnce(() => {
        throw new Error("tx fail");
      });

      await approveVacate(req, res);

      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "tx fail" });
    });

    test("returns 500 when session creation fails", async () => {
      startSessionMock.mockRejectedValueOnce(new Error("session fail"));

      await approveVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "session fail" });
    });
  });

  describe("rejectVacate", () => {
    test("returns 404 when request not found", async () => {
      VacateRequest.findById.mockResolvedValueOnce(null);

      await rejectVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Vacate request not found." });
    });

    test("returns 403 when warden not authorized", async () => {
      VacateRequest.findById.mockResolvedValueOnce({ _id: "v1", hostelId: "h1" });
      Hostel.findOne.mockImplementationOnce(() => makeSelectLeanQuery(null));

      await rejectVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to reject this request." });
    });

    test("returns 400 when request already processed", async () => {
      VacateRequest.findById.mockResolvedValueOnce({ _id: "v1", hostelId: "h1", status: "approved" });
      Hostel.findOne.mockImplementationOnce(() => makeSelectLeanQuery({ _id: "h1", name: "Hostel A" }));

      await rejectVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Request is already approved." });
    });

    test("rejects request with reason and emits update", async () => {
      const requestDoc = {
        _id: "v1",
        hostelId: "h1",
        studentId: "u1",
        status: "pending",
        save: jest.fn().mockResolvedValue(undefined),
      };
      req.body = { reason: "Fees pending" };

      VacateRequest.findById.mockResolvedValueOnce(requestDoc);
      Hostel.findOne.mockImplementationOnce(() => makeSelectLeanQuery({ _id: "h1", name: "Hostel A" }));

      await rejectVacate(req, res);

      expect(requestDoc.status).toBe("rejected");
      expect(requestDoc.rejectionReason).toBe("Fees pending");
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "u1",
          message: expect.stringContaining("Reason: Fees pending"),
        })
      );
      expect(io.emit).toHaveBeenCalledWith("warden_update", expect.objectContaining({ source: "vacate_rejected" }));
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Vacate request rejected." });
    });

    test("rejects request without reason using empty rejectionReason", async () => {
      const requestDoc = {
        _id: "v1",
        hostelId: "h1",
        studentId: "u1",
        status: "pending",
        save: jest.fn().mockResolvedValue(undefined),
      };
      req.body = {};

      VacateRequest.findById.mockResolvedValueOnce(requestDoc);
      Hostel.findOne.mockImplementationOnce(() => makeSelectLeanQuery({ _id: "h1", name: "Hostel A" }));

      await rejectVacate(req, res);

      expect(requestDoc.rejectionReason).toBe("");
      const msg = Notification.create.mock.calls[0][0].message;
      expect(msg.includes("Reason:")).toBe(false);
    });

    test("returns 500 on unexpected error", async () => {
      VacateRequest.findById.mockRejectedValueOnce(new Error("reject fail"));

      await rejectVacate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "reject fail" });
    });
  });
});

