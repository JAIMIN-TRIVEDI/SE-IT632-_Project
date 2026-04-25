import { jest } from "@jest/globals";

const getAcademicSettingsMock = jest.fn();
const upsertAcademicSettingsMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.unstable_mockModule("../../backend/src/services/academicPolicyService.js", () => ({
  getAcademicSettings: getAcademicSettingsMock,
  upsertAcademicSettings: upsertAcademicSettingsMock,
}));

jest.unstable_mockModule("../../backend/src/utils/apiResponse.js", () => ({
  sendSuccess: sendSuccessMock,
}));

const {
  getPublicAcademicSettings,
  getAcademicSettingsForAdmin,
  updateAcademicSettings,
} = await import("../../backend/src/controllers/academicSettingsController.js");

describe("academicSettingsController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = { marker: "res" };
    next = jest.fn();

    getAcademicSettingsMock.mockReset();
    upsertAcademicSettingsMock.mockReset();
    sendSuccessMock.mockReset();

    sendSuccessMock.mockImplementation((_res, _code, _msg, payload) => payload);
  });

  test("getPublicAcademicSettings returns default payload when settings do not exist", async () => {
    getAcademicSettingsMock.mockResolvedValueOnce(null);

    await getPublicAcademicSettings(req, res, next);

    expect(getAcademicSettingsMock).toHaveBeenCalledTimes(1);
    expect(sendSuccessMock).toHaveBeenCalledWith(
      res,
      200,
      "Academic settings fetched successfully",
      {
        semesterStartDate: null,
        semesterEndDate: null,
        renewalWindowDays: 7,
        courses: [],
        configured: false,
      }
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("getAcademicSettingsForAdmin maps courses and fallbacks correctly", async () => {
    getAcademicSettingsMock.mockResolvedValueOnce({
      semesterStartDate: "2026-01-01",
      semesterEndDate: "2026-06-01",
      renewalWindowDays: "14",
      updatedAt: "2026-04-01T10:00:00.000Z",
      courses: [
        {
          name: "B.Tech IT",
          totalSemesters: undefined,
          oddSemesterStartDate: "2026-01-01",
          oddSemesterEndDate: "2026-03-30",
          evenSemesterStartDate: "2026-04-01",
          evenSemesterEndDate: "2026-06-01",
        },
        {
          name: "MCA",
          totalSemesters: 4,
          oddSemesterStartDate: "2026-01-01",
          oddSemesterEndDate: "2026-03-30",
          evenSemesterStartDate: "2026-04-01",
          evenSemesterEndDate: "2026-06-01",
          isActive: false,
        },
      ],
    });

    await getAcademicSettingsForAdmin(req, res, next);

    expect(getAcademicSettingsMock).toHaveBeenCalledTimes(1);
    expect(sendSuccessMock).toHaveBeenCalledWith(
      res,
      200,
      "Academic settings fetched successfully",
      {
        semesterStartDate: "2026-01-01",
        semesterEndDate: "2026-06-01",
        renewalWindowDays: 14,
        courses: [
          {
            name: "B.Tech IT",
            totalSemesters: 0,
            oddSemesterStartDate: "2026-01-01",
            oddSemesterEndDate: "2026-03-30",
            evenSemesterStartDate: "2026-04-01",
            evenSemesterEndDate: "2026-06-01",
            isActive: true,
          },
          {
            name: "MCA",
            totalSemesters: 4,
            oddSemesterStartDate: "2026-01-01",
            oddSemesterEndDate: "2026-03-30",
            evenSemesterStartDate: "2026-04-01",
            evenSemesterEndDate: "2026-06-01",
            isActive: false,
          },
        ],
        configured: true,
        updatedAt: "2026-04-01T10:00:00.000Z",
      }
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("updateAcademicSettings handles undefined body and user", async () => {
    req = {
      body: undefined,
      user: undefined,
    };

    upsertAcademicSettingsMock.mockResolvedValueOnce({
      semesterStartDate: null,
      semesterEndDate: null,
      renewalWindowDays: undefined,
      courses: null,
      updatedAt: "2026-05-01T00:00:00.000Z",
    });

    await updateAcademicSettings(req, res, next);

    expect(upsertAcademicSettingsMock).toHaveBeenCalledWith({
      semesterStartDate: undefined,
      semesterEndDate: undefined,
      courses: undefined,
      renewalWindowDays: undefined,
      updatedBy: undefined,
    });

    expect(sendSuccessMock).toHaveBeenCalledWith(
      res,
      200,
      "Academic settings updated successfully",
      {
        semesterStartDate: null,
        semesterEndDate: null,
        renewalWindowDays: 7,
        courses: [],
        configured: true,
        updatedAt: "2026-05-01T00:00:00.000Z",
      }
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("updateAcademicSettings forwards body values and user id", async () => {
    req = {
      body: {
        semesterStartDate: "2026-01-01",
        semesterEndDate: "2026-06-01",
        renewalWindowDays: 10,
        courses: [],
      },
      user: { _id: "admin1" },
    };

    upsertAcademicSettingsMock.mockResolvedValueOnce({
      semesterStartDate: "2026-01-01",
      semesterEndDate: "2026-06-01",
      renewalWindowDays: 10,
      courses: [],
      updatedAt: "2026-05-02T00:00:00.000Z",
    });

    await updateAcademicSettings(req, res, next);

    expect(upsertAcademicSettingsMock).toHaveBeenCalledWith({
      semesterStartDate: "2026-01-01",
      semesterEndDate: "2026-06-01",
      courses: [],
      renewalWindowDays: 10,
      updatedBy: "admin1",
    });
    expect(sendSuccessMock).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

