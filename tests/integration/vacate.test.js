import request from "supertest";
import app from "../../backend/src/app.js";

describe("VACATE MODULE", () => {
    test("GET /api/v1/vacate-requests/me should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/vacate-requests/me");

        expect(res.statusCode).toBe(401);
    });

    test("POST /api/v1/vacate-requests should reject anonymous request", async () => {
        const res = await request(app).post("/api/v1/vacate-requests").send({
            reason: "Personal",
            vacateDate: "2030-01-01",
        });

        expect(res.statusCode).toBe(401);
    });
});
