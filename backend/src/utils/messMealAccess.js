const MENU_MEAL_KEYS = ["breakfast", "lunch", "snacks", "dinner"];

const PLAN_NAME_MEALS = {
  "money saver": ["lunch", "dinner"],
  "money saver plan": ["lunch", "dinner"],
  standard: MENU_MEAL_KEYS,
  "standard plan": MENU_MEAL_KEYS,
  premium: MENU_MEAL_KEYS,
  "premium plan": MENU_MEAL_KEYS,
};

const normalizePlanName = (name = "") => String(name).trim().toLowerCase();

const toDateOnlyKey = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isSubscriptionActiveNow = (subscription = {}, referenceDate = new Date()) => {
  if (!subscription || subscription.status !== "active") return false;
  if (!subscription.startDate || !subscription.endDate) return false;

  const startDate = new Date(subscription.startDate);
  const endDate = new Date(subscription.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return false;
  }

  const startKey = toDateOnlyKey(startDate);
  const endKey = toDateOnlyKey(endDate);
  const referenceKey = toDateOnlyKey(referenceDate);

  if (!startKey || !endKey || !referenceKey) {
    return false;
  }

  return startKey <= referenceKey && referenceKey <= endKey;
};

export const getAllowedMealsForPlan = (plan = {}) => {
  const meals = plan.meals;

  if (meals && typeof meals === "object") {
    const allowedMeals = MENU_MEAL_KEYS.filter((mealKey) => Boolean(meals[mealKey]));

    if (allowedMeals.length > 0) {
      return allowedMeals;
    }
  }

  return PLAN_NAME_MEALS[normalizePlanName(plan.name)] || [];
};

export const filterMenuByAllowedMeals = (menu = {}, allowedMeals = []) => {
  const allowedSet = new Set(allowedMeals);
  const filteredMenu = {};

  Object.entries(menu || {}).forEach(([dayKey, dayMeals]) => {
    if (!dayMeals || typeof dayMeals !== "object") {
      filteredMenu[dayKey] = dayMeals;
      return;
    }

    filteredMenu[dayKey] = {};

    Object.entries(dayMeals).forEach(([mealKey, value]) => {
      if (allowedSet.has(mealKey)) {
        filteredMenu[dayKey][mealKey] = value;
      }
    });
  });

  return filteredMenu;
};
