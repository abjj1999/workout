import dayjs from "dayjs";

/** Local calendar day as a stable key, e.g. "2026-07-07". */
export function toDateKey(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

/** Today tab header, e.g. "TUESDAY, JUL 7". */
export function formatDayHeading(date: Date): string {
  return dayjs(date).format("dddd, MMM D").toUpperCase();
}

/** Date shifted by the given number of days (negative goes back). */
export function addDays(date: Date, days: number): Date {
  return dayjs(date).add(days, "day").toDate();
}

/** Week-strip label, e.g. "JUL 1 – JUL 7". */
export function formatDayRange(start: Date, end: Date): string {
  return `${dayjs(start).format("MMM D")} – ${dayjs(end).format(
    "MMM D",
  )}`.toUpperCase();
}
