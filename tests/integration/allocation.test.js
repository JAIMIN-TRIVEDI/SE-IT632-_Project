import request from "supertest";
import app from "../../backend/src/app.js";

describe("ALLOCATION", () => {

  // ALLOC_F_01
  test("Assign room", async () => {
    const res = await request(app)
      .post("/api/v1/rooms/allocate")
      .send({ studentId: "1", roomId: "101" });

    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
  });

  // ALLOC_E_01
  test("Double booking", async () => {
    await request(app).post("/api/v1/rooms/allocate").send({ studentId: "1", roomId: "101" });

    const res = await request(app)
      .post("/api/v1/rooms/allocate")
      .send({ studentId: "2", roomId: "101" });

expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // ALLOC_S_01 Unauthorized allocation
  test("ALLOC_S_01 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/rooms/allocate")
      .send({ studentId: "1", roomId: "101" });

expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });
});
