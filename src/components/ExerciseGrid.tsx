import type { Exercise } from "../lib/workout-guide";
import ExerciseCard from "./ExerciseCard";

type ExerciseGridProps = {
  exercises: Exercise[];
};

export default function ExerciseGrid({ exercises }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-purple-200 bg-white/60 p-12 text-center dark:border-purple-900 dark:bg-stone-900/40">
        <span className="text-4xl">🔍</span>
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
          No exercises match your search or filters.
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500">
          Try a different keyword or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {exercises.map((exercise) => (
        <li key={exercise.id} className="flex">
          <ExerciseCard exercise={exercise} />
        </li>
      ))}
    </ul>
  );
}
