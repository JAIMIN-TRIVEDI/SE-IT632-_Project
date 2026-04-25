import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";

const protectedModuleChecks = [
    { module: "auth", method: "get", path: "/api/v1/auth/me" },
    { module: "user", method: "get", path: "/api/v1/user/profile" },
    { module: "payment", method: "get", path: "/api/v1/payments/key" },
    { module: "room-request", method: "get", path: "/api/v1/room-requests/me" },
    { module: "mess", method: "get", path: "/api/v1/mess/plans" },
    { module: "notification", method: "get", path: "/api/v1/notifications" },
    { module: "vacate", method: "get", path: "/api/v1/vacate-requests/me" },
    { module: "complaint", method: "get", path: "/api/v1/complaints" },
    { module: "hostel", method: "get", path: "/api/v1/hostels" },
    { module: "report", method: "get", path: "/api/v1/reports/dashboard/admin" },
    { module: "warden", method: "get", path: "/api/v1/warden/dashboard" },
    // Room routes should also be mounted under /api/v1 if module wiring is complete.
    { module: "room", method: "get", path: "/api/v1/rooms/demo-room-id" },
];

for (const check of protectedModuleChecks) {
    test(`${check.module} module: ${check.method.toUpperCase()} ${check.path} rejects anonymous access`, async () => {
        const response = await request(app)[check.method](check.path);
        assert.equal(
            response.status,
            401,
            `Expected 401 from ${check.path}; got ${response.status}`,
        );
    });
}

test("support module: /contact validates required fields", async () => {
    const response = await request(app).post("/api/v1/support/contact").send({});
    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
});

test("support module: /subscribe validates email", async () => {
    const response = await request(app)
        .post("/api/v1/support/subscribe")
        .send({ email: "not-an-email" });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
});
