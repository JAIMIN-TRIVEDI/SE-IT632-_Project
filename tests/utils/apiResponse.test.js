import { jest } from "@jest/globals";
import { sendSuccess } from "../../backend/src/utils/apiResponse.js";

describe("sendSuccess", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("uses default values when optional args are omitted", () => {
    const result = sendSuccess(res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Success",
      data: null,
    });
    expect(result).toBe(res);
  });

  test("uses provided status, message, and data", () => {
    const payload = { id: "u1", name: "Alice" };
    const result = sendSuccess(res, 201, "Created", payload);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Created",
      data: payload,
    });
    expect(result).toBe(res);
  });
});

