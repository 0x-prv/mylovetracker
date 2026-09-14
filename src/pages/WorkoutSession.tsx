import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { routines } from "../lib/routines";
import { frameUrl, getExercise } from "../lib/workout-guide";
import { addSessionEntry, dateKey } from "../lib/sessionHistory";

type Phase = "exercise" | "rest" | "done";

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Short beep + vibration cue (no-ops where unsupported). */
function cue(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close();
  } catch {
    // audio blocked — visual cue still applies
  }
  navigator.vibrate?.(200);
}

export default function WorkoutSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routine = useMemo(
    () => routines.find((r) => r.id === id) ?? null,
    [id],
  );

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [restRemaining, setRestRemaining] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const routineRef = useRef(routine);
  routineRef.current = routine;

  const savedRef = useRef(false);

  const current = routine?.exercises[exerciseIndex];
  const totalExercises = routine?.exercises.length ?? 0;
  const currentExercise = current ? getExercise(current.slug) : null;

  // save to history exactly once when the session is fully completed
  useEffect(() => {
    if (phase !== "done" || savedRef.current) return;
    const r = routineRef.current;
    if (!r) return;
    savedRef.current = true;
    addSessionEntry({
      date: dateKey(),
      routineId: r.id,
      routineName: r.name,
      durationSeconds: elapsedSeconds,
      timestamp: Date.now(),
    });
  }, [phase, elapsedSeconds]);

  const finishSession = useCallback(() => {
    setPhase("done");
    cue();
  }, []);

  const advance = useCallback(() => {
    const r = routineRef.current;
    if (!r) return;
    const entry = r.exercises[exerciseIndex];
    if (!entry) return;

    if (setNumber < entry.sets) {
      // next set of the same exercise
      setSetNumber((n) => n + 1);
      setRestRemaining(entry.restSeconds);
      setPhase("rest");
    } else if (exerciseIndex < r.exercises.length - 1) {
      // move to the next exercise
      setExerciseIndex((i) => i + 1);
      setSetNumber(1);
      setRestRemaining(entry.restSeconds);
      setPhase("rest");
    } else {
      finishSession();
    }
  }, [exerciseIndex, setNumber, finishSession]);

  // session clock
  useEffect(() => {
    if (phase === "done") return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // rest countdown
  useEffect(() => {
    if (phase !== "rest") return;
    if (restRemaining <= 0) {
      cue();
      setPhase("exercise");
      return;
    }
    const timeout = setTimeout(
      () => setRestRemaining((s) => s - 1),
      1000,
    );
    return () => clearTimeout(timeout);
  }, [phase, restRemaining]);

  if (!routine || !current) {
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

  const restTotal = current.restSeconds;
  const restProgress =
    phase === "rest" ? Math.max(0, restRemaining / restTotal) : 0;

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <span className="text-6xl">🎉</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Session complete!
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {routine.name} — great work.
          </p>
        </div>
        <dl className="grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <dt className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
              Exercises
            </dt>
            <dd className="mt-1 text-lg font-bold">{totalExercises}</dd>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <dt className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
              Total time
            </dt>
            <dd className="mt-1 text-lg font-bold">
              {formatClock(elapsedSeconds)}
            </dd>
          </div>
        </dl>
        <Link
          to={`/routines/${routine.id}`}
          className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
        >
          Back to routine
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
            {routine.name}
          </p>
          <h1 className="text-sm font-bold tracking-tight">
            Exercise {exerciseIndex + 1} of {totalExercises}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowExitPrompt(true)}
          aria-label="End session"
          className="flex size-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Overall progress bar */}
      <div
        role="progressbar"
        aria-label="Session progress"
        aria-valuenow={exerciseIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalExercises}
        className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-500"
          style={{ width: `${((exerciseIndex + 1) / totalExercises) * 100}%` }}
        />
      </div>

      {/* Exercise / rest card */}
      <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900">
        {currentExercise?.name ? (
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {currentExercise.name}
          </h2>
        ) : (
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {current.slug}
          </h2>
        )}

        {phase === "exercise" ? (
          <>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Set {setNumber} of {current.sets} · Target {current.reps}
            </p>
            {currentExercise && (
              <div className="flex aspect-square w-full max-w-64 items-center justify-center self-center overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-950/40">
                {frameUrl(currentExercise.slug, 1) ? (
                  <img
                    src={frameUrl(currentExercise.slug, 1)!}
                    alt={`${currentExercise.name} illustration`}
                    width={512}
                    height={512}
                    decoding="async"
                    className="size-full object-contain p-4 invert dark:invert-0"
                  />
                ) : (
                  <span className="text-4xl">🏋️</span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={advance}
              className="mt-auto min-h-12 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
            >
              Done with set
            </button>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
            <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
              Rest — next up{" "}
              {setNumber < current.sets
                ? `set ${setNumber} of ${current.sets}`
                : currentExercise?.name ?? current.slug}
            </p>
            <p className="text-5xl font-bold tabular-nums tracking-tight">
              {formatClock(restRemaining)}
            </p>
            <div
              role="progressbar"
              aria-label="Rest countdown"
              aria-valuenow={restRemaining}
              aria-valuemin={0}
              aria-valuemax={restTotal}
              className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-1000 ease-linear"
                style={{ width: `${restProgress * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPhase("exercise");
              }}
              className="rounded-full bg-stone-100 px-5 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              Skip rest
            </button>
          </div>
        )}
      </div>

      {/* Elapsed time */}
      <p className="text-center text-xs text-stone-400 dark:text-stone-500">
        Elapsed {formatClock(elapsedSeconds)}
      </p>

      {/* Exit confirmation */}
      {showExitPrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl border border-stone-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg sm:rounded-3xl sm:pb-5 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-lg font-bold tracking-tight">
              End this session?
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Your progress in this session will not be saved.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExitPrompt(false)}
                className="min-h-11 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Keep going
              </button>
              <button
                type="button"
                onClick={() => navigate(`/routines/${routine.id}`)}
                className="min-h-11 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
              >
                End session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
