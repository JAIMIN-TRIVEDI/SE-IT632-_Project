import request from "supertest";
import app from "../../backend/src/app.js";

describe("HOSTEL MODULE", () => {
    test("GET /api/v1/hostels/academic-settings/public should return 200", async () => {
        const res = await request(app).get("/api/v1/hostels/academic-settings/public");

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
    });

    test("GET /api/v1/hostels should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/hostels");

        expect(res.statusCode).toBe(401);
    });
});
