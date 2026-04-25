import { jest } from "@jest/globals";
import { authorizeRoles } from "../../backend/src/middlewares/roleMiddleware.js";

describe("authorizeRoles middleware", () => {
  let res;
  let next;

  beforeEach(() => {
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 401 when req.user is missing", () => {
    const middleware = authorizeRoles("hostel_admin");
    const req = {};

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authenticated",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when user role is not allowed", () => {
    const middleware = authorizeRoles("hostel_admin", "warden");
    const req = { user: { role: "student" } };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Role student not allowed",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next when user role is allowed", () => {
    const middleware = authorizeRoles("hostel_admin", "warden");
    const req = { user: { role: "warden" } };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

