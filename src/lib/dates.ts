import type { Match } from "./types";
import type { Language } from "./i18n";

const KYIV_TIMEZONE = "Europe/Kyiv";
const FALLBACKS = {
  en: {
    date: "Date unavailable",
    time: "Time unavailable",
    dateTime: "Date and time unavailable"
  },
  uk: {
    date: "Дата недоступна",
    time: "Час недоступний",
    dateTime: "Дата і час недоступні"
  }
} as const;

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

export function formatDateKyiv(dateUtc: string, language: Language = "en"): string {
  const date = parseSafeDate(dateUtc);
  return date
    ? createDateFormatter(language, "long").format(date)
    : FALLBACKS[language].date;
}

export function formatTimeKyiv(dateUtc: string, language: Language = "en"): string {
  const date = parseSafeDate(dateUtc);
  return date ? createTimeFormatter(language).format(date) : FALLBACKS[language].time;
}

export function formatDateTimeKyiv(dateUtc: string, language: Language = "en"): string {
  const datePart = formatDateKyiv(dateUtc, language);
  const timePart = formatTimeKyiv(dateUtc, language);

  if (datePart === FALLBACKS[language].date || timePart === FALLBACKS[language].time) {
    return FALLBACKS[language].dateTime;
  }

  return `${datePart} ${timePart}`;
}

export function formatDateByLanguage(dateUtc: string, language: Language): string {
  return formatDateKyiv(dateUtc, language);
}

export function formatDateTimeByLanguage(dateUtc: string, language: Language): string {
  return formatDateTimeKyiv(dateUtc, language);
}

export function formatTimeUtc(dateUtc: string): string {
  const date = parseSafeDate(dateUtc);
  return date ? `${utcTimeFormatter.format(date)} UTC` : FALLBACKS.en.time;
}

export function formatDateCardKyiv(dateUtc: string, language: Language = "en"): string {
  const date = parseSafeDate(dateUtc);
  return date
    ? createDateFormatter(language, "short").format(date)
    : FALLBACKS[language].date;
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

function getLocale(language: Language) {
  return language === "uk" ? "uk-UA" : "en-GB";
}

function createDateFormatter(language: Language, month: "short" | "long") {
  return new Intl.DateTimeFormat(getLocale(language), {
    day: "2-digit",
    month,
    year: month === "long" ? "numeric" : undefined,
    timeZone: KYIV_TIMEZONE
  });
}

function createTimeFormatter(language: Language) {
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: KYIV_TIMEZONE
  });
}
