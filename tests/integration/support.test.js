import request from "supertest";
import app from "../../backend/src/app.js";

describe("SUPPORT MODULE", () => {
    test("POST /api/v1/support/contact should validate required fields", async () => {
        const res = await request(app).post("/api/v1/support/contact").send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("POST /api/v1/support/subscribe should validate email format", async () => {
        const res = await request(app)
            .post("/api/v1/support/subscribe")
            .send({ email: "bad-email-format" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });
});
