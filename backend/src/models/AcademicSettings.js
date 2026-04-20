import mongoose from "mongoose";

const AcademicCourseSchema = new mongoose.Schema(
    {
        name: {
            type: String, enum: ["B.Tech", "M.Tech", "PhD", "MBA", "MCA", "BBA", "BCA"],
            required: true,
            trim: true,
        },
        totalSemesters: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false },
);

const AcademicSettingsSchema = new mongoose.Schema(
    {
        singletonKey: {
            type: String,
            required: true,
            unique: true,
            default: "default",
        },
        semesterStartDate: {
            type: Date,
            required: true,
        },
        semesterEndDate: {
            type: Date,
            required: true,
        },
        renewalWindowDays: {
            type: Number,
            default: 7,
            min: 1,
            max: 30,
        },
        courses: {
            type: [AcademicCourseSchema],
            default: [],
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true },
);

export default mongoose.model("AcademicSettings", AcademicSettingsSchema);
