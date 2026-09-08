import { useMemo, useState } from "react";
import {
  DAY_KEYS,
  DAY_LABELS,
  addPlannedMeal,
  deletePlannedMeal,
  loadWeeklyPlan,
  updatePlannedMeal,
  type DayKey,
  type PlannedMeal,
} from "../lib/weekly-plan";

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";
const labelClass =
  "flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400";

type MealDraft = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

const emptyDraft: MealDraft = { name: "", calories: "", protein: "", carbs: "", fats: "" };

function draftFromMeal(meal: PlannedMeal): MealDraft {
  return {
    name: meal.name,
    calories: String(meal.calories),
    protein: String(meal.protein),
    carbs: String(meal.carbs),
    fats: String(meal.fats),
  };
}

function draftToMeal(draft: MealDraft): Omit<PlannedMeal, "id"> {
  return {
    name: draft.name.trim(),
    calories: Math.max(0, Number(draft.calories) || 0),
    protein: Math.max(0, Number(draft.protein) || 0),
    carbs: Math.max(0, Number(draft.carbs) || 0),
    fats: Math.max(0, Number(draft.fats) || 0),
  };
}

function MealModal({
  day,
  meal,
  onClose,
  onSave,
}: {
  day: DayKey;
  meal: PlannedMeal | null;
  onClose: () => void;
  onSave: (values: Omit<PlannedMeal, "id">) => void;
}) {
  const [draft, setDraft] = useState<MealDraft>(meal ? draftFromMeal(meal) : emptyDraft);
  const title = meal ? `Edit meal for ${DAY_LABELS[day]}` : `Add meal for ${DAY_LABELS[day]}`;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    onSave(draftToMeal(draft));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4">
      <form
        onSubmit={submit}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-stone-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg sm:rounded-3xl sm:pb-5 dark:border-stone-800 dark:bg-stone-900"
      >
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <label className={labelClass}>
          Meal name
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Oats with berries"
            required
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Calories
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={draft.calories}
              onChange={(e) => setDraft({ ...draft, calories: e.target.value })}
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
              value={draft.protein}
              onChange={(e) => setDraft({ ...draft, protein: e.target.value })}
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
              value={draft.carbs}
              onChange={(e) => setDraft({ ...draft, carbs: e.target.value })}
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
              value={draft.fats}
              onChange={(e) => setDraft({ ...draft, fats: e.target.value })}
              placeholder="0"
              className={inputClass}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-11 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
          >
            {meal ? "Save changes" : "Add meal"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function FoodPlan() {
  const [plan, setPlan] = useState(loadWeeklyPlan);
  const [modal, setModal] = useState<{
    day: DayKey;
    meal: PlannedMeal | null;
  } | null>(null);

  const refresh = () => setPlan(loadWeeklyPlan());

  const totalsByDay = useMemo(() => {
    const result = {} as Record<DayKey, { calories: number; protein: number; carbs: number; fats: number }>;
    for (const key of DAY_KEYS) {
      result[key] = plan.meals[key].reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fats: acc.fats + m.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      );
    }
    return result;
  }, [plan]);

  const saveModal = (values: Omit<PlannedMeal, "id">) => {
    if (!modal) return;
    if (modal.meal) {
      updatePlannedMeal(modal.day, modal.meal.id, values);
    } else {
      addPlannedMeal(modal.day, values);
    }
    setModal(null);
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 py-2 sm:py-4">
      {modal && (
        <MealModal
          day={modal.day}
          meal={modal.meal}
          onClose={() => setModal(null)}
          onSave={saveModal}
        />
      )}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Weekly Meal Plan
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Plan meals for each day of the week. Saved on this device.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DAY_KEYS.map((day) => (
          <section
            key={day}
            className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                {DAY_LABELS[day]}
              </h2>
              <button
                type="button"
                onClick={() => setModal({ day, meal: null })}
                className="min-h-9 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                + Add meal
              </button>
            </div>
            {plan.meals[day].length === 0 ? (
              <p className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-xs text-stone-400 dark:border-stone-700 dark:text-stone-500">
                No meals planned.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {plan.meals[day].map((meal) => (
                  <li
                    key={meal.id}
                    className="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{meal.name}</p>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setModal({ day, meal })}
                          className="flex size-9 items-center justify-center rounded-full p-0 text-stone-400 transition hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                          aria-label={`Edit ${meal.name}`}
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3.5"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deletePlannedMeal(day, meal.id);
                            refresh();
                          }}
                          className="flex size-9 items-center justify-center rounded-full p-0 text-stone-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                          aria-label={`Delete ${meal.name}`}
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3.5"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
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
                  </li>
                ))}
              </ul>
            )}
            {plan.meals[day].length > 0 && (
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Total: {totalsByDay[day].calories} kcal · P {totalsByDay[day].protein}g · C {totalsByDay[day].carbs}g · F {totalsByDay[day].fats}g
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
