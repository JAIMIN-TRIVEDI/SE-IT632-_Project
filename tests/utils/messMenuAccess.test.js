import { describe, expect, test } from "@jest/globals";
import {
  filterMenuByAllowedMeals,
  getAllowedMealsForPlan,
  isSubscriptionActiveNow,
} from "../../backend/src/utils/messMealAccess.js";

describe("messMealAccess", () => {
  test("resolves allowed meals from plan flags", () => {
    const allowedMeals = getAllowedMealsForPlan({
      name: "Money Saver Plan",
      meals: {
        breakfast: false,
        lunch: true,
        snacks: false,
        dinner: true,
      },
    });

    expect(allowedMeals).toEqual(["lunch", "dinner"]);
  });

  test("filters disallowed meals from the menu payload", () => {
    const filteredMenu = filterMenuByAllowedMeals(
      {
        monday: {
          breakfast: "Idli",
          lunch: "Rice",
          snacks: "Tea",
          dinner: "Roti",
        },
      },
      ["lunch", "dinner"],
    );

    expect(filteredMenu).toEqual({
      monday: {
        lunch: "Rice",
        dinner: "Roti",
      },
    });
  });

  test("treats expired subscriptions as inactive", () => {
    const activeNow = isSubscriptionActiveNow(
      {
        status: "active",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2026-04-30T23:59:59.000Z",
      },
      new Date("2026-04-15T12:00:00.000Z"),
    );

    const expired = isSubscriptionActiveNow(
      {
        status: "active",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2026-04-10T23:59:59.000Z",
      },
      new Date("2026-04-15T12:00:00.000Z"),
    );

    expect(activeNow).toBe(true);
    expect(expired).toBe(false);
  });

  test("keeps the subscription active for the full end date", () => {
    const activeOnEndDate = isSubscriptionActiveNow(
      {
        status: "active",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2026-04-15T00:00:00.000Z",
      },
      new Date("2026-04-15T18:30:00.000Z"),
    );

    expect(activeOnEndDate).toBe(true);
  });
});
