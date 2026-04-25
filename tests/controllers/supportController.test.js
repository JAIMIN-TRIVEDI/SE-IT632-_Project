import { jest } from "@jest/globals";
import AppError from "../../backend/src/utils/AppError.js";

const sendEmailMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.unstable_mockModule("../../backend/src/utils/sendEmail.js", () => ({
  default: sendEmailMock,
}));

jest.unstable_mockModule("../../backend/src/utils/apiResponse.js", () => ({
  sendSuccess: sendSuccessMock,
}));

const {
  submitSupportMessage,
  subscribeToNewsletter,
} = await import("../../backend/src/controllers/supportController.js");

describe("supportController", () => {
  const originalEnv = { ...process.env };
  let req;
  let res;
  let next;
  let warnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    req = { body: {} };
    res = { marker: "res" };
    next = jest.fn();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    sendSuccessMock.mockImplementation((_res, _code, _message, data) => ({ ok: true, data }));
    sendEmailMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("submitSupportMessage", () => {
    test("handles undefined body via fallback and returns required-fields AppError", async () => {
      req.body = undefined;

      await submitSupportMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Name, email, subject, and message are required.");
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    test("passes AppError to next when required fields are missing", async () => {
      req.body = { name: "A" };

      await submitSupportMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Name, email, subject, and message are required.");
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(sendSuccessMock).not.toHaveBeenCalled();
    });

    test("passes AppError to next for invalid email", async () => {
      req.body = {
        name: "A",
        email: "invalid-email",
        subject: "Need help",
        message: "Hello",
      };

      await submitSupportMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Please provide a valid email address.");
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    test("sends email and returns delivered true when email service is configured", async () => {
      process.env.EMAIL_USER = "noreply@hostezy.com";
      process.env.EMAIL_PASS = "pass";
      process.env.SUPPORT_EMAIL = "support@hostezy.com";

      req.body = {
        name: "Jane",
        email: "jane@example.com",
        subject: "Room issue",
        message: "Please assist",
        topic: "rooms",
      };

      await submitSupportMessage(req, res, next);

      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      expect(sendEmailMock.mock.calls[0][0]).toBe("support@hostezy.com");
      expect(sendEmailMock.mock.calls[0][1]).toContain("[Hostezy Support - rooms] Room issue");
      expect(sendSuccessMock).toHaveBeenCalledWith(
        res,
        200,
        "Your message has been sent successfully.",
        { delivered: true }
      );
      expect(next).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test("falls back to general topic and returns delivered false when service is unavailable", async () => {
      delete process.env.SUPPORT_EMAIL;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;

      req.body = {
        name: "Jane",
        email: "jane@example.com",
        subject: "Question",
        message: "Hello",
      };

      await submitSupportMessage(req, res, next);

      expect(sendEmailMock).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(sendSuccessMock).toHaveBeenCalledWith(
        res,
        200,
        "Your message has been recorded. Email delivery is currently unavailable.",
        { delivered: false }
      );
      expect(next).not.toHaveBeenCalled();
    });

    test("passes thrown sendEmail errors to next", async () => {
      process.env.EMAIL_USER = "noreply@hostezy.com";
      process.env.EMAIL_PASS = "pass";
      sendEmailMock.mockRejectedValueOnce(new Error("smtp down"));

      req.body = {
        name: "Jane",
        email: "jane@example.com",
        subject: "Question",
        message: "Hello",
      };

      await submitSupportMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].message).toBe("smtp down");
      expect(sendSuccessMock).not.toHaveBeenCalled();
    });
  });

  describe("subscribeToNewsletter", () => {
    test("handles undefined body via fallback and returns email-required AppError", async () => {
      req.body = undefined;

      await subscribeToNewsletter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Email is required.");
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    test("passes AppError to next when email is missing", async () => {
      req.body = {};

      await subscribeToNewsletter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Email is required.");
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    test("passes AppError to next for invalid email", async () => {
      req.body = { email: "bad-email" };

      await subscribeToNewsletter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Please provide a valid email address.");
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    test("sends email and returns delivered true when configured", async () => {
      process.env.EMAIL_USER = "noreply@hostezy.com";
      process.env.EMAIL_PASS = "pass";

      req.body = { email: "sub@example.com" };

      await subscribeToNewsletter(req, res, next);

      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      expect(sendEmailMock.mock.calls[0][0]).toBe("noreply@hostezy.com");
      expect(sendSuccessMock).toHaveBeenCalledWith(
        res,
        200,
        "Subscribed successfully.",
        { delivered: true }
      );
      expect(next).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test("returns delivered false when service is unavailable", async () => {
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
      delete process.env.SUPPORT_EMAIL;

      req.body = { email: "sub@example.com" };

      await subscribeToNewsletter(req, res, next);

      expect(sendEmailMock).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(sendSuccessMock).toHaveBeenCalledWith(
        res,
        200,
        "Subscription saved. Email delivery is currently unavailable.",
        { delivered: false }
      );
      expect(next).not.toHaveBeenCalled();
    });

    test("passes sendEmail errors to next", async () => {
      process.env.EMAIL_USER = "noreply@hostezy.com";
      process.env.EMAIL_PASS = "pass";
      sendEmailMock.mockRejectedValueOnce(new Error("mail down"));

      req.body = { email: "sub@example.com" };

      await subscribeToNewsletter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].message).toBe("mail down");
      expect(sendSuccessMock).not.toHaveBeenCalled();
    });
  });
});

