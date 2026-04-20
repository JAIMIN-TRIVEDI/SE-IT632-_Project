import mongoose from "mongoose";

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.MONGO_URI_DIRECT;

  if (!primaryUri) {
    console.error("MongoDB connection failed: MONGO_URI is not set.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(primaryUri, {
      family: 4
    });

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    const isSrvDnsError =
      error?.message?.includes("querySrv") ||
      error?.message?.includes("ENOTFOUND") ||
      error?.message?.includes("ECONNREFUSED");

    if (isSrvDnsError && fallbackUri) {
      try {
        const fallbackConn = await mongoose.connect(fallbackUri, {
          family: 4
        });

        console.warn(
          "MongoDB SRV lookup failed for MONGO_URI; connected using MONGO_URI_DIRECT instead."
        );
        console.log("MongoDB Connected:", fallbackConn.connection.host);
        return;
      } catch (fallbackError) {
        console.error("MongoDB fallback connection failed:", fallbackError.message);
        process.exit(1);
      }
    }

    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;