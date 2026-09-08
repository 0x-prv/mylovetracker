import { Link } from "react-router-dom";
import { exercises } from "../lib/workout-guide";

const features = [
  {
    to: "/exercises",
    emoji: "💪",
    title: "Workout Guide",
    description: `${exercises.length} exercises with illustrations, muscles, and equipment.`,
    badge: `${exercises.length} exercises`,
    accent: "bg-gradient-to-br from-purple-500 to-fuchsia-400",
    soft: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    available: true,
  },
  {
    to: "/food",
    emoji: "🍽️",
    title: "Food Tracker",
    description: "Log meals and track your daily nutrition and water intake.",
    badge: "Daily log",
    accent: "bg-gradient-to-br from-fuchsia-500 to-pink-400",
    soft: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    available: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-10 py-10 sm:py-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold tracking-wide text-purple-700 uppercase dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300">
          Your daily fitness companion
        </span>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Track your day,{" "}
          <span className="bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
            every day.
          </span>
        </h1>
        <p className="max-w-md text-sm text-pretty text-stone-500 sm:text-base dark:text-stone-400">
          LaeTrack keeps your workouts and nutrition in one place. Log meals,
          track water, and browse the workout guide.
        </p>
        <Link
          to="/exercises"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition hover:from-purple-700 hover:to-fuchsia-600 hover:shadow-lg hover:shadow-purple-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
        >
          Browse workouts
          <span aria-hidden>→</span>
        </Link>
      </section>

      {/* Feature cards */}
      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((feature) => {
          const inner = (
            <>
              <div className="flex items-start justify-between">
                <span
                  className={`flex size-12 items-center justify-center rounded-2xl ${feature.accent} text-2xl shadow-sm`}
                >
                  {feature.emoji}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${feature.soft}`}
                >
                  {feature.badge}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold">{feature.title}</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {feature.description}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                {feature.available ? "Open" : "Not available yet"}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </>
          );

          const className =
            "group flex min-h-44 flex-col gap-4 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900";

          return feature.available ? (
            <Link
              key={feature.title}
              to={feature.to}
              className={`${className} hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:border-purple-800`}
            >
              {inner}
            </Link>
          ) : (
            <div
              key={feature.title}
              aria-disabled="true"
              className={`${className} opacity-75`}
            >
              {inner}
            </div>
          );
        })}
      </section>
    </div>
  );
}
