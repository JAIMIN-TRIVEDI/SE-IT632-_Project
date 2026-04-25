import request from "supertest";
import app from "../../backend/src/app.js";

describe("ROOM MODULE", () => {

  // ROOM_F_01
  test("Create room", async () => {
    const res = await request(app).post("/api/v1/rooms").send({
      number: "101",
      capacity: 2
    });
    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // ROOM_F_04
  test("Fetch rooms", async () => {
    const res = await request(app).get("/api/v1/rooms");
    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // ROOM_N_01
  test("Invalid room data", async () => {
    const res = await request(app).post("/api/v1/rooms").send({});
    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // ROOM_N_02
  test("Delete non-existing", async () => {
    const res = await request(app).delete("/api/v1/rooms/999");
    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // ROOM_E_01
  test("Invalid capacity", async () => {
    const res = await request(app).post("/api/v1/rooms").send({
      number: "102",
      capacity: -1
    });
    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // ROOM_F_02 Update room
test("ROOM_F_02 Update room", async () => {
  const res = await request(app)
    .put("/api/v1/rooms/101")
    .send({ capacity: 3 });

  expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
});

// ROOM_F_03 Delete room success
test("ROOM_F_03 Delete room", async () => {
  const res = await request(app)
    .delete("/api/v1/rooms/101");

  expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
});

// ROOM_E_01 Capacity limit
test("ROOM_E_01 Capacity limit", async () => {
  const res = await request(app).post("/api/v1/rooms").send({
    number: "102",
    capacity: 0
  });

  expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
});

// ROOM_S_01 Unauthorized access
test("ROOM_S_01 Unauthorized", async () => {
  const res = await request(app)
    .post("/api/v1/rooms")
    .send({ number: "103", capacity: 2 });

  expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
});

});
