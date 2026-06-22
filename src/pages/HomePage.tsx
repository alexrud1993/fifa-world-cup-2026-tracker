import { useState } from "react";
import { MatchCard } from "../components/MatchCard";
import { formatDateTimeKyiv, sortMatchesByDate } from "../lib/dates";
import { getStageLabel, type Translate } from "../lib/i18n";
import type { Match, Team, TournamentData, ViewId } from "../lib/types";

interface HomePageProps {
  data: TournamentData;
  onNavigate: (view: ViewId) => void;
  t: Translate;
}

export function HomePage({ data, onNavigate, t }: HomePageProps) {
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  const teamsById = new Map(data.teams.map((team) => [team.id, team]));
  const groupsById = new Map(data.groups.map((group) => [group.id, group.name]));
  const upcomingMatches = sortMatchesByDate(
    data.matches.filter((match) => match.status === "scheduled")
  ).slice(0, 3);
  const latestFinishedMatches = sortMatchesByDate(
    data.matches.filter((match) => match.status === "finished")
  )
    .reverse()
    .slice(0, 3);
  const finishedMatchesCount = data.matches.filter((match) => match.status === "finished").length;
  const nextMatch = upcomingMatches[0];

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

        <div className="home-updated-card">
          <span>{t("about.lastUpdated")}</span>
          <strong>{formatDateTimeKyiv(data.tournament.lastUpdated)}</strong>
          <p>{data.tournament.note}</p>
        </div>
      </section>

      <section className="home-summary-grid" aria-label="Tournament summary">
        <SummaryCard label={t("stats.teams")} value={String(data.teams.length)} />
        <SummaryCard label={t("stats.groups")} value={String(data.groups.length)} />
        <SummaryCard label={t("stats.playedMatches")} value={String(finishedMatchesCount)} />
        <SummaryCard
          label={t("stats.nextMatch")}
          value={nextMatch ? formatDateTimeKyiv(nextMatch.kickoffUtc) : "-"}
        />
      </section>

      <section className="home-match-sections">
        <div className="home-match-column">
          <div className="home-section-heading">
            <p className="eyebrow">{t("status.upcoming")}</p>
            <h2>{t("home.upcoming")}</h2>
          </div>
          <div className="match-stack">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <MatchCard
                  awayLabel={resolveTeamLabel(match.awayTeamId, match.awayPlaceholder, teamsById)}
                  groupLabel={resolveGroupLabel(match, groupsById, teamsById)}
                  homeLabel={resolveTeamLabel(match.homeTeamId, match.homePlaceholder, teamsById)}
                  isOpen={openMatchId === match.id}
                  key={match.id}
                  match={match}
                  onToggle={(matchId) =>
                    setOpenMatchId((current) => (current === matchId ? null : matchId))
                  }
                  stageLabel={getStageLabel(match.stage, t)}
                  t={t}
                />
              ))
            ) : (
              <div className="state-panel state-panel--compact">{t("home.noUpcoming")}</div>
            )}
          </div>
        </div>

        <div className="home-match-column">
          <div className="home-section-heading">
            <p className="eyebrow">{t("status.finished")}</p>
            <h2>{t("home.finished")}</h2>
          </div>
          <div className="match-stack">
            {latestFinishedMatches.length > 0 ? (
              latestFinishedMatches.map((match) => (
                <MatchCard
                  awayLabel={resolveTeamLabel(match.awayTeamId, match.awayPlaceholder, teamsById)}
                  groupLabel={resolveGroupLabel(match, groupsById, teamsById)}
                  homeLabel={resolveTeamLabel(match.homeTeamId, match.homePlaceholder, teamsById)}
                  isOpen={false}
                  key={match.id}
                  match={match}
                  onToggle={() => undefined}
                  stageLabel={getStageLabel(match.stage, t)}
                  t={t}
                />
              ))
            ) : (
              <div className="state-panel state-panel--compact">{t("home.noFinished")}</div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <article className="home-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
function resolveTeamLabel(
  teamId: string | undefined,
  placeholder: string | undefined,
  teamsById: Map<string, Team>
) {
  if (teamId) {
    return teamsById.get(teamId)?.name ?? placeholder ?? teamId;
  }

  return placeholder ?? "TBD";
}

function resolveGroupLabel(
  match: Match,
  groupsById: Map<string, string>,
  teamsById: Map<string, Team>
) {
  if (match.groupId) {
    return groupsById.get(match.groupId) ?? `Group ${match.groupId}`;
  }

  if (!match.homeTeamId || !match.awayTeamId) {
    return null;
  }

  const homeGroup = teamsById.get(match.homeTeamId)?.group;
  const awayGroup = teamsById.get(match.awayTeamId)?.group;

  if (homeGroup && homeGroup === awayGroup) {
    return groupsById.get(homeGroup) ?? `Group ${homeGroup}`;
  }

  return null;
}
