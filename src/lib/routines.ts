/**
 * Predefined home-friendly workout routines.
 *
 * Exercise names reference entries in the @bryllim/workout-guide
 * dataset (via slug) so illustrations and details can be looked up
 * there. No separate exercise database is kept here.
 */

export type RoutineExercise = {
  slug: string;
  sets: number;
  reps: string;
  restSeconds: number;
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  exercises: RoutineExercise[];
};

export const routines: Routine[] = [
  {
    id: "full-body-beginner",
    name: "Full Body Beginner",
    description:
      "A gentle no-equipment circuit covering all major muscle groups. Perfect for getting started at home.",
    exercises: [
      { slug: "knee-push-up", sets: 3, reps: "8–12", restSeconds: 60 },
      { slug: "bodyweight-squat", sets: 3, reps: "10–15", restSeconds: 60 },
      { slug: "glute-bridge", sets: 3, reps: "12–15", restSeconds: 45 },
      { slug: "plank", sets: 3, reps: "20–30 s", restSeconds: 45 },
      { slug: "dead-bug", sets: 2, reps: "8–10 / side", restSeconds: 30 },
    ],
  },
  {
    id: "upper-body",
    name: "Upper Body",
    description:
      "Push, pull, and arm work using only your bodyweight and a sturdy chair.",
    exercises: [
      { slug: "push-up", sets: 4, reps: "8–12", restSeconds: 90 },
      { slug: "inverted-row", sets: 3, reps: "8–12", restSeconds: 90 },
      { slug: "pike-push-up", sets: 3, reps: "6–10", restSeconds: 75 },
      { slug: "bench-dip", sets: 3, reps: "10–15", restSeconds: 60 },
      { slug: "chin-up", sets: 3, reps: "5–8", restSeconds: 90 },
    ],
  },
  {
    id: "core-cardio",
    name: "Core & Cardio",
    description:
      "A fast-paced mix of core stability and cardio bursts to raise your heart rate at home.",
    exercises: [
      { slug: "mountain-climber", sets: 4, reps: "30 s", restSeconds: 30 },
      { slug: "crunch", sets: 3, reps: "15–20", restSeconds: 45 },
      { slug: "jumping-jack", sets: 4, reps: "45 s", restSeconds: 30 },
      { slug: "russian-twist", sets: 3, reps: "20–30", restSeconds: 45 },
      { slug: "plank-jack", sets: 3, reps: "20–30 s", restSeconds: 45 },
      { slug: "burpee", sets: 3, reps: "8–12", restSeconds: 60 },
    ],
  },
];

/** Rough duration estimate: ~40 s per set + rest between sets + 2 min buffer. */
export function estimateRoutineMinutes(routine: Routine): number {
  const workingSeconds = routine.exercises.reduce(
    (total, exercise) => total + exercise.sets * 40,
    0,
  );
  const restSeconds = routine.exercises.reduce(
    (total, exercise) => total + (exercise.sets - 1) * exercise.restSeconds,
    0,
  );
  return Math.round((workingSeconds + restSeconds + 120) / 60);
}
