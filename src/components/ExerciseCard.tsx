import { Link } from "react-router-dom";
import type { Exercise } from "../lib/workout-guide";
import { frameUrl } from "../lib/workout-guide";

type ExerciseCardProps = {
  exercise: Exercise;
};

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const image = frameUrl(exercise.slug, 1);

  return (
    <Link
      to={`/exercises/${exercise.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-purple-800"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50 dark:bg-stone-950/40">
        {image ? (
          <img
            src={image}
            alt={`${exercise.name} illustration`}
            width={512}
            height={512}
            loading="lazy"
            decoding="async"
            className="size-full object-contain p-4 invert transition-transform duration-300 group-hover:scale-105 dark:invert-0"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-stone-100 text-4xl dark:bg-stone-800">
            🏋️
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 border-t border-stone-200 p-4 dark:border-stone-800">
        <h3 className="font-semibold leading-tight">{exercise.name}</h3>
        <div className="mt-auto flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            {exercise.primaryMuscle}
          </span>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {exercise.equipment}
          </span>
        </div>
      </div>
    </Link>
  );
}
