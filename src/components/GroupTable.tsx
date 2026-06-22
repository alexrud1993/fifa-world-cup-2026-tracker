import { calculateGroupStandings } from "../lib/standings";
import type { Group, TournamentData } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { TeamBadge } from "./TeamBadge";

interface GroupTableProps {
  data: TournamentData;
  group: Group;
}

const desktopColumns = [
  { key: "team", label: "Team", compact: "Team" },
  { key: "played", label: "Played", compact: "P" },
  { key: "wins", label: "Wins", compact: "W" },
  { key: "draws", label: "Draws", compact: "D" },
  { key: "losses", label: "Losses", compact: "L" },
  { key: "goalsFor", label: "Goals For", compact: "GF" },
  { key: "goalsAgainst", label: "Goals Against", compact: "GA" },
  { key: "goalDifference", label: "Goal Difference", compact: "GD" },
  { key: "points", label: "Points", compact: "Pts" }
] as const;

export function GroupTable({ data, group }: GroupTableProps) {
  const standings = calculateGroupStandings(data)[group.id] ?? [];
  const teamsById = new Map(data.teams.map((team) => [team.id, team]));

  return (
    <article className="group-table-card">
      <div className="group-table-header">
        <div>
          <p className="eyebrow">Standings</p>
          <h2>{group.name}</h2>
        </div>
        <div className="group-table-legend" aria-label="Qualification legend">
          <StatusBadge tone="qualified" label="Top 2" />
          <StatusBadge tone="third" label="Best 3rd" />
        </div>
      </div>

      <div className="group-table-wrap">
        <table className="group-table">
          <thead>
            <tr>
              {desktopColumns.map((column) => (
                <th key={column.key} scope="col">
                  <span className="desktop-label">{column.label}</span>
                  <span className="mobile-label">{column.compact}</span>
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
                      {row.qualificationStatus === "qualified-zone" ? (
                        <StatusBadge tone="qualified" label="Top 2" />
                      ) : null}
                      {row.qualificationStatus === "third-place-zone" ? (
                        <StatusBadge tone="third" label="Best 3rd" />
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
    </article>
  );
}
