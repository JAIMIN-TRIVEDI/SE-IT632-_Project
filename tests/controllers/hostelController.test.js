import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const Hostel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const Block = {
  find: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const Room = {
  find: jest.fn(),
  create: jest.fn(),
  deleteMany: jest.fn(),
  findOneAndUpdate: jest.fn(),
  bulkWrite: jest.fn(),
};

const RoomAllocation = {
  find: jest.fn(),
  updateMany: jest.fn(),
};

const RoomRequest = {
  find: jest.fn(),
  updateMany: jest.fn(),
};

const Notification = {
  insertMany: jest.fn(),
};

const makeQuery = (resolvedValue, leanValue = resolvedValue) => {
  const query = {
    populate: jest.fn(() => query),
    where: jest.fn(() => query),
    equals: jest.fn(() => query),
    sort: jest.fn(() => query),
    select: jest.fn(() => query),
    lean: jest.fn().mockResolvedValue(leanValue),
    then: (onFulfilled, onRejected) => Promise.resolve(resolvedValue).then(onFulfilled, onRejected),
    catch: (onRejected) => Promise.resolve(resolvedValue).catch(onRejected),
  };

  return query;
};

const buildHostelDoc = (id = "h1", name = "A-Hostel") => ({
  _id: id,
  name,
  save: jest.fn().mockResolvedValue(true),
  toObject() {
    return {
      _id: id,
      name,
    };
  },
});

jest.unstable_mockModule("../../backend/src/models/Hostel.js", () => ({ default: Hostel }));
jest.unstable_mockModule("../../backend/src/models/Block.js", () => ({ default: Block }));
jest.unstable_mockModule("../../backend/src/models/Room.js", () => ({ default: Room }));
jest.unstable_mockModule("../../backend/src/models/RoomAllocation.js", () => ({ default: RoomAllocation }));
jest.unstable_mockModule("../../backend/src/models/RoomRequest.js", () => ({ default: RoomRequest }));
jest.unstable_mockModule("../../backend/src/models/Notification.js", () => ({ default: Notification }));

const {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
  assignWarden,
} = await import("../../backend/src/controllers/hostelController.js");

const buildTestApp = () => {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.user = {
      _id: "u1",
      role: req.headers["x-role"] || "hostel_admin",
    };
    next();
  });

  app.post("/hostels", createHostel);
  app.get("/hostels", getHostels);
  app.get("/hostels/:id", getHostelById);
  app.put("/hostels/:id", updateHostel);
  app.delete("/hostels/:id", deleteHostel);
  app.put("/hostels/:id/assign-warden", assignWarden);

  return app;
};

const app = buildTestApp();

const room = ({
  id,
  roomNumber,
  roomType = "triple",
  capacity = 3,
  price = 0,
  status = "available",
} = {}) => ({
  ...(id ? { _id: id } : {}),
  roomNumber,
  roomType,
  capacity,
  price,
  status,
});

const block = ({ id, name, totalRooms, rooms }) => ({
  ...(id ? { _id: id } : {}),
  name,
  totalRooms,
  rooms,
});

beforeEach(() => {
  jest.clearAllMocks();

  Hostel.create.mockResolvedValue({ _id: "h1" });
  Hostel.find.mockImplementation(() => makeQuery([buildHostelDoc("h1", "A-Hostel")]));
  Hostel.findById.mockImplementation((id) => makeQuery(buildHostelDoc(id), { _id: id, name: "A-Hostel" }));
  Hostel.findByIdAndUpdate.mockImplementation((id) => makeQuery(buildHostelDoc(id)));
  Hostel.findByIdAndDelete.mockResolvedValue({ _id: "h1" });

  Block.find.mockImplementation(() => makeQuery([], []));
  Block.create.mockResolvedValue({ _id: "b1", name: "Block A", totalRooms: 0 });
  Block.findOne.mockResolvedValue(null);
  Block.deleteMany.mockResolvedValue({ deletedCount: 0 });

  Room.find.mockImplementation(() => makeQuery([], []));
  Room.create.mockResolvedValue({ _id: "r1" });
  Room.deleteMany.mockResolvedValue({ deletedCount: 0 });
  Room.findOneAndUpdate.mockResolvedValue({ _id: "r1" });
  Room.bulkWrite.mockResolvedValue({ modifiedCount: 0 });

  RoomAllocation.find.mockImplementation(() => makeQuery([], []));
  RoomAllocation.updateMany.mockResolvedValue({ modifiedCount: 0 });

  RoomRequest.find.mockImplementation(() => makeQuery([], []));
  RoomRequest.updateMany.mockResolvedValue({ modifiedCount: 0 });

  Notification.insertMany.mockResolvedValue([]);
});

