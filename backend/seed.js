import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // ❌ Clear old users
    await User.deleteMany();

    // ✅ Create demo users
    const users = [
      {
        name: "Student User",
        email: "student@test.com",
        password: "123456",
        phone: "9999999991",
        gender: "male",
        role: "student",
        isActive: true
      },
      {
        name: "Warden User",
        email: "warden@test.com",
        password: "123456",
        phone: "9999999992",
        gender: "male",
        role: "warden",
        isActive: true
      },
      {// create a new one for testing 
        name: "Hostel Admin",
        email: "admin@test.com",
        password: "123456",
        phone: "9999999993",
        gender: "male",
        role: "hostel_admin",
        isActive: true
      },
      {
        name: "Mess Admin",
        email: "mess@test.com",
        password: "123456",
        phone: "9999999994",
        gender: "female",
        role: "mess_admin",
        isActive: true
      }
    ];

    // ⚠️ IMPORTANT: use create (so password gets hashed)
    for (let user of users) {
      await User.create(user);
    }

    console.log("✅ Demo users inserted successfully");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();