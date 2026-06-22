import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { MatchCard } from "../components/MatchCard";
import { isTodayKyiv, sortMatchesByDate } from "../lib/dates";
import type { Match, Team, TournamentData } from "../lib/types";

interface MatchesPageProps {
  data: TournamentData;
}

type MatchFilterId = "all" | "today" | "upcoming" | "finished" | "group" | "knockout";

const matchFilters: Array<{ id: MatchFilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "finished", label: "Finished" },
  { id: "group", label: "Group stage" },
  { id: "knockout", label: "Knockout" }
];

export function MatchesPage({ data }: MatchesPageProps) {
  const [activeFilter, setActiveFilter] = useState<MatchFilterId>("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  const teamsById = new Map(data.teams.map((team) => [team.id, team]));
  const groupNameById = new Map(data.groups.map((group) => [group.id, group.name]));
  const groupStageMatches = data.matches.filter((match) => match.stage === "group");

  const availableGroups = (() => {
    const groupIds = new Set<string>();
    for (const match of groupStageMatches) {
      const groupId = resolveMatchGroupId(match, teamsById);
      if (groupId) {
        groupIds.add(groupId);
      }
    }
    return [...groupIds].sort();
  })();

  const availableTeams = (() => {
    const teamIds = new Set<string>();
    for (const match of data.matches) {
      if (match.homeTeamId) teamIds.add(match.homeTeamId);
      if (match.awayTeamId) teamIds.add(match.awayTeamId);
    }

    return [...teamIds]
      .map((teamId) => teamsById.get(teamId))
      .filter((team): team is Team => Boolean(team))
      .sort((left, right) => left.name.localeCompare(right.name));
  })();

  const filteredMatches = sortMatchesByDate(data.matches).filter((match) => {
    if (activeFilter === "today" && !isTodayKyiv(match.kickoffUtc)) return false;
    if (activeFilter === "upcoming" && match.status !== "scheduled") return false;
    if (activeFilter === "finished" && match.status !== "finished") return false;
    if (activeFilter === "group" && match.stage !== "group") return false;
    if (activeFilter === "knockout" && match.stage === "group") return false;

    const groupId = resolveMatchGroupId(match, teamsById);
    if (selectedGroup !== "all" && groupId !== selectedGroup) return false;

    if (
      selectedTeam !== "all" &&
      match.homeTeamId !== selectedTeam &&
      match.awayTeamId !== selectedTeam
    ) {
      return false;
    }

    return true;
  });

  return (
    <section aria-labelledby="matches-title">
      <div className="page-heading">
        <p className="eyebrow">Fixtures</p>
        <h1 id="matches-title">Matches</h1>
        <p className="section-copy">
          Filters use only local JSON data, with no external APIs and no backend.
        </p>
      </div>

      {data.matches.length === 0 ? (
        <EmptyState
          message="Add matches to the local tournament JSON to start tracking fixtures and results."
          title="No matches available"
        />
      ) : (
        <>
          <div className="matches-controls">
            <div className="filter-chips" aria-label="Match filters">
              {matchFilters.map((filter) => (
                <button
                  className={activeFilter === filter.id ? "filter-chip active" : "filter-chip"}
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="select-filter-row">
              {availableGroups.length > 0 ? (
                <label className="select-filter">
                  <span>Group</span>
                  <select
                    onChange={(event) => setSelectedGroup(event.target.value)}
                    value={selectedGroup}
                  >
                    <option value="all">All groups</option>
                    {availableGroups.map((groupId) => (
                      <option key={groupId} value={groupId}>
                        {groupNameById.get(groupId) ?? `Group ${groupId}`}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {availableTeams.length > 0 ? (
                <label className="select-filter">
                  <span>Team</span>
                  <select
                    onChange={(event) => setSelectedTeam(event.target.value)}
                    value={selectedTeam}
                  >
                    <option value="all">All teams</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          </div>

          <div className="match-stack">
            {filteredMatches.length === 0 ? (
              <EmptyState
                compact
                message="Try a different filter to see more fixtures."
                title="No matches found"
              />
            ) : (
              filteredMatches.map((match) => {
                const groupId = resolveMatchGroupId(match, teamsById);
                const groupLabel = groupId
                  ? groupNameById.get(groupId) ?? `Group ${groupId}`
                  : null;

                return (
                  <MatchCard
                    awayLabel={resolveTeamLabel(match.awayTeamId, match.awayPlaceholder, teamsById)}
                    groupLabel={groupLabel}
                    homeLabel={resolveTeamLabel(match.homeTeamId, match.homePlaceholder, teamsById)}
                    isOpen={openMatchId === match.id}
                    key={match.id}
                    match={match}
                    onToggle={(matchId) =>
                      setOpenMatchId((current) => (current === matchId ? null : matchId))
                    }
                    stageLabel={formatStageLabel(match.stage)}
                  />
                );
              })
            )}
          </div>
        </>
      )}
    </section>
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

function resolveMatchGroupId(match: Match, teamsById: Map<string, Team>) {
  if (match.groupId) {
    return match.groupId;
  }

  if (!match.homeTeamId || !match.awayTeamId) {
    return null;
  }

  const homeGroup = teamsById.get(match.homeTeamId)?.group;
  const awayGroup = teamsById.get(match.awayTeamId)?.group;

  return homeGroup && homeGroup === awayGroup ? homeGroup : null;
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
