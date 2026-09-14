import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExercise } from "../lib/workout-guide";
import { estimateRoutineMinutes, routines } from "../lib/routines";
import {
  dayKey,
  loadSchedule,
  saveSchedule,
  type WeeklySchedule,
} from "../lib/schedule";
import { completedDates, dateKey } from "../lib/sessionHistory";

type DayState = "completed" | "scheduled" | "missed" | "rest" | "none";

const WEEKDAY_BY_KEY: Record<string, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

function LastFourteenDays({ schedule }: { schedule: WeeklySchedule }) {
  const done = completedDates();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 13 + i);
    const key = dateKey(date);
    const weekdayKey = dayKey(date);
    const entry = schedule[weekdayKey];
    const isToday = key === dateKey();
    const isPast = date < startOfToday;

    let state: DayState;
    if (done.has(key)) {
      state = "completed";
    } else if (entry === "rest") {
      state = "rest";
    } else if (entry && !isPast) {
      // scheduled today, session still upcoming
      state = "scheduled";
    } else if (entry) {
      state = "missed";
    } else {
      state = "none";
    }

    return {
      key,
      label: date.getDate(),
      weekday: WEEKDAY_BY_KEY[weekdayKey],
      state,
      isToday,
    };
  });

  const stateClass: Record<DayState, string> = {
    completed:
      "border-transparent bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-sm",
    scheduled:
      "border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-600 dark:bg-purple-950/40 dark:text-purple-300",
    missed:
      "border-stone-300 bg-stone-100 text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300",
    rest: "border-dashed border-stone-300 bg-stone-50 text-stone-400 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-500",
    none: "border-transparent bg-transparent text-stone-300 dark:text-stone-600",
  };

  const stateTitle: Record<DayState, string> = {
    completed: "Workout completed",
    scheduled: "Scheduled today — not done yet",
    missed: "Scheduled but missed",
    rest: "Rest day",
    none: "Nothing scheduled",
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
        Last 14 days
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.key} className="flex flex-col items-center gap-1">
            <span
              className={`flex size-9 items-center justify-center rounded-xl border text-xs font-semibold ${stateClass[day.state]} ${
                day.isToday
                  ? "ring-2 ring-purple-400 ring-offset-1 dark:ring-offset-stone-900"
                  : ""
              }`}
              title={`${day.weekday} — ${stateTitle[day.state]}`}
            >
              {day.state === "completed" ? "✓" : day.label}
            </span>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">
              {day.weekday}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-stone-400 dark:text-stone-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500" />
          Completed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-950/40" />
          Scheduled today
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-800" />
          Scheduled but missed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-dashed border-stone-300 dark:border-stone-700" />
          Rest day
        </span>
      </div>
    </section>
  );
}

const SCHEDULE_DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
] as const;

function ScheduleEditor({
  schedule,
  onChange,
}: {
  schedule: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
}) {
  const setDay = (day: string, value: string) => {
    const next = { ...schedule, [day]: value };
    onChange(next);
    saveSchedule(next);
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
        Set Weekly Schedule
      </h2>
      <ul className="flex flex-col gap-2">
        {SCHEDULE_DAYS.map(({ key, label }) => (
          <li
            key={key}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950/40"
          >
            <span className="w-12 text-sm font-semibold">{label}</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDay(key, "rest")}
                className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  schedule[key] === "rest"
                    ? "bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                }`}
              >
                Rest day
              </button>
              {routines.map((routine) => (
                <button
                  key={routine.id}
                  type="button"
                  onClick={() => setDay(key, routine.id)}
                  className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    schedule[key] === routine.id
                      ? "bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  {routine.name}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-400 dark:text-stone-500">
        Your schedule is saved on this device and shows on the home page.
      </p>
    </section>
  );
}

export default function HomeWorkout() {
  const { id } = useParams();
  const routine = routines.find((r) => r.id === id);

  if (id && routine) {
    return <RoutineDetail routineId={routine.id} />;
  }
  if (id) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-4xl">🤷</span>
        <h1 className="text-xl font-bold tracking-tight">Routine not found</h1>
        <Link
          to="/routines"
          className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
        >
          Back to Home Workout
        </Link>
      </div>
    );
  }
  return <RoutineList />;
}

function RoutineList() {
  const [schedule, setSchedule] = useState(loadSchedule);

  return (
    <div className="flex flex-col gap-6 py-2 sm:py-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Home Workout
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Ready-made routines you can do at home — no equipment or everyday
          objects only.
        </p>
      </header>

      <ScheduleEditor schedule={schedule} onChange={setSchedule} />

      <LastFourteenDays schedule={schedule} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <Link
            key={routine.id}
            to={`/routines/${routine.id}`}
            className="group flex min-h-44 flex-col gap-4 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-purple-800"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-400 text-2xl shadow-sm">
                🏋️
              </span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {estimateRoutineMinutes(routine)} min
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold">{routine.name}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {routine.description}
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
              {routine.exercises.length} exercises
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function RoutineDetail({ routineId }: { routineId: string }) {
  const routine = routines.find((r) => r.id === routineId)!;

  return (
    <div className="flex flex-col gap-6 py-2 sm:py-4">
      <header className="flex flex-col gap-3">
        <Link
          to="/routines"
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <span aria-hidden>←</span> Back to Home Workout
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {routine.name}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-stone-500 dark:text-stone-400">
              {routine.description}
            </p>
          </div>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            ~{estimateRoutineMinutes(routine)} min · {routine.exercises.length}{" "}
            exercises
          </span>
        </div>
        <Link
          to={`/routines/${routine.id}/session`}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition hover:from-purple-700 hover:to-fuchsia-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
        >
          Start Session
          <span aria-hidden>→</span>
        </Link>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
          Exercises
        </h2>
        <ol className="flex flex-col gap-3">
          {routine.exercises.map((entry, index) => {
            const exercise = getExercise(entry.slug);
            return (
              <li
                key={entry.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-950/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {exercise ? (
                        <Link
                          to={`/exercises/${entry.slug}`}
                          className="transition hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          {exercise.name}
                        </Link>
                      ) : (
                        entry.slug
                      )}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      {exercise
                        ? `${exercise.primaryMuscle} · ${exercise.equipment}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                    {entry.sets} × {entry.reps}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    {entry.restSeconds}s rest
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
