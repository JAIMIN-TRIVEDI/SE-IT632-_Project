import { jest } from "@jest/globals";
import User from "../../backend/src/models/User.js";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB } from "../setup/db.js";

jest.setTimeout(30000);

describe("User model", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await closeTestDB();
    await mongoose.disconnect();
  });

  test("hashes password when creating a new user", async () => {
    const user = await User.create({
      name: "Alice",
      email: "alice@example.com",
      password: "PlainPass123",
      role: "student",
      gender: "female",
    });

    expect(user.password).not.toBe("PlainPass123");
    expect(user.password).toMatch(/^\$2[aby]\$/);
  });

  test("does not rehash password when saving without password change", async () => {
    const user = await User.create({
      name: "Bob",
      email: "bob@example.com",
      password: "PlainPass456",
      role: "warden",
      gender: "male",
    });

    const originalHashedPassword = user.password;
    user.name = "Bob Updated";
    await user.save();

    expect(user.password).toBe(originalHashedPassword);
  });

  test("comparePassword returns true for correct password", async () => {
    const user = await User.create({
      name: "Carol",
      email: "carol@example.com",
      password: "MySecret789",
      role: "mess_admin",
      gender: "other",
    });

    const result = await user.comparePassword("MySecret789");

    expect(result).toBe(true);
  });

  test("comparePassword returns false for wrong password", async () => {
    const user = await User.create({
      name: "Dan",
      email: "dan@example.com",
      password: "RightPassword",
      role: "hostel_admin",
      gender: "male",
    });

    const result = await user.comparePassword("WrongPassword");

    expect(result).toBe(false);
  });
});

