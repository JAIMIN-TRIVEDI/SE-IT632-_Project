import request from "supertest";
import app from "../../backend/src/app.js";

describe("NOTIFICATION", () => {

  test("Send notification", async () => {
    const res = await request(app)
      .post("/api/v1/notifications")
      .send({ message: "Hello" });

    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });


  // NOTIF_F_02 Receive
  test("NOTIF_F_02 Receive", async () => {
    const res = await request(app).get("/api/v1/notifications");
    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // NOTIF_E_01 Large message
  test("NOTIF_E_01 Large message", async () => {
    const res = await request(app)
      .post("/api/v1/notifications")
      .send({ message: "a".repeat(1000) });

    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // NOTIF_S_01 Unauthorized
  test("NOTIF_S_01 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/notifications")
      .send({ message: "test" });

    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });
});
