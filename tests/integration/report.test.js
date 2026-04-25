import request from "supertest";
import app from "../../backend/src/app.js";

describe("REPORT MODULE", () => {
    test("GET /api/v1/reports/dashboard/admin should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/reports/dashboard/admin");

        expect(res.statusCode).toBe(401);
    });

    test("GET /api/v1/reports/occupancy should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/reports/occupancy");

        expect(res.statusCode).toBe(401);
    });
});
