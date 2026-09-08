import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createMealEntry,
  getDayLog,
  todayKey,
  updateDayLog,
  type DayLog,
  type MealEntry,
} from "../lib/food-log";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  computeTargets,
  getProfile,
  saveProfile,
  type ActivityLevel,
  type DailyTargets,
  type Gender,
  type Goal,
  type UserProfile,
} from "../lib/user-profile";
import {
  DAY_LABELS,
  loadWeeklyPlan,
  todayDayKey,
  toggleCheckedMeal,
} from "../lib/weekly-plan";

const WATER_GOAL_ML = 2000;
const WATER_STEP_ML = 250;

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";
const labelClass =
  "flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400";

function StatCard({
  emoji,
  label,
  value,
  unit,
  accent,
}: {
  emoji: string;
  label: string;
  value: string;
  unit: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xl ${accent}`}>
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
          {label}
        </p>
        <p className="text-base leading-snug font-bold tracking-tight sm:text-lg">
          {value}
          <span className="ml-1 text-xs font-medium text-stone-400">{unit}</span>
        </p>
      </div>
    </div>
  );
}

const selectClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";

function ProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}) {
  const [heightCm, setHeightCm] = useState(profile ? String(profile.heightCm) : "");
  const [weightKg, setWeightKg] = useState(profile ? String(profile.weightKg) : "");
  const [age, setAge] = useState(profile ? String(profile.age) : "");
  const [gender, setGender] = useState<Gender>(profile?.gender ?? "male");
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activity ?? "moderate");
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? "maintain");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const h = Number(heightCm);
    const w = Number(weightKg);
    const a = Number(age);
    if (!h || !w || !a) return;
    onSave({ heightCm: h, weightKg: w, age: a, gender, activity, goal });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4">
      <form
        onSubmit={submit}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-stone-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg sm:rounded-3xl sm:pb-5 dark:border-stone-800 dark:bg-stone-900"
      >
        <h2 className="text-lg font-bold tracking-tight">Your profile</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className={labelClass}>
            Height (cm)
            <input type="number" min={0} inputMode="numeric" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} required className={inputClass} />
          </label>
          <label className={labelClass}>
            Weight (kg)
            <input type="number" min={0} inputMode="decimal" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required className={inputClass} />
          </label>
          <label className={labelClass}>
            Age
            <input type="number" min={0} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} required className={inputClass} />
          </label>
        </div>
        <label className={labelClass}>
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={selectClass}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className={labelClass}>
          Activity level
          <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)} className={selectClass}>
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
              <option key={key} value={key}>{ACTIVITY_LABELS[key]}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Goal
          <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className={selectClass}>
            {(Object.keys(GOAL_LABELS) as Goal[]).map((key) => (
              <option key={key} value={key}>{GOAL_LABELS[key]}</option>
            ))}
          </select>
        </label>
        <div className="mt-4 flex justify-end gap-2">
          {profile && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="min-h-11 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default function FoodTracker() {
  const [day, setDay] = useState<DayLog>(() => getDayLog(todayKey()));
  const [profile, setProfile] = useState<UserProfile | null>(() => getProfile());
  const [showProfileModal, setShowProfileModal] = useState(() => !getProfile());

  // name/number inputs kept as strings for smooth typing
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  useEffect(() => {
    // reset view if the date rolls over while the page is open
    const interval = setInterval(() => {
      setDay((current) => {
        const fresh = getDayLog(todayKey());
        return fresh === current ? current : fresh;
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const totals = useMemo(
    () =>
      day.meals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fats: acc.fats + meal.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      ),
    [day.meals],
  );

  const addMeal = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const entry = createMealEntry({
      name: trimmedName,
      calories: Math.max(0, Number(calories) || 0),
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fats: Math.max(0, Number(fats) || 0),
    });

    updateDayLog(todayKey(), (d) => ({ ...d, meals: [...d.meals, entry] }));
    setDay(getDayLog(todayKey()));
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
  };

  const deleteMeal = (id: string) => {
    updateDayLog(todayKey(), (d) => ({
      ...d,
      meals: d.meals.filter((meal) => meal.id !== id),
    }));
    setDay(getDayLog(todayKey()));
  };

  const addWater = (ml: number) => {
    updateDayLog(todayKey(), (d) => ({
      ...d,
      waterMl: Math.max(0, d.waterMl + ml),
    }));
    setDay(getDayLog(todayKey()));
  };

  const waterPct = Math.min(100, Math.round((day.waterMl / WATER_GOAL_ML) * 100));

  const targets: DailyTargets | null = useMemo(
    () => (profile ? computeTargets(profile) : null),
    [profile],
  );

  const saveProfileAndClose = (p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
    setShowProfileModal(false);
  };

  const [weeklyPlan, setWeeklyPlan] = useState(loadWeeklyPlan);
  const todayPlanKey = todayKey();
  const todayDay = todayDayKey();
  const todaysMeals = weeklyPlan.meals[todayDay];
  const checkedToday = weeklyPlan.checked[todayPlanKey] ?? [];

  const togglePlanned = (mealId: string) => {
    toggleCheckedMeal(todayPlanKey, mealId);
    setWeeklyPlan(loadWeeklyPlan());
  };

  return (
    <div className="flex flex-col gap-6 py-2 sm:py-4">
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={saveProfileAndClose}
        />
      )}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Food Tracker
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Log meals and water for today. Everything is saved on this device.
        </p>
      </header>

      {/* Daily totals vs targets */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard emoji="🔥" label="Calories" value={String(totals.calories)} unit={targets ? `of ${targets.calories} kcal` : "kcal"} accent="bg-orange-100 dark:bg-orange-950" />
        <StatCard emoji="🥩" label="Protein" value={`${totals.protein}g`} unit={targets ? `of ${targets.protein}g` : "total"} accent="bg-rose-100 dark:bg-rose-950" />
        <StatCard emoji="🍞" label="Carbs" value={`${totals.carbs}g`} unit={targets ? `of ${targets.carbs}g` : "total"} accent="bg-amber-100 dark:bg-amber-950" />
        <StatCard emoji="🥑" label="Fats" value={`${totals.fats}g`} unit={targets ? `of ${targets.fats}g` : "total"} accent="bg-fuchsia-100 dark:bg-fuchsia-950" />
      </section>

      {/* Targets / profile */}
      {targets ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
              Daily targets
            </h2>
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="min-h-9 rounded-full bg-stone-100 px-4 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              Edit profile
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard emoji="🎯" label="Calories" value={String(targets.calories)} unit="kcal" accent="bg-orange-100 dark:bg-orange-950" />
            <StatCard emoji="💪" label="Protein" value={`${targets.protein}g`} unit="goal" accent="bg-rose-100 dark:bg-rose-950" />
            <StatCard emoji="🌾" label="Carbs" value={`${targets.carbs}g`} unit="goal" accent="bg-amber-100 dark:bg-amber-950" />
            <StatCard emoji="🧈" label="Fats" value={`${targets.fats}g`} unit="goal" accent="bg-fuchsia-100 dark:bg-fuchsia-950" />
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            BMR {targets.bmr} kcal · TDEE {targets.tdee} kcal · Goal: {GOAL_LABELS[profile!.goal]}
          </p>
        </section>
      ) : (
        <section className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-stone-300 p-5 dark:border-stone-700">
          <div>
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
              Daily targets
            </h2>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Set up your profile to compute calorie & macro targets (Mifflin-St Jeor).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
          >
            Set up profile
          </button>
        </section>
      )}

      {/* Today's plan checklist */}
      <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
            Today's plan for {DAY_LABELS[todayDay]}
          </h2>
          <Link
            to="/food/plan"
            className="min-h-9 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            Edit weekly plan →
          </Link>
        </div>
        {todaysMeals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-xs text-stone-400 dark:border-stone-700 dark:text-stone-500">
            No meals planned for today. Set up your weekly plan.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todaysMeals.map((meal) => {
              const eaten = checkedToday.includes(meal.id);
              return (
                <li key={meal.id}>
                  <button
                    type="button"
                    onClick={() => togglePlanned(meal.id)}
                    className={`flex w-full flex-wrap items-center gap-3 rounded-2xl border p-3.5 text-left transition ${eaten
                      ? "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40"
                      : "border-stone-200 bg-stone-50 hover:border-purple-300 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-purple-800"
                      }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition ${eaten
                        ? "border-transparent bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white"
                        : "border-stone-300 dark:border-stone-600"
                        }`}
                    >
                      {eaten && (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${eaten ? "text-stone-400 line-through dark:text-stone-500" : ""}`}>
                      {meal.name}
                    </span>
                    <span className="text-xs font-medium text-stone-400">
                      {meal.calories} kcal
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-stone-400 dark:text-stone-500">
          Checklist only. Checking a meal does not add it to your food log.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Add meal form + meals list */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <form
            onSubmit={addMeal}
            className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900"
          >
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
              Add a meal
            </h2>
            <label className={labelClass}>
              Meal name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Chicken rice bowl"
                required
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className={labelClass}>
                Calories
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={calories}
                  onChange={(event) => setCalories(event.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Protein (g)
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={protein}
                  onChange={(event) => setProtein(event.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Carbs (g)
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={carbs}
                  onChange={(event) => setCarbs(event.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Fats (g)
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={fats}
                  onChange={(event) => setFats(event.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
            </div>
            <button
              type="submit"
              className="min-h-11 self-start rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
            >
              Add meal
            </button>
          </form>

          {/* Meals list */}
          <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
              Today's meals
            </h2>
            {day.meals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-10 text-center dark:border-stone-700">
                <span className="text-4xl">🍽️</span>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                  No meals logged yet.
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Add your first meal above to start tracking.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {day.meals.map((meal: MealEntry) => (
                  <li
                    key={meal.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-950/40"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="truncate font-semibold">{meal.name}</p>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                          {meal.calories} kcal
                        </span>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          P {meal.protein}g
                        </span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          C {meal.carbs}g
                        </span>
                        <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 font-medium text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300">
                          F {meal.fats}g
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMeal(meal.id)}
                      aria-label={`Delete ${meal.name}`}
                      className="ml-auto flex size-9 items-center justify-center rounded-full p-0 text-stone-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Water tracker */}
        <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-purple-950">
              💧
            </span>
            <div>
              <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                Water intake
              </h2>
              <p className="text-lg font-bold tracking-tight">
                {day.waterMl} ml
                <span className="ml-1.5 text-xs font-medium text-stone-400">
                  of {WATER_GOAL_ML} ml goal
                </span>
              </p>
            </div>
          </div>

          <div
            role="progressbar"
            aria-valuenow={day.waterMl}
            aria-valuemin={0}
            aria-valuemax={WATER_GOAL_ML}
            aria-label="Water intake progress"
            className="h-3 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-300"
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            {waterPct}% of daily goal
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addWater(WATER_STEP_ML)}
              className="min-h-11 flex-1 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600 sm:flex-none"
            >
              + Glass ({WATER_STEP_ML} ml)
            </button>
            <button
              type="button"
              onClick={() => addWater(500)}
              className="min-h-11 flex-1 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200 hover:text-stone-900 sm:flex-none dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
            >
              + 500 ml
            </button>
            <button
              type="button"
              onClick={() => addWater(-WATER_STEP_ML)}
              className="min-h-11 flex-1 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200 hover:text-stone-900 sm:flex-none dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
            >
              − Undo glass
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
