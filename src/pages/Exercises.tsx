import { useMemo, useState } from "react";
import {
  equipmentOptions,
  muscleOptions,
  searchExercises,
} from "../lib/workout-guide";
import ExerciseGrid from "../components/ExerciseGrid";

const ALL = "All";

export default function Exercises() {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState(ALL);
  const [equipment, setEquipment] = useState(ALL);

  const muscles = useMemo(() => muscleOptions(), []);
  const equipmentList = useMemo(() => equipmentOptions(), []);

  const results = useMemo(
    () =>
      searchExercises(query, {
        primaryMuscle: muscle === ALL ? undefined : muscle,
        equipment: equipment === ALL ? undefined : equipment,
      }),
    [query, muscle, equipment],
  );

  const hasFilters = query !== "" || muscle !== ALL || equipment !== ALL;

  const selectClass =
    "w-full appearance-none rounded-xl border border-stone-300 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-stone-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";
  const labelClass =
    "flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400";

  return (
    <div className="flex flex-col gap-6 py-2 sm:py-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Workout Guide
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Find the right exercise for every muscle and machine.
          </p>
        </div>
        <span className="self-start rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          {results.length} of 302 exercises
        </span>
      </header>

      {/* Search + filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exercises, muscles, equipment…"
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-11 text-sm outline-none transition placeholder:text-stone-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-stone-700 dark:bg-stone-950"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Muscle group
            <div className="relative">
              <select
                value={muscle}
                onChange={(event) => setMuscle(event.target.value)}
                className={selectClass}
              >
                <option value={ALL}>{ALL}</option>
                {muscles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-400"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </label>

          <label className={labelClass}>
            Equipment
            <div className="relative">
              <select
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                className={selectClass}
              >
                <option value={ALL}>{ALL}</option>
                {equipmentList.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-400"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </label>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setMuscle(ALL);
              setEquipment(ALL);
            }}
            className="min-h-9 self-start rounded-full bg-stone-100 px-3.5 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 hover:text-stone-900 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
          >
            Clear all filters
          </button>
        )}
      </div>

      <ExerciseGrid exercises={results} />
    </div>
  );
}
