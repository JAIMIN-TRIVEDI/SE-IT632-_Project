import dotenv from "dotenv";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB } from "./db.js";

dotenv.config({ path: "../backend/.env" });
jest.setTimeout(30000);

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});