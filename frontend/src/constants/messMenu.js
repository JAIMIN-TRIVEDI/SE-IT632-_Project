import { Cake, FreeBreakfast, Nightlight, WbSunny } from '@mui/icons-material'

export const MEAL_TYPES = [
  {
    key: 'breakfast',
    label: 'Breakfast',
    time: '08:00 - 09:30',
    icon: FreeBreakfast,
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    key: 'lunch',
    label: 'Lunch',
    time: '12:30 - 14:00',
    icon: WbSunny,
    color: '#0891b2',
    bg: '#e0f2fe',
  },
  {
    key: 'snacks',
    label: 'Snacks',
    time: '17:00 - 18:00',
    icon: Cake,
    color: '#ea580c',
    bg: '#ffedd5',
  },
  {
    key: 'dinner',
    label: 'Dinner',
    time: '20:00 - 21:30',
    icon: Nightlight,
    color: '#6d28d9',
    bg: '#ede9fe',
  },
]

const PLAN_NAME_MEALS = {
  'money saver': ['lunch', 'dinner'],
  'money saver plan': ['lunch', 'dinner'],
  standard: ['breakfast', 'lunch', 'snacks', 'dinner'],
  'standard plan': ['breakfast', 'lunch', 'snacks', 'dinner'],
  premium: ['breakfast', 'lunch', 'snacks', 'dinner'],
  'premium plan': ['breakfast', 'lunch', 'snacks', 'dinner'],
}

const normalizePlanName = (name = '') => String(name).trim().toLowerCase()

export const getAllowedMealKeys = (plan = {}) => {
  const meals = plan.meals

  if (meals && typeof meals === 'object') {
    const mealKeys = MEAL_TYPES.map((meal) => meal.key)
    const allowedMeals = mealKeys.filter((mealKey) => Boolean(meals[mealKey]))

    if (allowedMeals.length > 0) {
      return allowedMeals
    }
  }

  return PLAN_NAME_MEALS[normalizePlanName(plan.name)] || []
}
