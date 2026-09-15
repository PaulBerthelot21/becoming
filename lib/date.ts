export function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function shiftDateKey(dateKey: string, days: number) {
  const date = startOfUtcDay(new Date(`${dateKey}T00:00:00.000Z`));
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

/** French long date from YYYY-MM-DD (UTC day). */
export function formatDateFr(dateKey: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(`${dateKey}T12:00:00.000Z`).toLocaleDateString("fr-FR", {
    timeZone: "UTC",
    ...options,
  });
}

/** Weekday short FR, e.g. lun. */
export function weekdayShortFr(dateKey: string) {
  return formatDateFr(dateKey, { weekday: "short" }).replace(/\.$/, "");
}

/** Simple moving average over the last `window` points ending at each index. */
export function movingAverage(values: Array<number | null>, window: number): Array<number | null> {
  return values.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = values.slice(start, index + 1).filter((value): value is number => value != null);
    if (slice.length === 0) {
      return null;
    }
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}
