import { Link, useParams } from "react-router-dom";
import {
  exerciseTypeLabel,
  frameUrls,
  getExercise,
} from "../lib/workout-guide";

export default function ExerciseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const exercise = slug ? getExercise(slug) : null;

  if (!exercise) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-5xl">🤷</p>
        <h1 className="text-xl font-semibold">Exercise not found</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          The exercise you are looking for does not exist.
        </p>
        <Link
          to="/exercises"
          className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
        >
          Back to Workout Guide
        </Link>
      </div>
    );
  }

  const images = frameUrls(exercise.slug);

  return (
    <article className="flex flex-col gap-6">
      <nav className="text-sm">
        <Link
          to="/exercises"
          className="font-medium text-purple-700 hover:underline dark:text-purple-400"
        >
          ← All exercises
        </Link>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {exercise.name}
        </h1>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            {exercise.primaryMuscle}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {exercise.equipment}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {exerciseTypeLabel(exercise.exerciseType)}
          </span>
          {exercise.isStretch && (
            <span className="rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              Stretch
            </span>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {images.map((src, index) =>
          src ? (
            <figure
              key={src}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="aspect-square bg-stone-50 dark:bg-stone-950/40">
                <img
                  src={src}
                  alt={`${exercise.name} frame ${index + 1}`}
                  width={512}
                  height={512}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="size-full object-contain p-4 invert dark:invert-0"
                />
              </div>
              <figcaption className="border-t border-stone-200 py-2 text-center text-xs font-medium text-stone-500 dark:border-stone-800 dark:text-stone-400">
                Frame {index + 1} of 3
              </figcaption>
            </figure>
          ) : null,
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
            Target muscles
          </h2>
          <p className="font-semibold">{exercise.primaryMuscle}</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Primary
          </p>
          {exercise.secondaryMuscles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              {exercise.secondaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                >
                  {muscle}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
            Details
          </h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-stone-500 dark:text-stone-400">Equipment</dt>
              <dd className="font-medium">{exercise.equipment}</dd>
            </div>
            <div>
              <dt className="text-stone-500 dark:text-stone-400">Type</dt>
              <dd className="font-medium">{exerciseTypeLabel(exercise.exerciseType)}</dd>
            </div>
            <div>
              <dt className="text-stone-500 dark:text-stone-400">Category</dt>
              <dd className="font-medium">{exercise.isStretch ? "Stretch" : "Exercise"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </article>
  );
}
