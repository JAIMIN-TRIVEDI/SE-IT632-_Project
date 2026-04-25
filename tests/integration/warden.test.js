import request from "supertest";
import app from "../../backend/src/app.js";

describe("WARDEN MODULE", () => {
    test("GET /api/v1/warden/dashboard should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/warden/dashboard");

        expect(res.statusCode).toBe(401);
    });
});
