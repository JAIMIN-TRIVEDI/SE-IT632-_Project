import { jest } from "@jest/globals";
import { errorHandler } from "../../backend/src/middlewares/errorMiddleware.js";

describe("errorHandler middleware", () => {
  let req;
  let res;
  let next;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {};
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("uses provided statusCode and message", () => {
    const err = {
      statusCode: 401,
      message: "Unauthorized",
      stack: "stack-trace",
    };

    errorHandler(err, req, res, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith("stack-trace");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
      data: null,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("falls back to default statusCode and message", () => {
    const err = {
      stack: "fallback-stack",
    };

    errorHandler(err, req, res, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith("fallback-stack");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server Error",
      data: null,
    });
    expect(next).not.toHaveBeenCalled();
  });
});

