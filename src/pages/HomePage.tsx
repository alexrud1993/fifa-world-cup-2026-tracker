import { useState } from "react";
import { MatchCard } from "../components/MatchCard";
import { formatDateTimeKyiv, sortMatchesByDate } from "../lib/dates";
import type { Match, Team, TournamentData, ViewId } from "../lib/types";

interface HomePageProps {
  data: TournamentData;
  onNavigate: (view: ViewId) => void;
}

export function HomePage({ data, onNavigate }: HomePageProps) {
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
  const upcomingMatchesCount = data.matches.filter((match) => match.status === "scheduled").length;

  return (
    <section className="home-dashboard" aria-labelledby="home-title">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Tournament dashboard</p>
          <h1 id="home-title">{data.tournament.name}</h1>
          <p className="hero-copy">
            Local tournament tracking with editable JSON data, readable match views, and a clean
            football-first dashboard.
          </p>
        </div>

        <div className="home-updated-card">
          <span>Last updated</span>
          <strong>{formatDateTimeKyiv(data.tournament.lastUpdated)}</strong>
          <p>{data.tournament.note}</p>
        </div>
      </section>

      <section className="home-summary-grid" aria-label="Tournament summary">
        <SummaryCard label="Total teams" value={String(data.teams.length)} />
        <SummaryCard label="Total groups" value={String(data.groups.length)} />
        <SummaryCard label="Finished matches" value={String(finishedMatchesCount)} />
        <SummaryCard label="Upcoming matches" value={String(upcomingMatchesCount)} />
      </section>

      <section className="home-quick-actions" aria-label="Quick navigation">
        <button className="home-quick-button" onClick={() => onNavigate("groups")} type="button">
          View Groups
        </button>
        <button className="home-quick-button" onClick={() => onNavigate("matches")} type="button">
          View Matches
        </button>
        <button className="home-quick-button" onClick={() => onNavigate("knockout")} type="button">
          View Knockout
        </button>
      </section>

      <section className="home-match-sections">
        <div className="home-match-column">
          <div className="home-section-heading">
            <p className="eyebrow">Ahead</p>
            <h2>Next 3 Upcoming Matches</h2>
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
                  stageLabel={formatStageLabel(match.stage)}
                />
              ))
            ) : (
              <div className="state-panel state-panel--compact">No upcoming matches yet.</div>
            )}
          </div>
        </div>

        <div className="home-match-column">
          <div className="home-section-heading">
            <p className="eyebrow">Latest</p>
            <h2>Latest 3 Finished Matches</h2>
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
                  stageLabel={formatStageLabel(match.stage)}
                />
              ))
            ) : (
              <div className="state-panel state-panel--compact">No finished matches yet.</div>
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

function formatStageLabel(stage: Match["stage"]) {
  if (stage === "group") return "Group stage";
  if (stage === "round-of-32") return "Round of 32";
  if (stage === "round-of-16") return "Round of 16";
  if (stage === "quarter-final") return "Quarter-final";
  if (stage === "semi-final") return "Semi-final";
  if (stage === "third-place") return "Third-place";
  return "Final";
}
