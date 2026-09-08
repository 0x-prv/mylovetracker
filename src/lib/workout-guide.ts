/**
 * Thin wrapper around @bryllim/workout-guide.
 *
 * The package is the single source of truth for exercise data and
 * illustration assets. This module only re-exports its API and adds
 * LaeTrack-specific helpers (filter option lists, URL shortcuts).
 * No exercise data is duplicated here.
 */
import type {
  Exercise,
  ExerciseFrame,
  ExerciseSearchFilters,
  ExerciseType,
} from "@bryllim/workout-guide";
import {
  exercises,
  getAssetUrl,
  getExercise,
  searchExercises,
} from "@bryllim/workout-guide";

export type {
  Exercise,
  ExerciseFrame,
  ExerciseSearchFilters,
  ExerciseType,
};

export { exercises, getExercise, searchExercises };

/** CDN URL for a single illustration frame (1 | 2 | 3). */
export function frameUrl(slug: string, index: ExerciseFrame["index"]): string | null {
  return getAssetUrl(slug, index);
}

/** CDN URLs for all three illustration frames, in frame order. */
export function frameUrls(slug: string): (string | null)[] {
  return [1, 2, 3].map((index) => frameUrl(slug, index as ExerciseFrame["index"]));
}

/** Readable label for the package's exerciseType enum. */
export function exerciseTypeLabel(type: ExerciseType): string {
  switch (type) {
    case "weight_reps":
      return "Weight × Reps";
    case "bodyweight_reps":
      return "Bodyweight Reps";
    case "duration":
      return "Duration";
    case "distance_duration":
      return "Distance / Duration";
    case "assisted_bodyweight":
      return "Assisted Bodyweight";
  }
}

const MUSCLE_ORDER: Record<string, number> = {
  Chest: 1,
  Back: 2,
  Lats: 3,
  "Upper Back": 4,
  "Lower Back": 5,
  "Rear Delts": 6,
  Shoulders: 7,
  Biceps: 8,
  Triceps: 9,
  Forearms: 10,
  Core: 11,
  Quads: 12,
  Hamstrings: 13,
  Glutes: 14,
  "Posterior Chain": 15,
  Adductors: 16,
  Hips: 17,
  Calves: 18,
  Legs: 19,
  Mobility: 20,
};

const EQUIPMENT_ORDER: Record<string, number> = {
  Barbell: 1,
  Dumbbell: 2,
  Kettlebell: 3,
  Machine: 4,
  Cable: 5,
  Plate: 6,
  "Pull-up Bar": 7,
  "Resistance Band": 8,
  "Stability Ball": 9,
  Bench: 10,
  Box: 11,
  Chair: 12,
  Doorway: 13,
  Towel: 14,
  Wall: 15,
  Bodyweight: 16,
  Cardio: 17,
};

/** Unique primary-muscle filter options, sorted naturally. */
export function muscleOptions(): string[] {
  return [...new Set(exercises.map((exercise) => exercise.primaryMuscle))].sort(
    (a, b) => (MUSCLE_ORDER[a] ?? 99) - (MUSCLE_ORDER[b] ?? 99) || a.localeCompare(b),
  );
}

/** Unique equipment filter options, sorted naturally. */
export function equipmentOptions(): string[] {
  return [...new Set(exercises.map((exercise) => exercise.equipment))].sort(
    (a, b) => (EQUIPMENT_ORDER[a] ?? 99) - (EQUIPMENT_ORDER[b] ?? 99) || a.localeCompare(b),
  );
}

export type { ExerciseSearchFilters as SearchFilters };
