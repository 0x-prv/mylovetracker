export type MealEntry = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type DayLog = {
  meals: MealEntry[];
  waterMl: number;
};

const STORAGE_KEY = "laetrack:food-log";

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadAll(): Record<string, DayLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DayLog>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, DayLog>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable, keep app usable in-session
  }
}

export function getDayLog(key: string): DayLog {
  const all = loadAll();
  return all[key] ?? { meals: [], waterMl: 0 };
}

export function updateDayLog(key: string, update: (day: DayLog) => DayLog): void {
  const all = loadAll();
  const day = all[key] ?? { meals: [], waterMl: 0 };
  all[key] = update(day);
  saveAll(all);
}

export function createMealEntry(input: Omit<MealEntry, "id">): MealEntry {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...input,
  };
}
