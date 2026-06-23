import { useState } from "react";
import { GroupTable } from "../components/GroupTable";
import { KnockoutBracket } from "../components/KnockoutBracket";
import { MatchCard } from "../components/MatchCard";
import { UpdateMonitor } from "../components/UpdateMonitor";
import { formatDateTimeKyiv, sortMatchesByDate } from "../lib/dates";
import {
  getStageLabel,
  translateGroupLabel,
  translatePlaceholderLabel,
  type Language,
  type Translate
} from "../lib/i18n";
import type { Match, Team, TournamentData, ViewId } from "../lib/types";

interface HomePageProps {
  data: TournamentData;
  language: Language;
  onNavigate: (view: ViewId) => void;
  t: Translate;
}

export function HomePage({ data, language, onNavigate, t }: HomePageProps) {
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  const teamsById = new Map(data.teams.map((team) => [team.id, team]));
  const groupsById = new Map(data.groups.map((group) => [group.id, group.name]));
  const upcomingMatches = sortMatchesByDate(
    data.matches.filter((match) => match.status === "scheduled")
  ).slice(0, 3);
  const liveMatches = sortMatchesByDate(data.matches.filter((match) => match.status === "live"));
  const latestFinishedMatches = sortMatchesByDate(
    data.matches.filter((match) => match.status === "finished")
  )
    .reverse()
    .slice(0, 3);
  const finishedMatchesCount = data.matches.filter((match) => match.status === "finished").length;
  const nextMatch = upcomingMatches[0];
  const previewGroups = data.groups.slice(0, 4);
  const previewMatches = [...liveMatches, ...latestFinishedMatches, ...upcomingMatches].slice(0, 4);
  const knockoutMatchesCount = data.matches.filter((match) => match.stage !== "group").length;

  return (
    <section className="home-dashboard" aria-labelledby="home-title">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">{t("hero.eyebrow")}</p>
          <h1 id="home-title">{t("hero.title")}</h1>
          <p className="hero-copy">{t("hero.subtitle")}</p>
          <div className="home-quick-actions" aria-label="Quick navigation">
            <button className="home-quick-button" onClick={() => onNavigate("groups")} type="button">
              {t("home.quick.groups")}
            </button>
            <button className="home-quick-button" onClick={() => onNavigate("matches")} type="button">
              {t("home.quick.matches")}
            </button>
            <button className="home-quick-button" onClick={() => onNavigate("knockout")} type="button">
              {t("home.quick.knockout")}
            </button>
          </div>
        </div>

        <div className="home-hero-side" aria-label="Tournament summary">
          <section className="home-summary-grid">
            <SummaryCard label={t("stats.teams")} value={String(data.teams.length)} />
            <SummaryCard label={t("stats.groups")} value={String(data.groups.length)} />
            <SummaryCard label={t("stats.playedMatches")} value={String(finishedMatchesCount)} />
            <SummaryCard
              label={t("stats.nextMatch")}
              value={nextMatch ? formatDateTimeKyiv(nextMatch.kickoffUtc, language) : "-"}
            />
          </section>

          <UpdateMonitor
            language={language}
            lastUpdated={data.tournament.lastUpdated}
            matches={data.matches}
            t={t}
          />
        </div>
      </section>

      {previewGroups.length > 0 ? (
        <section className="home-preview-section" aria-labelledby="home-groups-title">
          <div className="home-preview-heading">
            <div>
              <p className="eyebrow">{t("groups.eyebrow")}</p>
              <h2 id="home-groups-title">{t("groups.title")}</h2>
            </div>
            <button className="home-section-link" onClick={() => onNavigate("groups")} type="button">
              {t("home.quick.groups")}
            </button>
          </div>
          <div className="home-group-preview-grid">
            {previewGroups.map((group) => (
              <GroupTable compact data={data} group={group} key={group.id} language={language} t={t} />
            ))}
          </div>
          <div className="home-group-legend">
            <span><i className="legend-dot legend-dot--green" />{t("groups.qualifiedZone")}</span>
            <span><i className="legend-dot legend-dot--muted" />{t("groups.thirdZone")}</span>
          </div>
        </section>
      ) : null}

      <section className="home-preview-section" aria-labelledby="home-matches-title">
        <div className="home-preview-heading">
          <div>
            <p className="eyebrow">{t("matches.eyebrow")}</p>
            <h2 id="home-matches-title">{t("matches.title")}</h2>
          </div>
          <button className="home-section-link" onClick={() => onNavigate("matches")} type="button">
            {t("home.quick.matches")}
          </button>
        </div>

        <div className="home-match-preview-grid">
          {previewMatches.length > 0 ? (
            previewMatches.map((match) => (
                <MatchCard
                  awayLabel={resolveTeamLabel(match.awayTeamId, match.awayPlaceholder, teamsById, language)}
                  awayTeam={resolveTeam(match.awayTeamId, teamsById)}
                  groupLabel={resolveGroupLabel(match, groupsById, teamsById, language)}
                  homeLabel={resolveTeamLabel(match.homeTeamId, match.homePlaceholder, teamsById, language)}
                  homeTeam={resolveTeam(match.homeTeamId, teamsById)}
                  isOpen={openMatchId === match.id}
                language={language}
                lastUpdated={data.tournament.lastUpdated}
                key={match.id}
                match={match}
                onToggle={(matchId) =>
                  setOpenMatchId((current) => (current === matchId ? null : matchId))
                }
                stageLabel={getStageLabel(match.stage, t)}
                t={t}
                variant="compact"
              />
            ))
          ) : (
            <div className="state-panel state-panel--compact">{t("matches.noMatchesTitle")}</div>
          )}
        </div>
      </section>

      {knockoutMatchesCount > 0 ? (
        <section className="home-preview-section home-knockout-section" aria-labelledby="home-knockout-title">
          <div className="home-preview-heading">
            <div>
              <p className="eyebrow">{t("knockout.eyebrow")}</p>
              <h2 id="home-knockout-title">{t("knockout.title")}</h2>
            </div>
            <button className="home-section-link" onClick={() => onNavigate("knockout")} type="button">
              {t("home.quick.knockout")}
            </button>
          </div>
          <KnockoutBracket compact data={data} language={language} t={t} />
        </section>
      ) : null}
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <article className={value.length > 12 ? "home-summary-card home-summary-card--wide-value" : "home-summary-card"}>
      <span className="summary-marker" aria-hidden="true" />
      <span className="summary-label">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
function resolveTeamLabel(
  teamId: string | undefined,
  placeholder: string | undefined,
  teamsById: Map<string, Team>,
  language: Language
) {
  if (teamId) {
    return teamsById.get(teamId)?.name ?? (placeholder ? translatePlaceholderLabel(placeholder, language) : teamId);
  }

  return translatePlaceholderLabel(placeholder, language);
}

function resolveTeam(teamId: string | undefined, teamsById: Map<string, Team>) {
  return teamId ? teamsById.get(teamId) ?? null : null;
}

function resolveGroupLabel(
  match: Match,
  groupsById: Map<string, string>,
  teamsById: Map<string, Team>,
  language: Language
) {
  if (match.groupId) {
    return translateGroupLabel(groupsById.get(match.groupId) ?? match.groupId, language);
  }

  if (!match.homeTeamId || !match.awayTeamId) {
    return null;
  }

  const homeGroup = teamsById.get(match.homeTeamId)?.group;
  const awayGroup = teamsById.get(match.awayTeamId)?.group;

  if (homeGroup && homeGroup === awayGroup) {
    return translateGroupLabel(groupsById.get(homeGroup) ?? homeGroup, language);
  }

  return null;
}
