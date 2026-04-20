import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
    getAcademicSettings,
    upsertAcademicSettings,
} from "../services/academicPolicyService.js";

const toApiPayload = (settings) => {
    if (!settings) {
        return {
            semesterStartDate: null,
            semesterEndDate: null,
            renewalWindowDays: 7,
            courses: [],
            configured: false,
        };
    }

    return {
        semesterStartDate: settings.semesterStartDate,
        semesterEndDate: settings.semesterEndDate,
        renewalWindowDays: Number(settings.renewalWindowDays || 7),
        courses: Array.isArray(settings.courses)
            ? settings.courses.map((course) => ({
                name: course.name,
                totalSemesters: Number(course.totalSemesters || 0),
                isActive: course.isActive !== false,
            }))
            : [],
        configured: true,
        updatedAt: settings.updatedAt,
    };
};

export const getPublicAcademicSettings = asyncHandler(async (_req, res) => {
    const settings = await getAcademicSettings();
    return sendSuccess(res, 200, "Academic settings fetched successfully", toApiPayload(settings));
});

export const getAcademicSettingsForAdmin = asyncHandler(async (_req, res) => {
    const settings = await getAcademicSettings();
    return sendSuccess(res, 200, "Academic settings fetched successfully", toApiPayload(settings));
});

export const updateAcademicSettings = asyncHandler(async (req, res) => {
    const { semesterStartDate, semesterEndDate, courses, renewalWindowDays } = req.body || {};

    const updated = await upsertAcademicSettings({
        semesterStartDate,
        semesterEndDate,
        courses,
        renewalWindowDays,
        updatedBy: req.user?._id,
    });

    return sendSuccess(res, 200, "Academic settings updated successfully", toApiPayload(updated));
});
