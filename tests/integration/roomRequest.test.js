import request from "supertest";
import app from "../../backend/src/app.js";

describe("ROOM REQUEST MODULE", () => {
    test("GET /api/v1/room-requests/me should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/room-requests/me");

        expect(res.statusCode).toBe(401);
    });

    test("GET /api/v1/room-requests/available should reject anonymous request", async () => {
        const res = await request(app).get("/api/v1/room-requests/available");

        expect(res.statusCode).toBe(401);
    });
});
