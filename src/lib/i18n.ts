import { useEffect, useState } from "react";

export type Language = "uk" | "en";
export type TranslationKey = keyof typeof translations.en;
export type Translate = (key: TranslationKey) => string;

const languageStorageKey = "wc26-language";

const translations = {
  en: {
    "nav.home": "Home",
    "nav.groups": "Groups",
    "nav.matches": "Matches",
    "nav.knockout": "Knockout",
    "nav.about": "About",
    "brand.title": "World Cup 2026 Tracker",
    "brand.short": "Tracker",
    "hero.eyebrow": "Tournament dashboard",
    "hero.title": "Follow the World Cup",
    "hero.subtitle": "Schedule, standings, playoff and tournament statistics in one place",
    "stats.teams": "Teams",
    "stats.groups": "Groups",
    "stats.playedMatches": "Played matches",
    "stats.nextMatch": "Next match",
    "home.quick.groups": "View Groups",
    "home.quick.matches": "View Matches",
    "home.quick.knockout": "View Knockout",
    "home.upcoming": "Next matches",
    "home.finished": "Latest finished",
    "home.noUpcoming": "No upcoming matches yet.",
    "home.noFinished": "No finished matches yet.",
    "groups.eyebrow": "Group stage",
    "groups.title": "Groups",
    "groups.copy": "Group tables are calculated automatically from finished local JSON matches.",
    "groups.emptyTitle": "No groups available",
    "groups.emptyMessage": "Add group definitions to the local tournament JSON to show tables here.",
    "groups.group": "Group",
    "groups.standings": "Standings",
    "groups.team": "Team",
    "groups.played": "Played",
    "groups.wins": "Wins",
    "groups.draws": "Draws",
    "groups.losses": "Losses",
    "groups.goalsFor": "Goals for",
    "groups.goalsAgainst": "Goals against",
    "groups.goalDifference": "Goal difference",
    "groups.points": "Points",
    "groups.qualifiedZone": "Qualified zone",
    "groups.thirdZone": "Possible third-place qualification",
    "matches.eyebrow": "Fixtures",
    "matches.title": "Matches",
    "matches.copy": "Finished scores and upcoming fixtures are read from local JSON data.",
    "matches.all": "All",
    "matches.today": "Today",
    "matches.upcoming": "Upcoming",
    "matches.finished": "Finished",
    "matches.groupStage": "Group stage",
    "matches.knockout": "Knockout",
    "matches.group": "Group",
    "matches.allGroups": "All groups",
    "matches.team": "Team",
    "matches.allTeams": "All teams",
    "matches.noMatchesTitle": "No matches available",
    "matches.noMatchesMessage": "Add matches to the local tournament JSON to start tracking fixtures and results.",
    "matches.noFilteredTitle": "No matches found",
    "matches.noFilteredMessage": "Try a different filter to see more fixtures.",
    "matches.tapDetails": "Tap for details",
    "matches.venueTbc": "Venue to be confirmed",
    "matches.date": "Date",
    "matches.time": "Time",
    "matches.kyivTime": "Kyiv time",
    "matches.utcTime": "UTC time",
    "matches.venue": "Venue",
    "matches.city": "City",
    "matches.stage": "Stage",
    "status.finished": "Finished",
    "status.upcoming": "Upcoming",
    "status.scheduled": "Scheduled",
    "status.live": "Live",
    "status.postponed": "Postponed",
    "status.cancelled": "Cancelled",
    "knockout.eyebrow": "Elimination rounds",
    "knockout.title": "Knockout",
    "knockout.copy": "Bracket slots use local JSON placeholders until real qualified teams are known.",
    "knockout.emptyTitle": "No knockout matches available",
    "knockout.emptyMessage": "Add knockout fixtures to the local tournament JSON to show the bracket here.",
    "knockout.bracket": "Bracket",
    "knockout.noSlot": "No fixture slot yet",
    "knockout.roundOf32": "Round of 32",
    "knockout.roundOf16": "Round of 16",
    "knockout.quarterFinal": "Quarter-finals",
    "knockout.semiFinal": "Semi-finals",
    "knockout.thirdPlace": "Third-place match",
    "knockout.final": "Final",
    "knockout.winner": "Winner",
    "knockout.winnerMatch": "Winner of match",
    "knockout.winnerGroup": "Winner of group",
    "knockout.runnerUpGroup": "Runner-up of group",
    "knockout.bestThird": "Best third-placed team",
    "about.eyebrow": "About",
    "about.title": "Fan-made static tracker",
    "about.copy": "A simple static World Cup tracker for fans. Data lives locally in JSON and can be updated manually.",
    "about.what": "What this is",
    "about.whatBody": "A fan-made static tracker with local JSON data only.",
    "about.noKeys": "No API keys are used.",
    "about.manual": "Data can be updated manually.",
    "about.dataStatus": "Data status",
    "about.localJson": "Local JSON data",
    "about.lastUpdated": "Last updated",
    "liveUpdate.liveTitle": "Live updates active",
    "liveUpdate.hourlyTitle": "Update monitor",
    "liveUpdate.liveMatches": "live",
    "liveUpdate.standby": "Standby",
    "liveUpdate.liveCadence": "Refreshing about every 5 minutes during live matches.",
    "liveUpdate.hourlyCadence": "Refreshing hourly between matches.",
    "liveUpdate.synced": "Synced",
    "about.sourceNote": "Source note",
    "footer.about": "About",
    "footer.github": "GitHub",
    "footer.note": "Fan-made static tracker. Local JSON data. No API keys are used.",
    "loading": "Loading tournament data...",
    "error.title": "Data unavailable"
  },
  uk: {
    "nav.home": "Головна",
    "nav.groups": "Групи",
    "nav.matches": "Матчі",
    "nav.knockout": "Плей-оф",
    "nav.about": "Про сайт",
    "brand.title": "Футбольний трекер ЧС 2026",
    "brand.short": "Трекер",
    "hero.eyebrow": "Турнірна панель",
    "hero.title": "Стежте за чемпіонатом світу",
    "hero.subtitle": "Календар, таблиці, плей-оф і турнірна статистика в одному місці",
    "stats.teams": "Команд",
    "stats.groups": "Груп",
    "stats.playedMatches": "Зіграно матчів",
    "stats.nextMatch": "Наступний матч",
    "home.quick.groups": "До груп",
    "home.quick.matches": "До матчів",
    "home.quick.knockout": "До плей-оф",
    "home.upcoming": "Найближчі матчі",
    "home.finished": "Останні завершені",
    "home.noUpcoming": "Найближчих матчів поки немає.",
    "home.noFinished": "Завершених матчів поки немає.",
    "groups.eyebrow": "Груповий етап",
    "groups.title": "Групи",
    "groups.copy": "Таблиці груп автоматично рахуються із завершених матчів у локальному JSON.",
    "groups.emptyTitle": "Груп немає",
    "groups.emptyMessage": "Додайте групи в локальний JSON, щоб показати таблиці.",
    "groups.group": "Група",
    "groups.standings": "Таблиця",
    "groups.team": "Команда",
    "groups.played": "Ігри",
    "groups.wins": "Перемоги",
    "groups.draws": "Нічиї",
    "groups.losses": "Поразки",
    "groups.goalsFor": "Забиті",
    "groups.goalsAgainst": "Пропущені",
    "groups.goalDifference": "Різниця",
    "groups.points": "Очки",
    "groups.qualifiedZone": "Зона виходу",
    "groups.thirdZone": "Можливий вихід",
    "matches.eyebrow": "Календар",
    "matches.title": "Матчі",
    "matches.copy": "Завершені рахунки й майбутні матчі беруться з локального JSON.",
    "matches.all": "Усі",
    "matches.today": "Сьогодні",
    "matches.upcoming": "Майбутні",
    "matches.finished": "Завершені",
    "matches.groupStage": "Груповий етап",
    "matches.knockout": "Плей-оф",
    "matches.group": "Група",
    "matches.allGroups": "Усі групи",
    "matches.team": "Команда",
    "matches.allTeams": "Усі команди",
    "matches.noMatchesTitle": "Матчів немає",
    "matches.noMatchesMessage": "Додайте матчі в локальний JSON, щоб відстежувати календар і результати.",
    "matches.noFilteredTitle": "Матчів не знайдено",
    "matches.noFilteredMessage": "Спробуйте інший фільтр.",
    "matches.tapDetails": "Натисніть для деталей",
    "matches.venueTbc": "Стадіон буде уточнено",
    "matches.date": "Дата",
    "matches.time": "Час",
    "matches.kyivTime": "Київський час",
    "matches.utcTime": "UTC час",
    "matches.venue": "Стадіон",
    "matches.city": "Місто",
    "matches.stage": "Стадія",
    "status.finished": "Завершено",
    "status.upcoming": "Майбутній",
    "status.scheduled": "Заплановано",
    "status.live": "Наживо",
    "status.postponed": "Перенесено",
    "status.cancelled": "Скасовано",
    "knockout.eyebrow": "Раунди на виліт",
    "knockout.title": "Плей-оф",
    "knockout.copy": "Сітка використовує плейсхолдери з локального JSON, доки команди не визначені.",
    "knockout.emptyTitle": "Матчів плей-оф немає",
    "knockout.emptyMessage": "Додайте матчі плей-оф у локальний JSON, щоб показати сітку.",
    "knockout.bracket": "Сітка",
    "knockout.noSlot": "Слот матчу ще не додано",
    "knockout.roundOf32": "1/16 фіналу",
    "knockout.roundOf16": "1/8 фіналу",
    "knockout.quarterFinal": "1/4 фіналу",
    "knockout.semiFinal": "1/2 фіналу",
    "knockout.thirdPlace": "Матч за третє місце",
    "knockout.final": "Фінал",
    "knockout.winner": "Переможець",
    "knockout.winnerMatch": "Переможець матчу",
    "knockout.winnerGroup": "Переможець групи",
    "knockout.runnerUpGroup": "Друге місце групи",
    "knockout.bestThird": "Найкраща третя команда",
    "about.eyebrow": "Про сайт",
    "about.title": "Фанатський статичний трекер",
    "about.copy": "Простий статичний трекер чемпіонату світу для фанатів. Дані зберігаються локально в JSON і оновлюються вручну.",
    "about.what": "Що це",
    "about.whatBody": "Фанатський статичний трекер тільки з локальними JSON-даними.",
    "about.noKeys": "API-ключі не використовуються.",
    "about.manual": "Дані можна оновлювати вручну.",
    "about.dataStatus": "Статус даних",
    "about.localJson": "Локальні JSON-дані",
    "about.lastUpdated": "Останнє оновлення",
    "liveUpdate.liveTitle": "LIVE-оновлення активне",
    "liveUpdate.hourlyTitle": "Монітор оновлень",
    "liveUpdate.liveMatches": "наживо",
    "liveUpdate.standby": "Очікування",
    "liveUpdate.liveCadence": "Під час live-матчів оновлення кожні ~5 хв.",
    "liveUpdate.hourlyCadence": "Між матчами оновлення щогодини.",
    "liveUpdate.synced": "Синхронізовано",
    "about.sourceNote": "Примітка джерела",
    "footer.about": "Про сайт",
    "footer.github": "GitHub",
    "footer.note": "Фанатський статичний трекер. Локальні JSON-дані. API-ключі не використовуються.",
    "loading": "Завантаження турнірних даних...",
    "error.title": "Дані недоступні"
  }
} as const;

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "uk";
    return window.localStorage.getItem(languageStorageKey) === "en" ? "en" : "uk";
  });

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage: Language) => setLanguageState(nextLanguage);
  const t: Translate = (key) => translations[language][key] ?? translations.en[key];

  return { language, setLanguage, t };
}

