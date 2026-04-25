import { jest } from "@jest/globals";
import { validationResult } from "express-validator";

const getAllMessPlansServiceMock = jest.fn();
const createMessPlanServiceMock = jest.fn();
const updateMessPlanServiceMock = jest.fn();
const deleteMessPlanServiceMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.unstable_mockModule("../../backend/src/services/messPlanService.js", () => ({
  getAllMessPlansService: getAllMessPlansServiceMock,
  createMessPlanService: createMessPlanServiceMock,
  updateMessPlanService: updateMessPlanServiceMock,
  deleteMessPlanService: deleteMessPlanServiceMock,
}));

jest.unstable_mockModule("../../backend/src/utils/apiResponse.js", () => ({
  sendSuccess: sendSuccessMock,
}));

const {
  createMessPlanValidation,
  updateMessPlanValidation,
  deleteMessPlanValidation,
  getAllMessPlans,
  createMessPlan,
  updateMessPlan,
  deleteMessPlan,
} = await import("../../backend/src/controllers/messPlanController.js");

const runValidation = async (validationChain, req) => {
  await Promise.all(validationChain.map((validator) => validator.run(req)));
  return validationResult(req).array().map((err) => err.msg);
};

describe("messPlanController validations", () => {
  test("create validation passes for valid payload using duration", async () => {
    const req = {
      body: {
        name: "Monthly",
        price: 2000,
        status: "active",
        meals: { breakfast: true },
        duration: 30,
      },
    };

    const errors = await runValidation(createMessPlanValidation, req);

    expect(errors).toEqual([]);
  });

  test("create validation fails for invalid meals object", async () => {
    const req = {
      body: {
        name: "Monthly",
        price: 2000,
        meals: [],
        duration: 30,
      },
    };

    const errors = await runValidation(createMessPlanValidation, req);

    expect(errors).toContain("meals must be an object");
  });

  test("create validation fails when no meal is selected", async () => {
    const req = {
      body: {
        name: "Monthly",
        price: 2000,
        meals: { breakfast: false, lunch: 0, snacks: "", dinner: null },
        duration: 30,
      },
    };

    const errors = await runValidation(createMessPlanValidation, req);

    expect(errors).toContain("At least one meal must be selected");
  });

  test("create validation fails when duration is missing", async () => {
    const req = {
      body: {
        name: "Monthly",
        price: 2000,
        meals: { dinner: true },
      },
    };

    const errors = await runValidation(createMessPlanValidation, req);

    expect(errors).toContain("duration is required");
  });

  test("create validation fails when duration is invalid", async () => {
    const req = {
      body: {
        name: "Monthly",
        price: 2000,
        meals: { dinner: true },
        duration: 0,
      },
    };

    const errors = await runValidation(createMessPlanValidation, req);

    expect(errors).toContain("duration must be a positive integer");
  });

  test("create validation accepts durationInDays fallback", async () => {
    const req = {
      body: {
        name: "Monthly",
        price: 2000,
        meals: { lunch: true },
        durationInDays: 15,
      },
    };

    const errors = await runValidation(createMessPlanValidation, req);

    expect(errors).toEqual([]);
  });

  test("create validation rejects invalid status", async () => {
    const req = {
      body: {
        name: "Monthly",
        price: 2000,
        status: "archived",
        meals: { lunch: true },
        duration: 15,
      },
    };

    const errors = await runValidation(createMessPlanValidation, req);

    expect(errors).toContain("status must be one of: active, inactive");
  });

  test("update validation fails for invalid id", async () => {
    const req = {
      params: { id: "bad" },
      body: { name: "New" },
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toContain("Invalid mess plan id");
  });

  test("update validation fails when no updatable fields provided", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {},
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toContain("At least one field is required to update");
  });

  test("update validation passes when meals is undefined but name is present", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { name: "Updated" },
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toEqual([]);
  });

  test("update validation fails for invalid meals type", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { name: "Updated", meals: [] },
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toContain("meals must be an object");
  });

  test("update validation fails when meals selected are all false", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        name: "Updated",
        meals: { breakfast: false, lunch: false, snacks: false, dinner: false },
      },
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toContain("At least one meal must be selected");
  });

  test("update validation passes for valid meals object", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        meals: { breakfast: true, lunch: false, snacks: false, dinner: false },
        name: "Updated",
      },
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toEqual([]);
  });

  test("update validation fails for invalid duration", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { duration: -1 },
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toContain("duration must be a positive integer");
  });

  test("update validation passes for valid durationInDays and status", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { durationInDays: 20, status: "inactive" },
    };

    const errors = await runValidation(updateMessPlanValidation, req);

    expect(errors).toEqual([]);
  });

  test("delete validation fails for invalid id", async () => {
    const req = {
      params: { id: "bad" },
    };

    const errors = await runValidation(deleteMessPlanValidation, req);

    expect(errors).toContain("Invalid mess plan id");
  });

  test("delete validation passes for valid id", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
    };

    const errors = await runValidation(deleteMessPlanValidation, req);

    expect(errors).toEqual([]);
  });
});

