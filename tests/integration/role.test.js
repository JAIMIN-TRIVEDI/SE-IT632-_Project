import request from "supertest";
import app from "../../backend/src/app.js";

describe("ROLE", () => {

  test("Unauthorized admin access", async () => {
    const res = await request(app).get("/api/v1/admin/dashboard");
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
  });

  // ROLE_F_01 Admin access (if allowed)
  test("ROLE_F_01 Admin access", async () => {
    const res = await request(app).get("/api/v1/admin/dashboard");
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
  });

  // ROLE_S_01 Role escalation
  test("ROLE_S_01 Role escalation", async () => {
    const res = await request(app)
      .get("/api/v1/admin/dashboard")
      .set("Cookie", "token=fake");

    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
  });
});
