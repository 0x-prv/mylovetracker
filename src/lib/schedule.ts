import { routines } from "./routines";

export type ScheduleEntry = "rest" | string; // "rest" or a routine id
export type WeeklySchedule = Partial<Record<string, ScheduleEntry>>; // day key -> entry

const STORAGE_KEY = "laetrack:workout-schedule";
const ROUTINE_IDS = new Set(routines.map((r) => r.id));

function sanitizeEntry(raw: unknown): ScheduleEntry | null {
  if (raw === "rest") return "rest";
  if (typeof raw === "string" && ROUTINE_IDS.has(raw)) return raw;
  return null;
}

export function loadSchedule(): WeeklySchedule {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const schedule: WeeklySchedule = {};
    for (const [day, entry] of Object.entries(parsed)) {
      const sanitized = sanitizeEntry(entry);
      if (sanitized !== null) schedule[day] = sanitized;
    }
    return schedule;
  } catch {
    return {};
  }
}

export function saveSchedule(schedule: WeeklySchedule): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  } catch {
    // storage unavailable, keep app usable in-session
  }
}

/** Today's entry, or null when nothing is scheduled for today. */
export function todaysEntry(date = new Date()): ScheduleEntry | null {
  const schedule = loadSchedule();
  return schedule[dayKey(date)] ?? null;
}

/** JS getDay(): 0=Sun..6=Sat -> mon..sun keys. */
export function dayKey(date = new Date()): string {
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[date.getDay()];
}
