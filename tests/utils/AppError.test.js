import AppError from "../../backend/src/utils/AppError.js";

describe("AppError", () => {
  test("sets message and default statusCode when not provided", () => {
    const error = new AppError("Unexpected failure");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Unexpected failure");
    expect(error.statusCode).toBe(500);
  });

  test("sets custom statusCode when provided", () => {
    const error = new AppError("Not found", 404);

    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
  });
});

