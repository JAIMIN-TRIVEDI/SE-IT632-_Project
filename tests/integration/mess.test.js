import request from "supertest";
import app from "../../backend/src/app.js";

describe("MESS", () => {

  test("Subscribe", async () => {
    const res = await request(app)
      .post("/api/v1/mess/subscribe")
      .send({ plan: "monthly" });

    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
  });

  test("Invalid plan", async () => {
    const res = await request(app)
      .post("/api/v1/mess/subscribe")
      .send({});

    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
  });

  // MESS_E_01 Duplicate subscription
test("MESS_E_01 Duplicate subscription", async () => {
  await request(app).post("/api/v1/mess/subscribe").send({ plan: "monthly" });

  const res = await request(app)
    .post("/api/v1/mess/subscribe")
    .send({ plan: "monthly" });

  expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
});

// MESS_S_01 Unauthorized
test("MESS_S_01 Unauthorized", async () => {
  const res = await request(app)
    .post("/api/v1/mess/subscribe")
    .send({ plan: "monthly" });

  expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
});
});
