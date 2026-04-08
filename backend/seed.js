import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Hostel from "./src/models/Hostel.js";
import Block from "./src/models/Block.js";
import Room from "./src/models/Room.js";
import RoomAllocation from "./src/models/RoomAllocation.js";
import RoomRequest from "./src/models/RoomRequest.js";
import Complaint from "./src/models/Complaint.js";
import Payment from "./src/models/Payment.js";
import MessMenu from "./src/models/MessMenu.js";
import MessPlan from "./src/models/MessPlan.js";
import MessSubscription from "./src/models/MessSubscription.js";
import Notification from "./src/models/Notification.js";
import VacateRequest from "./src/models/VacateRequest.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // ❌ Clear old data
    await Promise.all([
      User.deleteMany(),
      Hostel.deleteMany(),
      Block.deleteMany(),
      Room.deleteMany(),
      RoomAllocation.deleteMany(),
      RoomRequest.deleteMany(),
      Complaint.deleteMany(),
      Payment.deleteMany(),
      MessMenu.deleteMany(),
      MessPlan.deleteMany(),
      MessSubscription.deleteMany(),
      Notification.deleteMany(),
      VacateRequest.deleteMany(),
    ]);

    // ✅ Create demo users
    const users = [
      {
        name: "Aman Sharma",
        email: "student1@test.com",
        password: "123456",
        phone: "9999990001",
        gender: "male",
        role: "student",
        isActive: true,
        enrollmentNo: "STU1001",
      },
      {
        name: "Priya Patel",
        email: "student2@test.com",
        password: "123456",
        phone: "9999990002",
        gender: "female",
        role: "student",
        isActive: true,
        enrollmentNo: "STU1002",
      },
      {
        name: "Rahul Verma",
        email: "student3@test.com",
        password: "123456",
        phone: "9999990003",
        gender: "male",
        role: "student",
        isActive: true,
        enrollmentNo: "STU1003",
      },
      {
        name: "Sana Khan",
        email: "student4@test.com",
        password: "123456",
        phone: "9999990004",
        gender: "female",
        role: "student",
        isActive: true,
        enrollmentNo: "STU1004",
      },
      {
        name: "Warden Rohan",
        email: "warden1@test.com",
        password: "123456",
        phone: "9999990010",
        gender: "male",
        role: "warden",
        isActive: true,
      },
      {
        name: "Warden Nisha",
        email: "warden2@test.com",
        password: "123456",
        phone: "9999990011",
        gender: "female",
        role: "warden",
        isActive: true,
      },
      {
        name: "Hostel Admin",
        email: "admin@test.com",
        password: "123456",
        phone: "9999999993",
        gender: "male",
        role: "hostel_admin",
        isActive: true,
      },
      {
        name: "Mess Admin",
        email: "mess@test.com",
        password: "123456",
        phone: "9999999994",
        gender: "female",
        role: "mess_admin",
        isActive: true,
      },
    ];

    const createdUsers = [];
    for (const user of users) {
      const createdUser = await User.create(user);
      createdUsers.push(createdUser);
    }

    const student1 = createdUsers.find((u) => u.email === "student1@test.com");
    const student2 = createdUsers.find((u) => u.email === "student2@test.com");
    const student3 = createdUsers.find((u) => u.email === "student3@test.com");
    const student4 = createdUsers.find((u) => u.email === "student4@test.com");
    const warden1 = createdUsers.find((u) => u.email === "warden1@test.com");
    const warden2 = createdUsers.find((u) => u.email === "warden2@test.com");
    const hostelAdmin = createdUsers.find((u) => u.email === "admin@test.com");
    const messAdmin = createdUsers.find((u) => u.email === "mess@test.com");

    const hostels = await Hostel.insertMany([
      {
        name: "Boys Hostel A",
        type: "boy",
        wardenId: warden1._id,
        createdBy: hostelAdmin._id,
      },
      {
        name: "Girls Hostel B",
        type: "girl",
        wardenId: warden2._id,
        createdBy: hostelAdmin._id,
      },
    ]);

    const hostelA = hostels.find((h) => h.name === "Boys Hostel A");
    const hostelB = hostels.find((h) => h.name === "Girls Hostel B");

    const blocks = await Block.insertMany([
      { name: "A-Block", hostelId: hostelA._id, totalRooms: 3, occupiedRooms: 1 },
      { name: "B-Block", hostelId: hostelA._id, totalRooms: 2, occupiedRooms: 1 },
      { name: "C-Block", hostelId: hostelB._id, totalRooms: 2, occupiedRooms: 1 },
    ]);

    const blockA = blocks.find((b) => b.name === "A-Block");
    const blockB = blocks.find((b) => b.name === "B-Block");
    const blockC = blocks.find((b) => b.name === "C-Block");

    const rooms = await Room.insertMany([
      {
        roomNumber: "A101",
        hostelId: hostelA._id,
        blockId: blockA._id,
        roomType: "double",
        capacity: 2,
        price: 4500,
        occupiedCount: 1,
        status: "available",
      },
      {
        roomNumber: "A102",
        hostelId: hostelA._id,
        blockId: blockA._id,
        roomType: "double",
        capacity: 2,
        price: 4600,
        occupiedCount: 2,
        status: "full",
      },
      {
        roomNumber: "A103",
        hostelId: hostelA._id,
        blockId: blockA._id,
        roomType: "triple",
        capacity: 3,
        price: 5200,
        occupiedCount: 0,
        status: "maintenance",
      },
      {
        roomNumber: "B201",
        hostelId: hostelA._id,
        blockId: blockB._id,
        roomType: "triple",
        capacity: 3,
        price: 5300,
        occupiedCount: 2,
        status: "available",
      },
      {
        roomNumber: "B202",
        hostelId: hostelA._id,
        blockId: blockB._id,
        roomType: "quad",
        capacity: 4,
        price: 6200,
        occupiedCount: 4,
        status: "full",
      },
      {
        roomNumber: "C101",
        hostelId: hostelB._id,
        blockId: blockC._id,
        roomType: "double",
        capacity: 2,
        price: 4700,
        occupiedCount: 1,
        status: "available",
      },
      {
        roomNumber: "C102",
        hostelId: hostelB._id,
        blockId: blockC._id,
        roomType: "triple",
        capacity: 3,
        price: 5400,
        occupiedCount: 3,
        status: "full",
      },
    ]);

    const roomA102 = rooms.find((r) => r.roomNumber === "A102");
    const roomB202 = rooms.find((r) => r.roomNumber === "B202");
    const roomC101 = rooms.find((r) => r.roomNumber === "C101");
    const roomC102 = rooms.find((r) => r.roomNumber === "C102");
    const roomA101 = rooms.find((r) => r.roomNumber === "A101");
    const roomB201 = rooms.find((r) => r.roomNumber === "B201");

    const allocations = await RoomAllocation.insertMany([
      {
        studentId: student1._id,
        roomId: roomA102._id,
        hostelId: hostelA._id,
        status: "active",
        allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      },
      {
        studentId: student2._id,
        roomId: roomB202._id,
        hostelId: hostelA._id,
        status: "active",
        allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      },
      {
        studentId: student3._id,
        roomId: roomC102._id,
        hostelId: hostelB._id,
        status: "active",
        allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
    ]);

    const roomRequest = await RoomRequest.create({
      studentId: student4._id,
      hostelId: hostelA._id,
      roomId: roomA101._id,
      roomType: "double",
      amount: 4500,
      status: "pending",
      paymentStatus: "pending",
    });

    const complaints = await Complaint.insertMany([
      {
        studentId: student1._id,
        hostelId: hostelA._id,
        category: "Plumbing",
        title: "Leaking pipe in bathroom",
        urgency: "urgent",
        description: "The shower area has a continuous leak and is creating a slippery floor.",
        status: "pending",
        assignedTo: warden1._id,
      },
      {
        studentId: student3._id,
        hostelId: hostelB._id,
        category: "Electrical",
        title: "Fan not working",
        urgency: "normal",
        description: "The ceiling fan is not switching on in room C102.",
        status: "in_progress",
        assignedTo: warden2._id,
      },
    ]);

    const messPlans = await MessPlan.insertMany([
      {
        name: "Standard Mess Plan",
        price: 2500,
        durationInDays: 30,
        createdBy: messAdmin._id,
      },
      {
        name: "Premium Mess Plan",
        price: 4000,
        durationInDays: 30,
        createdBy: messAdmin._id,
      },
    ]);

    const messMenu = await MessMenu.create({
      weekStart: new Date(),
      menu: {
        monday: { breakfast: "Poha", lunch: "Rajma Rice", dinner: "Paneer Butter Masala" },
        tuesday: { breakfast: "Idli", lunch: "Chole Bhature", dinner: "Vegetable Biryani" },
        wednesday: { breakfast: "Paratha", lunch: "Dal Makhani", dinner: "Mixed Veg" },
        thursday: { breakfast: "Muesli", lunch: "Sambar Rice", dinner: "Chole Rice" },
        friday: { breakfast: "Upma", lunch: "Aloo Gobi", dinner: "Roti Sabzi" },
        saturday: { breakfast: "Bread Omelette", lunch: "Paneer Rice", dinner: "Schezwan Noodles" },
        sunday: { breakfast: "Dosa", lunch: "Veg Pulao", dinner: "Salad & Soup" },
      },
    });

    await MessSubscription.insertMany([
      {
        studentId: student1._id,
        planId: messPlans[0]._id,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        status: "active",
      },
      {
        studentId: student2._id,
        planId: messPlans[1]._id,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        status: "expired",
        refund: { requested: false, approved: false, amount: 0 },
      },
    ]);

    await Payment.insertMany([
      {
        userId: student1._id,
        type: "hostel",
        amount: 4500,
        orderId: "ORD-1001",
        paymentId: "PAY-1001",
        purpose: "Hostel room fee",
        status: "success",
      },
      {
        userId: student3._id,
        type: "room_request",
        amount: 4500,
        orderId: "ORD-1002",
        paymentId: "PAY-1002",
        purpose: "Room request deposit",
        subscriptionId: roomRequest._id,
        status: "pending",
      },
      {
        userId: student2._id,
        type: "mess",
        amount: 4000,
        orderId: "ORD-1003",
        paymentId: "PAY-1003",
        purpose: "Mess subscription",
        status: "success",
      },
    ]);

    await Notification.insertMany([
      {
        userId: warden1._id,
        message: "New complaint has been assigned to you in Boys Hostel A.",
        type: "complaint",
      },
      {
        userId: student4._id,
        message: "Your room request is pending approval.",
        type: "request",
      },
      {
        userId: student2._id,
        message: "Your mess subscription has expired.",
        type: "mess",
      },
    ]);

    await VacateRequest.create({
      studentId: student2._id,
      roomId: roomB202._id,
      hostelId: hostelA._id,
      allocationId: allocations.find((a) => a.studentId.toString() === student2._id.toString())._id,
      reason: "Internship transfer request",
      status: "pending",
    });

    console.log("✅ Full database seed completed successfully.");
    console.log("Login with: warden1@test.com / 123456, admin@test.com / 123456, mess@test.com / 123456, student1@test.com / 123456");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();