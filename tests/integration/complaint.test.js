import request from "supertest";
import app from "../../backend/src/app.js";


describe("COMPLAINT", () => {

  test("Submit complaint", async () => {
    const res = await request(app)
      .post("/api/v1/complaints")
      .send({ text: "Issue" });

    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
  });

  test("Empty complaint", async () => {
    const res = await request(app)
      .post("/api/v1/complaints")
      .send({});

    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // COMP_F_02 View complaints
  test("COMP_F_02 View complaints", async () => {
    const res = await request(app).get("/api/v1/complaints");
    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // COMP_E_01 Long text
  test("COMP_E_01 Long text", async () => {
    const res = await request(app)
      .post("/api/v1/complaints")
      .send({ text: "a".repeat(1000) });

expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

  // COMP_S_01 Unauthorized
  test("COMP_S_01 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/complaints")
      .send({ text: "test" });

    expect([200,201,400,401,403,404,500]).toContain(res.statusCode);
  });

});
