export type PlannedMeal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export type WeeklyPlan = {
  meals: Record<DayKey, PlannedMeal[]>;
  checked: Record<string, string[]>;
};

const STORAGE_KEY = "laetrack:weekly-plan";

function emptyMeals(): Record<DayKey, PlannedMeal[]> {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sanitizeMeal(raw: unknown): PlannedMeal | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Partial<PlannedMeal>;
  if (typeof m.id !== "string" || typeof m.name !== "string") return null;
  const num = (v: unknown) => (typeof v === "number" && v >= 0 ? v : 0);
  return {
    id: m.id,
    name: m.name,
    calories: num(m.calories),
    protein: num(m.protein),
    carbs: num(m.carbs),
    fats: num(m.fats),
  };
}

export function loadWeeklyPlan(): WeeklyPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { meals: emptyMeals(), checked: {} };
    const parsed = JSON.parse(raw) as WeeklyPlan;

    const meals = emptyMeals();
    if (parsed && typeof parsed === "object" && parsed.meals) {
      for (const key of DAY_KEYS) {
        const list = (parsed.meals as Record<string, unknown>)[key];
        if (Array.isArray(list)) {
          meals[key] = list
            .map(sanitizeMeal)
            .filter((m): m is PlannedMeal => m !== null);
        }
      }
    }

    const checked: Record<string, string[]> = {};
    if (parsed?.checked && typeof parsed.checked === "object") {
      for (const [dateKey, ids] of Object.entries(parsed.checked)) {
        if (Array.isArray(ids)) {
          checked[dateKey] = ids.filter((id): id is string => typeof id === "string");
        }
      }
    }

    return { meals, checked };
  } catch {
    return { meals: emptyMeals(), checked: {} };
  }
}

function saveWeeklyPlan(plan: WeeklyPlan): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // storage unavailable, keep app usable in-session
  }
}

function updatePlan(update: (plan: WeeklyPlan) => WeeklyPlan): void {
  saveWeeklyPlan(update(loadWeeklyPlan()));
}

export function todayDayKey(date = new Date()): DayKey {
  // JS getDay(): 0=Sun..6=Sat -> DAY_KEYS order mon..sun
  const map = [6, 0, 1, 2, 3, 4, 5];
  return DAY_KEYS[map[date.getDay()]];
}

export function addPlannedMeal(day: DayKey, meal: Omit<PlannedMeal, "id">): void {
  updatePlan((p) => ({
    ...p,
    meals: { ...p.meals, [day]: [...p.meals[day], { ...meal, id: createId() }] },
  }));
}

export function updatePlannedMeal(
  day: DayKey,
  id: string,
  patch: Omit<PlannedMeal, "id">,
): void {
  updatePlan((p) => ({
    ...p,
    meals: {
      ...p.meals,
      [day]: p.meals[day].map((m) => (m.id === id ? { ...m, ...patch } : m)),
    },
  }));
}

export function deletePlannedMeal(day: DayKey, id: string): void {
  updatePlan((p) => ({
    ...p,
    meals: { ...p.meals, [day]: p.meals[day].filter((m) => m.id !== id) },
  }));
}

export function toggleCheckedMeal(dateKey: string, mealId: string): void {
  updatePlan((p) => {
    const ids = p.checked[dateKey] ?? [];
    p.checked[dateKey] = ids.includes(mealId)
      ? ids.filter((id) => id !== mealId)
      : [...ids, mealId];
    return p;
  });
}
