export type SessionEntry = {
  date: string; // YYYY-MM-DD
  routineId: string;
  routineName: string;
  durationSeconds: number;
  timestamp: number; // epoch ms
};

const STORAGE_KEY = "laetrack:session-history";

export function dateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sanitizeEntry(raw: unknown): SessionEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Partial<SessionEntry>;
  if (
    typeof e.date !== "string" ||
    typeof e.routineId !== "string" ||
    typeof e.routineName !== "string"
  ) {
    return null;
  }
  return {
    date: e.date,
    routineId: e.routineId,
    routineName: e.routineName,
    durationSeconds:
      typeof e.durationSeconds === "number" && e.durationSeconds >= 0
        ? e.durationSeconds
        : 0,
    timestamp:
      typeof e.timestamp === "number" && e.timestamp > 0
        ? e.timestamp
        : Date.now(),
  };
}

export function loadSessionHistory(): SessionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeEntry)
      .filter((e): e is SessionEntry => e !== null);
  } catch {
    return [];
  }
}

export function addSessionEntry(entry: SessionEntry): void {
  const all = loadSessionHistory();
  all.push(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable, keep app usable in-session
  }
}

/** Set of YYYY-MM-DD date keys that have at least one completed session. */
export function completedDates(): Set<string> {
  return new Set(loadSessionHistory().map((e) => e.date));
}

/**
 * This week's progress: completed sessions vs scheduled (non-rest) days.
 * Week starts Monday. Days in the future are excluded from the done count
 * but included in the scheduled total.
 */
export function weekProgress(
  schedule: (day: string) => string | undefined,
  date = new Date(),
): { done: number; scheduled: number } {
  const doneSet = completedDates();

  // find Monday of the current week
  const monday = new Date(date);
  const offset = (date.getDay() + 6) % 7; // 0=Mon..6=Sun
  monday.setDate(date.getDate() - offset);

  let done = 0;
  let scheduled = 0;
  for (let i = 0; i <= offset; i++) {
    // only count days that have already passed (including today)
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const key = dateKey(day);
    const entry = schedule(
      ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][day.getDay()],
    );
    if (entry && entry !== "rest") {
      scheduled++;
      if (doneSet.has(key)) done++;
    }
  }
  return { done, scheduled };
}
