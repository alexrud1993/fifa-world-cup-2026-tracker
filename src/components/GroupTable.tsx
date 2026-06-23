import { calculateGroupStandings } from "../lib/standings";
import { translateGroupLabel, type Language, type Translate, type TranslationKey } from "../lib/i18n";
import type { Group, TournamentData } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { TeamBadge } from "./TeamBadge";

interface GroupTableProps {
  compact?: boolean;
  data: TournamentData;
  group: Group;
  language: Language;
  t: Translate;
}

const desktopColumns = [
  { key: "team", labelKey: "groups.team", compactEn: "Team", compactUk: "Команда" },
  { key: "played", labelKey: "groups.played", compactEn: "P", compactUk: "І" },
  { key: "wins", labelKey: "groups.wins", compactEn: "W", compactUk: "В" },
  { key: "draws", labelKey: "groups.draws", compactEn: "D", compactUk: "Н" },
  { key: "losses", labelKey: "groups.losses", compactEn: "L", compactUk: "П" },
  { key: "goalsFor", labelKey: "groups.goalsFor", compactEn: "GF", compactUk: "ЗМ" },
  { key: "goalsAgainst", labelKey: "groups.goalsAgainst", compactEn: "GA", compactUk: "ПМ" },
  { key: "goalDifference", labelKey: "groups.goalDifference", compactEn: "GD", compactUk: "РМ" },
  { key: "points", labelKey: "groups.points", compactEn: "Pts", compactUk: "О" }
] as const;

export function GroupTable({ compact = false, data, group, language, t }: GroupTableProps) {
  const standings = calculateGroupStandings(data)[group.id] ?? [];
  const teamsById = new Map(data.teams.map((team) => [team.id, team]));

  return (
    <article className={compact ? "group-table-card group-table-card--compact" : "group-table-card"}>
      <div className="group-table-header">
        <div>
          <p className="eyebrow">{t("groups.standings")}</p>
          <h2>{translateGroupLabel(group.name, language)}</h2>
        </div>
      </div>

      <div className="group-table-wrap">
        <table className="group-table">
          <thead>
            <tr>
              {desktopColumns.map((column) => (
                <th key={column.key} scope="col">
                  <span className="desktop-label">{t(column.labelKey as TranslationKey)}</span>
                  <span className="mobile-label">{language === "uk" ? column.compactUk : column.compactEn}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const team = teamsById.get(row.teamId);
              const highlightClass =
                row.qualificationStatus === "qualified-zone"
                  ? "group-row--qualified"
                  : row.qualificationStatus === "third-place-zone"
                    ? "group-row--third"
                    : "";

              if (!team) {
                return null;
              }

              return (
                <tr className={highlightClass} key={row.teamId}>
                  <td data-label="Team">
                    <div className="team-cell">
                      <span className="team-rank">{row.rank}</span>
                      <TeamBadge team={team} />
                      {!compact && row.qualificationStatus === "qualified-zone" ? (
                        <StatusBadge tone="qualified" label={t("groups.qualifiedZone")} />
                      ) : null}
                      {!compact && row.qualificationStatus === "third-place-zone" ? (
                        <StatusBadge tone="third" label={t("groups.thirdZone")} />
                      ) : null}
                    </div>
                  </td>
                  <td data-label="P">{row.played}</td>
                  <td data-label="W">{row.won}</td>
                  <td data-label="D">{row.drawn}</td>
                  <td data-label="L">{row.lost}</td>
                  <td data-label="GF">{row.goalsFor}</td>
                  <td data-label="GA">{row.goalsAgainst}</td>
                  <td data-label="GD">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                  <td className="points-cell" data-label="Pts">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!compact ? (
        <div className="group-table-legend group-table-legend--footer" aria-label="Qualification legend">
          <StatusBadge tone="qualified" label={t("groups.qualifiedZone")} />
          <StatusBadge tone="third" label={t("groups.thirdZone")} />
        </div>
      ) : null}
    </article>
  );
}