describe("hostelController", () => {
  describe("createHostel", () => {
    test("returns 201 on success", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [],
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Hostel.create).toHaveBeenCalled();
    });

    test("returns 201 when blocks are omitted", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test("returns 400 for invalid blocks input", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [{ name: "Block A", totalRooms: 1, rooms: [] }],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/requires exactly 1 rooms/i);
    });

    test("returns 500 when create fails", async () => {
      Hostel.create.mockRejectedValueOnce(new Error("db down"));

      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [],
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("db down");
    });

    test("returns 400 when room numbers duplicate across blocks", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          block({
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ roomNumber: "101" })],
          }),
          block({
            name: "Block B",
            totalRooms: 1,
            rooms: [room({ roomNumber: "101" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/duplicate room number/i);
    });

    test("returns 400 when room number already exists in db", async () => {
      Room.find.mockImplementationOnce(() => makeQuery([{ roomNumber: "101" }], [{ roomNumber: "101" }]));

      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          block({
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ roomNumber: "101" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exist/i);
    });

    test("creates blocks and room records for valid blocks input", async () => {
      Block.create
        .mockResolvedValueOnce({ _id: "b1", name: "Block A", totalRooms: 1 })
        .mockResolvedValueOnce({ _id: "b2", name: "Block B", totalRooms: 1 });

      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          block({
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ roomNumber: "101", roomType: "double", status: "maintenance" })],
          }),
          block({
            name: "Block B",
            totalRooms: 1,
            rooms: [room({ roomNumber: "102", roomType: "quad" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(201);
      expect(Block.create).toHaveBeenCalledTimes(2);
      expect(Room.create).toHaveBeenCalledTimes(2);
    });

    test("returns 400 when block name is missing", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          {
            totalRooms: 1,
            rooms: [room({ roomNumber: "101" })],
          },
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/must have a valid name/i);
    });

    test("returns 400 when totalRooms is invalid", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          {
            name: "Block A",
            totalRooms: -1,
            rooms: [room({ roomNumber: "101" })],
          },
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/valid total room count/i);
    });

    test("returns 400 when room count exceeds totalRooms", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          {
            name: "Block A",
            totalRooms: 0,
            rooms: [room({ roomNumber: "101" }), room({ roomNumber: "102" })],
          },
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/remove 2 rooms/i);
    });

    test("returns 400 when roomNumber is non-string", async () => {
      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          {
            name: "Block A",
            totalRooms: 1,
            rooms: [{ roomNumber: 101 }],
          },
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid room number/i);
    });

    test("normalizes room fields for valid and invalid values", async () => {
      Block.create.mockResolvedValueOnce({ _id: "b1", name: "Block A", totalRooms: 2 });

      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          {
            name: "Block A",
            totalRooms: 2,
            rooms: [
              {
                roomNumber: "101",
                roomType: "DOUBLE",
                capacity: 2.8,
                price: 1200,
                status: "FULL",
              },
              {
                roomNumber: "102",
                roomType: 42,
                capacity: -1,
                price: -5,
                status: 10,
              },
            ],
          },
        ],
      });

      expect(res.statusCode).toBe(201);
      expect(Room.create).toHaveBeenCalledWith(
        expect.objectContaining({ roomNumber: "101", roomType: "double", capacity: 2, price: 1200, status: "full" })
      );
      expect(Room.create).toHaveBeenCalledWith(
        expect.objectContaining({ roomNumber: "102", roomType: "triple", capacity: 3, price: 0, status: "available" })
      );
    });

    test("accepts non-array rooms input when totalRooms is zero", async () => {
      Block.create.mockResolvedValueOnce({ _id: "b1", name: "Block A", totalRooms: 0 });

      const res = await request(app).post("/hostels").send({
        name: "A-Hostel",
        type: "boys",
        blocks: [
          {
            name: "Block A",
            totalRooms: 0,
            rooms: null,
          },
        ],
      });

      expect(res.statusCode).toBe(201);
      expect(Room.create).not.toHaveBeenCalled();
    });
  });

  describe("getHostels", () => {
    test("returns empty list when no hostels exist", async () => {
      Hostel.find.mockImplementationOnce(() => makeQuery([], []));

      const res = await request(app).get("/hostels");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    test("returns 200 with hostels", async () => {
      const res = await request(app).get("/hostels");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("applies warden filter for warden role", async () => {
      const wardenQuery = makeQuery([buildHostelDoc("h1", "A-Hostel")]);
      Hostel.find.mockReturnValueOnce(wardenQuery);

      const res = await request(app).get("/hostels").set("x-role", "warden");

      expect(res.statusCode).toBe(200);
      expect(wardenQuery.where).toHaveBeenCalledWith("wardenId");
      expect(wardenQuery.equals).toHaveBeenCalledWith("u1");
    });

    test("returns 500 when query throws", async () => {
      Hostel.find.mockImplementationOnce(() => {
        throw new Error("query failed");
      });

      const res = await request(app).get("/hostels");

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("query failed");
    });

    test("computes room stats and performs occupancy sync", async () => {
      const richHostel = {
        _id: "h1",
        name: "A-Hostel",
        toObject() {
          return { _id: "h1", name: "A-Hostel" };
        },
      };

      Hostel.find.mockImplementationOnce(() => makeQuery([richHostel]));
      Block.find.mockImplementationOnce(() =>
        makeQuery(
          [{ _id: "b1", hostelId: "h1", totalRooms: 2, occupiedRooms: 1 }],
          [{ _id: "b1", hostelId: "h1", totalRooms: 2, occupiedRooms: 1 }]
        )
      );

      Room.find.mockImplementationOnce(() =>
        makeQuery(
          [
            {
              _id: "r1",
              blockId: "b1",
              hostelId: "h1",
              roomNumber: "101",
              capacity: 1,
              occupiedCount: 0,
              status: "available",
              roomType: "double",
            },
            {
              _id: "r2",
              blockId: "b1",
              hostelId: "h1",
              roomNumber: "102",
              capacity: 3,
              occupiedCount: 2,
              status: "maintenance",
            },
            {
              _id: "r3",
              roomNumber: "103",
              capacity: 2,
              occupiedCount: 0,
            },
          ],
          [
            {
              _id: "r1",
              blockId: "b1",
              hostelId: "h1",
              roomNumber: "101",
              capacity: 1,
              occupiedCount: 0,
              status: "available",
              roomType: "double",
            },
            {
              _id: "r2",
              blockId: "b1",
              hostelId: "h1",
              roomNumber: "102",
              capacity: 3,
              occupiedCount: 2,
              status: "maintenance",
            },
            {
              _id: "r3",
              roomNumber: "103",
              capacity: 2,
              occupiedCount: 0,
            },
          ]
        )
      );

      RoomAllocation.find.mockImplementationOnce(() =>
        makeQuery(
          [{ roomId: "r1" }, { roomId: "r1" }],
          [{ roomId: "r1" }, { roomId: "r1" }]
        )
      );

      const res = await request(app).get("/hostels");

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].stats.totalCapacity).toBe(4);
      expect(res.body.data[0].stats.roomsByStatus.maintenance).toBe(1);
      expect(res.body.data[0].stats.roomsByType.double).toBe(1);
      expect(Room.bulkWrite).toHaveBeenCalledTimes(1);
    });

    test("handles plain objects without toObject and block without id", async () => {
      Hostel.find.mockImplementationOnce(() => makeQuery([{ _id: "h1", name: "Plain Hostel" }]));
      Block.find.mockImplementationOnce(() => makeQuery([{ hostelId: "h1" }], [{ hostelId: "h1" }]));
      Room.find.mockImplementationOnce(() => makeQuery([], []));
      RoomAllocation.find.mockImplementationOnce(() => makeQuery([], []));

      const res = await request(app).get("/hostels");

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].name).toBe("Plain Hostel");
      expect(res.body.data[0].blocks[0].rooms).toEqual([]);
    });
  });

  describe("getHostelById", () => {
    test("returns 200 for existing hostel", async () => {
      const res = await request(app).get("/hostels/h1");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe("h1");
    });

    test("returns 404 when hostel not found", async () => {
      Hostel.findById.mockImplementationOnce(() => makeQuery(null, null));

      const res = await request(app).get("/hostels/missing");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Hostel not found");
    });

    test("returns 500 on exception", async () => {
      Hostel.findById.mockImplementationOnce(() => {
        throw new Error("bad id");
      });

      const res = await request(app).get("/hostels/h1");

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("bad id");
    });
  });

  describe("updateHostel", () => {
    test("returns 200 on successful update", async () => {
      const res = await request(app).put("/hostels/h1").send({ name: "Renamed Hostel" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Hostel.findByIdAndUpdate).toHaveBeenCalled();
    });

    test("returns 404 when hostel does not exist", async () => {
      Hostel.findByIdAndUpdate.mockImplementationOnce(() => makeQuery(null, null));

      const res = await request(app).put("/hostels/missing").send({ name: "X" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Hostel not found");
    });

    test("returns 400 for invalid blocks during update", async () => {
      const res = await request(app).put("/hostels/h1").send({
        blocks: [{ name: "Block A", totalRooms: 1, rooms: [] }],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/requires exactly 1 rooms/i);
    });

    test("returns 500 on unexpected failure", async () => {
      Hostel.findByIdAndUpdate.mockImplementationOnce(() => {
        throw new Error("update failed");
      });

      const res = await request(app).put("/hostels/h1").send({ name: "X" });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("update failed");
    });

    test("updates existing block and falls back to create room when room update misses", async () => {
      const existingBlockDoc = {
        _id: "b1",
        name: "Legacy Block",
        totalRooms: 4,
        occupiedRooms: 3,
        save: jest.fn().mockResolvedValue({ _id: "b1", name: "Block A" }),
      };

      Block.findOne.mockResolvedValueOnce(existingBlockDoc);
      Room.findOneAndUpdate.mockResolvedValueOnce(null);
      Room.find.mockImplementationOnce(() => makeQuery([], []));

      const res = await request(app).put("/hostels/h1").send({
        blocks: [
          block({
            id: "b1",
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ id: "r1", roomNumber: "101", roomType: "double" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(200);
      expect(existingBlockDoc.save).toHaveBeenCalled();
      expect(Room.findOneAndUpdate).toHaveBeenCalled();
      expect(Room.create).toHaveBeenCalled();
    });

    test("deletes removed blocks and sends notifications for affected users", async () => {
      Block.find
        .mockImplementationOnce(() => makeQuery([{ _id: "b_old" }], [{ _id: "b_old" }]))
        .mockImplementationOnce(() => makeQuery([], []));

      Room.find
        .mockImplementationOnce(() => makeQuery([], []))
        .mockImplementationOnce(() =>
          makeQuery(
            [{ _id: "r_old", roomNumber: "101" }],
            [{ _id: "r_old", roomNumber: "101" }]
          )
        )
        .mockImplementationOnce(() => makeQuery([], []))
        .mockImplementationOnce(() => makeQuery([], []));

      RoomAllocation.find.mockImplementationOnce(() =>
        makeQuery(
          [{ studentId: "s1", roomId: "r_old" }],
          [{ studentId: "s1", roomId: "r_old" }]
        )
      );

      RoomRequest.find.mockImplementationOnce(() =>
        makeQuery(
          [{ studentId: "s1", roomId: "r_old" }],
          [{ studentId: "s1", roomId: "r_old" }]
        )
      );

      const res = await request(app).put("/hostels/h1").send({
        blocks: [
          block({
            id: "b_new",
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ roomNumber: "201" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(200);
      expect(Notification.insertMany).toHaveBeenCalledTimes(1);
      expect(RoomAllocation.updateMany).toHaveBeenCalledTimes(1);
      expect(RoomRequest.updateMany).toHaveBeenCalledTimes(1);
      expect(Block.deleteMany).toHaveBeenCalledTimes(1);
      expect(Room.deleteMany).toHaveBeenCalled();
    });

    test("deletes removed rooms within an existing block", async () => {
      const existingBlockDoc = {
        _id: "b1",
        name: "Block A",
        totalRooms: 1,
        occupiedRooms: 0,
        save: jest.fn().mockResolvedValue({ _id: "b1", name: "Block A" }),
      };

      Block.find
        .mockImplementationOnce(() => makeQuery([{ _id: "b1" }], [{ _id: "b1" }]))
        .mockImplementationOnce(() => makeQuery([], []));
      Block.findOne.mockResolvedValueOnce(existingBlockDoc);

      Room.find
        .mockImplementationOnce(() => makeQuery([], []))
        .mockImplementationOnce(() =>
          makeQuery(
            [{ _id: "r_old", roomNumber: "101" }],
            [{ _id: "r_old", roomNumber: "101" }]
          )
        )
        .mockImplementationOnce(() => makeQuery([], []));

      RoomAllocation.find.mockImplementationOnce(() =>
        makeQuery(
          [{ studentId: "s1", roomId: "r_old" }],
          [{ studentId: "s1", roomId: "r_old" }]
        )
      );

      RoomRequest.find.mockImplementationOnce(() =>
        makeQuery(
          [{ studentId: "s1", roomId: "r_old" }],
          [{ studentId: "s1", roomId: "r_old" }]
        )
      );

      const res = await request(app).put("/hostels/h1").send({
        blocks: [
          block({
            id: "b1",
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ id: "r_new", roomNumber: "102" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(200);
      expect(Notification.insertMany).toHaveBeenCalled();
      expect(Room.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          hostelId: "h1",
          blockId: "b1",
        })
      );
    });

    test("uses fallback hostel name and skips notifications when no affected users", async () => {
      const existingBlockDoc = {
        _id: "b1",
        name: "Block A",
        totalRooms: 1,
        occupiedRooms: 0,
        save: jest.fn().mockResolvedValue({ _id: "b1", name: "Block A" }),
      };

      Hostel.findById
        .mockImplementationOnce(() => makeQuery(null, null))
        .mockImplementationOnce(() => makeQuery(buildHostelDoc("h1"), { _id: "h1", name: "A-Hostel" }));

      Block.find
        .mockImplementationOnce(() => makeQuery([{ _id: "b1" }], [{ _id: "b1" }]))
        .mockImplementationOnce(() => makeQuery([], []));
      Block.findOne.mockResolvedValueOnce(existingBlockDoc);

      Room.find
        .mockImplementationOnce(() => makeQuery([], []))
        .mockImplementationOnce(() => makeQuery([{ _id: "r_old", roomNumber: "101" }], [{ _id: "r_old", roomNumber: "101" }]))
        .mockImplementationOnce(() => makeQuery([], []));

      RoomAllocation.find.mockImplementationOnce(() => makeQuery([{ studentId: null, roomId: "r_old" }], [{ studentId: null, roomId: "r_old" }]));
      RoomRequest.find.mockImplementationOnce(() => makeQuery([{ studentId: "s1", roomId: null }], [{ studentId: "s1", roomId: null }]));

      const res = await request(app).put("/hostels/h1").send({
        blocks: [
          block({
            id: "b1",
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ id: "r_new", roomNumber: "102" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(200);
      expect(Notification.insertMany).not.toHaveBeenCalled();
      expect(RoomAllocation.updateMany).toHaveBeenCalled();
      expect(RoomRequest.updateMany).toHaveBeenCalled();
    });

    test("includes type and warden in update payload when provided", async () => {
      const res = await request(app).put("/hostels/h1").send({
        name: "Updated",
        type: "girls",
        wardenId: "w2",
      });

      expect(res.statusCode).toBe(200);
      expect(Hostel.findByIdAndUpdate).toHaveBeenCalledWith(
        "h1",
        expect.objectContaining({ name: "Updated", type: "girls", wardenId: "w2" }),
        { new: true }
      );
    });

    test("returns 400 when block has duplicate room numbers", async () => {
      const res = await request(app).put("/hostels/h1").send({
        blocks: [
          block({
            name: "Block A",
            totalRooms: 2,
            rooms: [room({ roomNumber: "101" }), room({ roomNumber: "101" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/contains duplicate room number/i);
    });

    test("returns 400 when block has invalid room name", async () => {
      const res = await request(app).put("/hostels/h1").send({
        blocks: [
          block({
            name: "Block A",
            totalRooms: 1,
            rooms: [room({ roomNumber: "" })],
          }),
        ],
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid room number/i);
    });
  });

  describe("deleteHostel", () => {
    test("returns 200 after deleting hostel", async () => {
      const res = await request(app).delete("/hostels/h1");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Hostel deleted");
    });

    test("returns 500 when delete operations fail", async () => {
      Room.deleteMany.mockRejectedValueOnce(new Error("delete failed"));

      const res = await request(app).delete("/hostels/h1");

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("delete failed");
    });
  });

  describe("assignWarden", () => {
    test("returns 200 when warden assignment succeeds", async () => {
      const hostelDoc = buildHostelDoc("h1");
      Hostel.findById.mockImplementationOnce(() => makeQuery(hostelDoc, { _id: "h1", name: "A-Hostel" }));

      const res = await request(app)
        .put("/hostels/h1/assign-warden")
        .send({ wardenId: "w1" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Warden assigned successfully");
      expect(Hostel.findById).toHaveBeenCalled();
    });

    test("returns 404 when hostel is missing", async () => {
      Hostel.findById.mockImplementationOnce(() => makeQuery(null, null));

      const res = await request(app)
        .put("/hostels/missing/assign-warden")
        .send({ wardenId: "w1" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Hostel not found");
    });

    test("returns 500 when save throws", async () => {
      const hostelDoc = buildHostelDoc("h1");
      hostelDoc.save.mockRejectedValueOnce(new Error("save failed"));
      Hostel.findById.mockImplementationOnce(() => makeQuery(hostelDoc, { _id: "h1", name: "A-Hostel" }));

      const res = await request(app)
        .put("/hostels/h1/assign-warden")
        .send({ wardenId: "w1" });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("save failed");
    });
  });
});

