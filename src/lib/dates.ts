import type { Match } from "./types";

const KYIV_TIMEZONE = "Europe/Kyiv";
const INVALID_DATE_FALLBACK = "Date unavailable";
const INVALID_TIME_FALLBACK = "Time unavailable";
const INVALID_DATE_TIME_FALLBACK = "Date and time unavailable";

const dateKyivFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: KYIV_TIMEZONE
});

const timeKyivFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: KYIV_TIMEZONE
});

const utcTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC"
});

const dayKeyKyivFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: KYIV_TIMEZONE
});

const cardDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: KYIV_TIMEZONE
});

export function formatDateKyiv(dateUtc: string): string {
  const date = parseSafeDate(dateUtc);
  return date ? dateKyivFormatter.format(date) : INVALID_DATE_FALLBACK;
}

export function formatTimeKyiv(dateUtc: string): string {
  const date = parseSafeDate(dateUtc);
  return date ? timeKyivFormatter.format(date) : INVALID_TIME_FALLBACK;
}

export function formatDateTimeKyiv(dateUtc: string): string {
  const datePart = formatDateKyiv(dateUtc);
  const timePart = formatTimeKyiv(dateUtc);

  if (datePart === INVALID_DATE_FALLBACK || timePart === INVALID_TIME_FALLBACK) {
    return INVALID_DATE_TIME_FALLBACK;
  }

  return `${datePart} ${timePart}`;
}

export function formatTimeUtc(dateUtc: string): string {
  const date = parseSafeDate(dateUtc);
  return date ? `${utcTimeFormatter.format(date)} UTC` : INVALID_TIME_FALLBACK;
}

export function formatDateCardKyiv(dateUtc: string): string {
  const date = parseSafeDate(dateUtc);
  return date ? cardDateFormatter.format(date) : INVALID_DATE_FALLBACK;
}

export function isTodayKyiv(dateUtc: string, now = new Date()): boolean {
  const targetDate = parseSafeDate(dateUtc);
  const currentDate = isValidDate(now) ? now : null;

  if (!targetDate || !currentDate) {
    return false;
  }

  return dayKeyKyivFormatter.format(targetDate) === dayKeyKyivFormatter.format(currentDate);
}

export function sortMatchesByDate(matches: Match[]): Match[] {
  return [...matches].sort(
    (left, right) => getDateSortValue(left.kickoffUtc) - getDateSortValue(right.kickoffUtc)
  );
}

function parseSafeDate(value: string): Date | null {
  const date = new Date(value);
  return isValidDate(date) ? date : null;
}

function isValidDate(date: Date): boolean {
  return Number.isFinite(date.getTime());
}

function getDateSortValue(dateUtc: string): number {
  const date = parseSafeDate(dateUtc);
  return date ? date.getTime() : Number.POSITIVE_INFINITY;
}
