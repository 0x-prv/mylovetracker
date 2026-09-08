export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";
export type Goal = "cutting" | "bulking" | "maintain";

export type UserProfile = {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  activity: ActivityLevel;
  goal: Goal;
};

export type DailyTargets = {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

const STORAGE_KEY = "laetrack:user-profile";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little exercise)",
  light: "Light (1-3 days/week)",
  moderate: "Moderate (3-5 days/week)",
  active: "Active (6-7 days/week)",
  "very-active": "Very active (daily + job)",
};

export const GOAL_LABELS: Record<Goal, string> = {
  cutting: "Cutting (lose fat)",
  bulking: "Bulking (gain muscle)",
  maintain: "Maintain",
};

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable, keep app usable in-session
  }
}

export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (
      !parsed ||
      typeof parsed.heightCm !== "number" ||
      typeof parsed.weightKg !== "number" ||
      typeof parsed.age !== "number" ||
      !ACTIVITY_FACTORS[parsed.activity] ||
      !GOAL_LABELS[parsed.goal] ||
      (parsed.gender !== "male" && parsed.gender !== "female")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function computeTargets(profile: UserProfile): DailyTargets {
  const { heightCm, weightKg, age, gender, activity, goal } = profile;

  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(gender === "male" ? base + 5 : base - 161);

  const tdee = Math.round(bmr * ACTIVITY_FACTORS[activity]);

  const calories =
    goal === "cutting" ? tdee - 500 : goal === "bulking" ? tdee + 400 : tdee;

  // Protein ~1.8 g/kg (midpoint of 1.6-2.2), rest split between carbs/fats
  const protein = Math.round(weightKg * 1.8);
  const proteinKcal = protein * 4;
  const remainingKcal = Math.max(0, calories - proteinKcal);
  // split remaining ~50/30 carbs/fats of total, but derive from kcal:
  const carbs = Math.round((remainingKcal * 0.6) / 4);
  const fats = Math.round((remainingKcal * 0.4) / 9);

  return { bmr, tdee, calories, protein, carbs, fats };
}