export function getStageLabel(stage: string, t: Translate) {
  if (stage === "group") return t("matches.groupStage");
  if (stage === "round-of-32") return t("knockout.roundOf32");
  if (stage === "round-of-16") return t("knockout.roundOf16");
  if (stage === "quarter-final") return t("knockout.quarterFinal");
  if (stage === "semi-final") return t("knockout.semiFinal");
  if (stage === "third-place") return t("knockout.thirdPlace");
  return t("knockout.final");
}

export function getStatusLabel(status: string, t: Translate) {
  if (status === "finished") return t("status.finished");
  if (status === "live") return t("status.live");
  if (status === "postponed") return t("status.postponed");
  if (status === "cancelled") return t("status.cancelled");
  return t("status.scheduled");
}

export function translateGroupLabel(value: string, language: Language) {
  const groupId = value.replace(/^Group\s+/i, "").trim();
  return language === "uk" ? `Група ${groupId}` : `Group ${groupId}`;
}

export function translatePlaceholderLabel(value: string | undefined, language: Language) {
  if (!value) {
    return language === "uk" ? "Буде визначено" : "TBD";
  }

  if (language === "en") {
    return value;
  }

  if (/^To be decided$/i.test(value) || /^TBD$/i.test(value)) {
    return "Буде визначено";
  }

  const winnerGroup = value.match(/^Winner Group\s+(.+)$/i);
  if (winnerGroup) return `Переможець групи ${winnerGroup[1]}`;

  const runnerUpGroup = value.match(/^Runner-up Group\s+(.+)$/i);
  if (runnerUpGroup) return `2 місце групи ${runnerUpGroup[1]}`;

  const bestThird = value.match(/^Best 3rd Group\s+(.+)$/i);
  if (bestThird) return `Найкраща 3-тя команда груп ${bestThird[1]}`;

  const winnerMatch = value.match(/^Winner Match\s+(.+)$/i);
  if (winnerMatch) return `Переможець матчу ${winnerMatch[1]}`;

  const winnerSemi = value.match(/^Winner Semi-final\s+(.+)$/i);
  if (winnerSemi) return `Переможець півфіналу ${winnerSemi[1]}`;

  const loserSemi = value.match(/^Loser Semi-final\s+(.+)$/i);
  if (loserSemi) return `Переможений півфіналу ${loserSemi[1]}`;

  const group = value.match(/^Group\s+(.+)$/i);
  if (group) return `Група ${group[1]}`;

  return value;
}
