import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

import User from "./src/models/User.js";
import Hostel from "./src/models/Hostel.js";
import Room from "./src/models/Room.js";
import Complaint from "./src/models/Complaint.js";
import Payment from "./src/models/Payment.js";

import MessPlan from "./src/models/MessPlan.js";
import MessSubscription from "./src/models/MessSubscription.js";
import MessAttendance from "./src/models/MessAttendance.js";
import Notification from "./src/models/Notification.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB Connected");

const seed = async () => {
  try {

    console.log("Clearing database...");

    await User.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Complaint.deleteMany();
    await Payment.deleteMany();
    await MessPlan.deleteMany();
    await MessSubscription.deleteMany();
    await MessAttendance.deleteMany();
    await Notification.deleteMany();

    console.log("Database cleared");

    // =============================
    // CREATE ADMIN
    // =============================

    const admin = await User.create({
      name: "Hostel Admin",
      email: "admin@hostezy.com",
      password: "12345678",
      role: "hostel_admin"
    });

    console.log("Admin created");

    // =============================
    // CREATE MESS ADMIN
    // =============================

    const messAdmin = await User.create({
      name: "Mess Admin",
      email: "mess@hostezy.com",
      password: "12345678",
      role: "mess_admin"
    });

    console.log("Mess admin created");

    // =============================
    // CREATE WARDENS
    // =============================

    const wardens = [];

    for (let i = 0; i < 2; i++) {

      const warden = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "12345678",
        role: "warden"
      });

      wardens.push(warden);

    }

    console.log("Wardens created");

    // =============================
    // CREATE HOSTELS
    // =============================

    const hostels = [];

    for (let i = 0; i < 2; i++) {

      const hostel = await Hostel.create({
        name: `Hostel ${i + 1}`,
        type: i === 0 ? "boys" : "girls",
        location: faker.location.streetAddress(),
        totalRooms: 20,
        wardenId: wardens[i]._id
      });

      hostels.push(hostel);

    }

    console.log("Hostels created");

    // =============================
    // CREATE ROOMS
    // =============================

    const rooms = [];

    for (let i = 0; i < hostels.length; i++) {

      for (let j = 1; j <= 20; j++) {

        const room = await Room.create({

          roomNumber: `${i + 1}-${j}`,
          hostelId: hostels[i]._id,
          floor: Math.ceil(j / 5),
          type: "double",
          capacity: 2,
          occupied: 0,
          occupants: []

        });

        rooms.push(room);

      }

    }

    console.log("Rooms created");

    // =============================
    // CREATE STUDENTS
    // =============================

    const students = [];

    for (let i = 0; i < 50; i++) {

      const student = await User.create({

        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "12345678",
        role: "student",
        phone: faker.phone.number(),
        enrollmentNo: `2025${1000 + i}`

      });

      students.push(student);

    }

    console.log("Students created");

    // =============================
    // ROOM ALLOCATION
    // =============================

    for (let i = 0; i < students.length; i++) {

      const room = rooms[i % rooms.length];

      room.occupants.push(students[i]._id);
      room.occupied += 1;

      await room.save();

      students[i].roomId = room._id;
      students[i].hostelId = room.hostelId;

      await students[i].save();

    }

    console.log("Rooms allocated");

    // =============================
    // CREATE COMPLAINTS
    // =============================

    for (let i = 0; i < 20; i++) {

      await Complaint.create({

        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        category: faker.helpers.arrayElement([
          "electrical",
          "plumbing",
          "cleanliness",
          "furniture",
          "other"
        ]),
        studentId: students[i]._id,
        hostelId: students[i].hostelId,
        roomId: students[i].roomId,
        status: faker.helpers.arrayElement([
          "pending",
          "in_progress",
          "resolved",
          "rejected"
        ])

      });

    }

    console.log("Complaints created");

    // =============================
    // CREATE PAYMENTS
    // =============================

    for (let i = 0; i < students.length; i++) {

      await Payment.create({

        studentId: students[i]._id,
        amount: faker.number.int({ min: 2500, max: 4000 }),
        currency: "INR",
        status: "paid",
        purpose: faker.helpers.arrayElement([
          "mess_subscription",
          "hostel_fee"
        ])

      });

    }

    console.log("Payments created");

    // =============================
    // CREATE MESS PLAN
    // =============================

    const messPlan = await MessPlan.create({

      name: "Monthly Premium Plan",
      duration: "monthly",
      price: 3500,
      meals: ["breakfast", "lunch", "dinner"]

    });

    console.log("Mess plan created");

    // =============================
    // MESS SUBSCRIPTIONS
    // =============================

    for (let i = 0; i < students.length; i++) {

      await MessSubscription.create({

        studentId: students[i]._id,
        planId: messPlan._id,

        startDate: new Date(),

        endDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),

        status: "active"

      });

    }

    console.log("Mess subscriptions created");

    // =============================
    // MESS ATTENDANCE
    // =============================

    const meals = ["breakfast", "lunch", "dinner"];

    for (let i = 0; i < students.length; i++) {

      for (let j = 0; j < 7; j++) {

        await MessAttendance.create({

          studentId: students[i]._id,
          date: faker.date.recent(),
          mealType: faker.helpers.arrayElement(meals),
          attendanceStatus: "present"

        });

      }

    }

    console.log("Mess attendance created");

    // =============================
    // NOTIFICATIONS
    // =============================

    for (let i = 0; i < students.length; i++) {

      await Notification.create({

        userId: students[i]._id,
        title: "Mess Subscription Activated",
        message:
          "Your mess subscription has been activated successfully",
        type: "mess"

      });

      await Notification.create({

        userId: students[i]._id,
        title: "Hostel Announcement",
        message: faker.lorem.sentence(),
        type: "system"

      });

    }

    console.log("Notifications created");

    console.log("Database seeded successfully");

    process.exit();

  } catch (error) {

    console.error(error);
    process.exit(1);

  }
};

seed();