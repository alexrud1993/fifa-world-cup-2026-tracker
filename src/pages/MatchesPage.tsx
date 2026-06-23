import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { MatchCard } from "../components/MatchCard";
import { isTodayKyiv, sortMatchesByDate } from "../lib/dates";
import {
  getStageLabel,
  translateGroupLabel,
  translatePlaceholderLabel,
  type Language,
  type Translate
} from "../lib/i18n";
import type { Match, Team, TournamentData } from "../lib/types";

interface MatchesPageProps {
  data: TournamentData;
  language: Language;
  t: Translate;
}

type MatchFilterId = "all" | "today" | "upcoming" | "finished" | "group" | "knockout";

const matchFilters: Array<{ id: MatchFilterId; labelKey: Parameters<Translate>[0] }> = [
  { id: "all", labelKey: "matches.all" },
  { id: "today", labelKey: "matches.today" },
  { id: "upcoming", labelKey: "matches.upcoming" },
  { id: "finished", labelKey: "matches.finished" },
  { id: "group", labelKey: "matches.groupStage" },
  { id: "knockout", labelKey: "matches.knockout" }
];

export function MatchesPage({ data, language, t }: MatchesPageProps) {
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
        <p className="eyebrow">{t("matches.eyebrow")}</p>
        <h1 id="matches-title">{t("matches.title")}</h1>
        <p className="section-copy">{t("matches.copy")}</p>
      </div>

      {data.matches.length === 0 ? (
        <EmptyState
          message={t("matches.noMatchesMessage")}
          title={t("matches.noMatchesTitle")}
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
                  {t(filter.labelKey)}
                </button>
              ))}
            </div>

            <div className="select-filter-row">
              {availableGroups.length > 0 ? (
                <label className="select-filter">
                  <span>{t("matches.group")}</span>
                  <select
                    onChange={(event) => setSelectedGroup(event.target.value)}
                    value={selectedGroup}
                  >
                    <option value="all">{t("matches.allGroups")}</option>
                    {availableGroups.map((groupId) => (
                      <option key={groupId} value={groupId}>
                        {translateGroupLabel(groupNameById.get(groupId) ?? groupId, language)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {availableTeams.length > 0 ? (
                <label className="select-filter">
                  <span>{t("matches.team")}</span>
                  <select
                    onChange={(event) => setSelectedTeam(event.target.value)}
                    value={selectedTeam}
                  >
                    <option value="all">{t("matches.allTeams")}</option>
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
                message={t("matches.noFilteredMessage")}
                title={t("matches.noFilteredTitle")}
              />
            ) : (
              filteredMatches.map((match) => {
                const groupId = resolveMatchGroupId(match, teamsById);
                const groupLabel = groupId
                  ? translateGroupLabel(groupNameById.get(groupId) ?? groupId, language)
                  : null;

                return (
                  <MatchCard
                    awayLabel={resolveTeamLabel(match.awayTeamId, match.awayPlaceholder, teamsById, language)}
                    awayTeam={resolveTeam(match.awayTeamId, teamsById)}
                    groupLabel={groupLabel}
                    homeLabel={resolveTeamLabel(match.homeTeamId, match.homePlaceholder, teamsById, language)}
                    homeTeam={resolveTeam(match.homeTeamId, teamsById)}
                    isOpen={openMatchId === match.id}
                    language={language}
                    key={match.id}
                    match={match}
                    onToggle={(matchId) =>
                      setOpenMatchId((current) => (current === matchId ? null : matchId))
                    }
                    stageLabel={getStageLabel(match.stage, t)}
                    t={t}
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
