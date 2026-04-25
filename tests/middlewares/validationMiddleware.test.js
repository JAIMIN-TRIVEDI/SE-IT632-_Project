import { jest } from "@jest/globals";
import AppError from "../../backend/src/utils/AppError.js";

const validationResultMock = jest.fn();

jest.unstable_mockModule("express-validator", () => ({
  validationResult: validationResultMock,
}));

const { validateRequest } = await import("../../backend/src/middlewares/validationMiddleware.js");

describe("validateRequest middleware", () => {
  const req = {};
  const res = {};
  let next;

  beforeEach(() => {
    next = jest.fn();
    validationResultMock.mockReset();
  });

  test("calls next() when there are no validation errors", () => {
    validationResultMock.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test("passes AppError to next when validation has errors", () => {
    validationResultMock.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Email is required" }],
    });

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const passedError = next.mock.calls[0][0];
    expect(passedError).toBeInstanceOf(AppError);
    expect(passedError.message).toBe("Email is required");
    expect(passedError.statusCode).toBe(400);
  });
});