describe("messPlanController handlers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
      body: { name: "Monthly" },
      params: { id: "p1" },
      user: { _id: "u1" },
    };

    res = { marker: "res" };
    next = jest.fn();

    getAllMessPlansServiceMock.mockResolvedValue([{ _id: "p1" }]);
    createMessPlanServiceMock.mockResolvedValue({ _id: "p2" });
    updateMessPlanServiceMock.mockResolvedValue({ _id: "p3" });
    deleteMessPlanServiceMock.mockResolvedValue(null);

    sendSuccessMock.mockImplementation((_res, _code, _msg, data) => ({ data }));
  });

  test("getAllMessPlans sends empty search when query.search missing", async () => {
    await getAllMessPlans(req, res, next);

    expect(getAllMessPlansServiceMock).toHaveBeenCalledWith("");
    expect(sendSuccessMock).toHaveBeenCalledWith(res, 200, "Mess plans fetched successfully", [{ _id: "p1" }]);
    expect(next).not.toHaveBeenCalled();
  });

  test("getAllMessPlans sends provided search when present", async () => {
    req.query.search = "monthly";

    await getAllMessPlans(req, res, next);

    expect(getAllMessPlansServiceMock).toHaveBeenCalledWith("monthly");
  });

  test("createMessPlan calls service and sendSuccess", async () => {
    req.body = { name: "Weekly" };

    await createMessPlan(req, res, next);

    expect(createMessPlanServiceMock).toHaveBeenCalledWith({ name: "Weekly" }, "u1");
    expect(sendSuccessMock).toHaveBeenCalledWith(res, 201, "Mess plan created successfully", { _id: "p2" });
  });

  test("updateMessPlan calls service and sendSuccess", async () => {
    req.params.id = "p9";
    req.body = { price: 1200 };

    await updateMessPlan(req, res, next);

    expect(updateMessPlanServiceMock).toHaveBeenCalledWith("p9", { price: 1200 });
    expect(sendSuccessMock).toHaveBeenCalledWith(res, 200, "Mess plan updated successfully", { _id: "p3" });
  });

  test("deleteMessPlan calls service and sendSuccess with null data", async () => {
    req.params.id = "p7";

    await deleteMessPlan(req, res, next);

    expect(deleteMessPlanServiceMock).toHaveBeenCalledWith("p7");
    expect(sendSuccessMock).toHaveBeenCalledWith(res, 200, "Mess plan deleted successfully", null);
  });

  test("forwards getAllMessPlans errors to next", async () => {
    getAllMessPlansServiceMock.mockRejectedValueOnce(new Error("service fail"));

    await getAllMessPlans(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe("service fail");
    expect(sendSuccessMock).not.toHaveBeenCalled();
  });
});

