import request from "supertest";
import app from "../../backend/src/app.js";

describe("USER MODULE", () => {
    test("GET /api/v1/user/profile should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/user/profile");

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message");
    });

    test("GET /api/v1/user/student/dashboard should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/user/student/dashboard");

        expect(res.statusCode).toBe(401);
    });
});
