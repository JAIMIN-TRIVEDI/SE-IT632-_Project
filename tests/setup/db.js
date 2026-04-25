import mongoose from "mongoose";

export const connectTestDB = async () => {
  const uri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;
  const dbName = process.env.TEST_DB_NAME || "hostezy_test";

  if (!uri) {
    throw new Error(
      "Set TEST_MONGO_URI (preferred) or MONGO_URI for test execution.",
    );
  }

  await mongoose.connect(uri, {
    dbName,
  });
};

export const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};