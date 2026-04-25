import { jest } from "@jest/globals";
import AppError from "../../backend/src/utils/AppError.js";

const MessPlan = {
  find: jest.fn(),
  aggregate: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

jest.unstable_mockModule("../../backend/src/models/MessPlan.js", () => ({
  default: MessPlan,
}));

const {
  getAllMessPlansService,
  createMessPlanService,
  updateMessPlanService,
  deleteMessPlanService,
} = await import("../../backend/src/services/messPlanService.js");

const makePlanDoc = (overrides = {}) => ({
  _id: "p1",
  name: "Monthly Plan",
  price: 2500,
  durationInDays: 30,
  meals: { breakfast: true, lunch: true, snacks: false, dinner: true },
  toObject() {
    return {
      _id: this._id,
      name: this.name,
      price: this.price,
      durationInDays: this.durationInDays,
      meals: this.meals,
    };
  },
  ...overrides,
});

describe("messPlanService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MessPlan.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    MessPlan.aggregate.mockResolvedValue([]);
    MessPlan.create.mockResolvedValue(makePlanDoc());
    MessPlan.findByIdAndUpdate.mockResolvedValue(makePlanDoc());
    MessPlan.findByIdAndDelete.mockResolvedValue(makePlanDoc());
  });

  describe("getAllMessPlansService", () => {
    test("uses default search parameter when called without args", async () => {
      const sortMock = jest.fn().mockResolvedValue([]);
      MessPlan.find.mockReturnValueOnce({ sort: sortMock });

      const result = await getAllMessPlansService();

      expect(MessPlan.find).toHaveBeenCalledTimes(1);
      expect(MessPlan.aggregate).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test("uses find/sort path when search is empty after trim", async () => {
      const docs = [makePlanDoc()];
      const sortMock = jest.fn().mockResolvedValue(docs);
      MessPlan.find.mockReturnValueOnce({ sort: sortMock });

      const result = await getAllMessPlansService("   ");

      expect(MessPlan.find).toHaveBeenCalledTimes(1);
      expect(MessPlan.aggregate).not.toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result[0]).toEqual(
        expect.objectContaining({
          duration: 30,
          status: "active",
        })
      );
    });

    test("uses aggregate path for non-empty search and escapes regex", async () => {
      const aggregatePlans = [
        {
          _id: "p2",
          name: "Plan (Special)",
          price: 2999,
          durationInDays: 15,
          meals: { breakfast: true },
        },
      ];
      MessPlan.aggregate.mockResolvedValueOnce(aggregatePlans);

      const result = await getAllMessPlansService("(2999)+");

      expect(MessPlan.find).not.toHaveBeenCalled();
      expect(MessPlan.aggregate).toHaveBeenCalledTimes(1);
      const pipeline = MessPlan.aggregate.mock.calls[0][0];
      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.$or[0].name.$regex).toBe("\\(2999\\)\\+");
      expect(result[0]).toEqual(
        expect.objectContaining({
          duration: 15,
          status: "active",
        })
      );
    });
  });

  describe("createMessPlanService", () => {
    test("creates plan using payload.duration and normalized meals", async () => {
      const payload = {
        name: "Weekly",
        price: "1000",
        duration: "7",
        meals: { breakfast: 1, lunch: 0, snacks: "yes", dinner: "" },
      };

      const result = await createMessPlanService(payload, "user1");

      expect(MessPlan.create).toHaveBeenCalledWith({
        name: "Weekly",
        price: 1000,
        durationInDays: 7,
        meals: {
          breakfast: true,
          lunch: false,
          snacks: true,
          dinner: false,
        },
        createdBy: "user1",
      });
      expect(result).toEqual(expect.objectContaining({ duration: 30, status: "active" }));
    });

    test("uses durationInDays fallback when duration is absent", async () => {
      await createMessPlanService(
        {
          name: "Biweekly",
          price: 1200,
          durationInDays: "14",
          meals: { dinner: true },
        },
        "user2"
      );

      expect(MessPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          durationInDays: 14,
        })
      );
    });

    test("throws AppError when no meals are selected", async () => {
      await expect(
        createMessPlanService(
          {
            name: "Invalid",
            price: 900,
            durationInDays: 10,
            meals: {},
          },
          "user3"
        )
      ).rejects.toMatchObject({ message: "At least one meal must be selected", statusCode: 400 });

      expect(MessPlan.create).not.toHaveBeenCalled();
    });

    test("throws AppError when meals field is omitted", async () => {
      await expect(
        createMessPlanService(
          {
            name: "Invalid No Meals",
            price: 900,
            durationInDays: 10,
          },
          "user4"
        )
      ).rejects.toMatchObject({ message: "At least one meal must be selected", statusCode: 400 });

      expect(MessPlan.create).not.toHaveBeenCalled();
    });

    test("accepts meals when only lunch is selected", async () => {
      await createMessPlanService(
        {
          name: "Lunch Only",
          price: 700,
          durationInDays: 5,
          meals: { lunch: true },
        },
        "user5"
      );

      expect(MessPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          meals: {
            breakfast: false,
            lunch: true,
            snacks: false,
            dinner: false,
          },
        })
      );
    });

    test("accepts meals when only snacks is selected", async () => {
      await createMessPlanService(
        {
          name: "Snacks Only",
          price: 500,
          durationInDays: 3,
          meals: { snacks: true },
        },
        "user6"
      );

      expect(MessPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          meals: {
            breakfast: false,
            lunch: false,
            snacks: true,
            dinner: false,
          },
        })
      );
    });

    test("accepts meals when only dinner is selected", async () => {
      await createMessPlanService(
        {
          name: "Dinner Only",
          price: 800,
          durationInDays: 6,
          meals: { dinner: true },
        },
        "user7"
      );

      expect(MessPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          meals: {
            breakfast: false,
            lunch: false,
            snacks: false,
            dinner: true,
          },
        })
      );
    });
  });

  describe("updateMessPlanService", () => {
    test("updates only provided fields, including price and duration conversion", async () => {
      await updateMessPlanService("p1", {
        name: "Updated Name",
        price: "1500",
        duration: "21",
      });

      expect(MessPlan.findByIdAndUpdate).toHaveBeenCalledWith(
        "p1",
        {
          name: "Updated Name",
          price: 1500,
          durationInDays: 21,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    });

    test("updates meals when valid meals are provided", async () => {
      await updateMessPlanService("p1", {
        meals: { breakfast: true, lunch: false, snacks: 1, dinner: 0 },
      });

      expect(MessPlan.findByIdAndUpdate).toHaveBeenCalledWith(
        "p1",
        {
          meals: {
            breakfast: true,
            lunch: false,
            snacks: true,
            dinner: false,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    });

    test("throws AppError when meals are provided but all are false", async () => {
      await expect(
        updateMessPlanService("p1", {
          meals: { breakfast: 0, lunch: false, snacks: "", dinner: null },
        })
      ).rejects.toMatchObject({ message: "At least one meal must be selected", statusCode: 400 });

      expect(MessPlan.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("throws AppError when updated plan is not found", async () => {
      MessPlan.findByIdAndUpdate.mockResolvedValueOnce(null);

      await expect(updateMessPlanService("missing", { name: "X" })).rejects.toMatchObject({
        message: "Mess plan not found",
        statusCode: 404,
      });
    });

    test("normalizes plan when updated plan has no toObject method", async () => {
      MessPlan.findByIdAndUpdate.mockResolvedValueOnce({
        _id: "p9",
        name: "Plain",
        price: 100,
        durationInDays: 5,
      });

      const result = await updateMessPlanService("p9", {});

      expect(result).toEqual(
        expect.objectContaining({
          _id: "p9",
          duration: 5,
          status: "active",
        })
      );
    });
  });

  describe("deleteMessPlanService", () => {
    test("returns null when delete succeeds", async () => {
      const result = await deleteMessPlanService("p1");

      expect(MessPlan.findByIdAndDelete).toHaveBeenCalledWith("p1");
      expect(result).toBeNull();
    });

    test("throws AppError when plan to delete is missing", async () => {
      MessPlan.findByIdAndDelete.mockResolvedValueOnce(null);

      await expect(deleteMessPlanService("missing")).rejects.toMatchObject({
        message: "Mess plan not found",
        statusCode: 404,
      });
    });
  });
});

