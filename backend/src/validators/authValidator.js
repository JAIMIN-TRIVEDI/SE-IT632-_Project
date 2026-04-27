import { body } from "express-validator";
import User from "../models/User.js"; // adjust path if needed

// ── REGISTRATION VALIDATION ─────────────────────────────────────────────────
export const registerValidation = [
  // Name
  body(["name", "fullName"]).custom((value, { req }) => {
    const name = req.body.name || req.body.fullName;

    if (!name || name.trim().length < 3) {
      throw new Error("Name must be at least 3 characters long");
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      throw new Error("Name can only contain letters and spaces");
    }

    req.body.name = name.trim();
    return true;
  }),

  // Email
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom(async (email) => {
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error("Email already registered");
      }
    }),

  // Phone
  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be 10 digits"),

  // Enrollment No
  body("enrollmentNo")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Enrollment number must be at least 5 characters"),

  // Course
  body("course")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Course cannot be empty"),

  // // Study Year
  // body("studyYear")
  //   .optional()
  //   .isInt({ min: 1, max: 12 })
  //   .withMessage("Study year must be between 1 and 12"),

  // // Admission Year
  // body("admissionYear")
  //   .optional()
  //   .isInt({ min: 2000, max: new Date().getFullYear() })
  //   .withMessage("Invalid admission year"),

  // // Gender
  // body("gender")
  //   .notEmpty()
  //   .withMessage("Gender is required")
  //   .isIn(["male", "female", "other"])
  //   .withMessage("Invalid gender value"),

  // Password
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),


  // // Role (important for your system)
  // body("role")
  //   .notEmpty()
  //   .withMessage("Role is required")
  //   .isIn(["student", "warden", "hostel_admin", "mess_admin"])
  //   .withMessage("Invalid role"),

  // // Emergency Phone (optional but strict)
  // body("emergencyPhone")
  //   .optional()
  //   .matches(/^[0-9]{10}$/)
  //   .withMessage("Emergency phone must be 10 digits"),
];


// ── LOGIN VALIDATION ─────────────────────────────────────────────────
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];