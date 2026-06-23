import type { Team } from "../lib/types";
import { getFlagUrlForTeamCode } from "../lib/flags";

interface TeamBadgeProps {
  display?: "full" | "code";
  team: Team;
}

export function TeamBadge({ display = "full", team }: TeamBadgeProps) {
  const flagUrl = getFlagUrlForTeamCode(team.code);
  const title = `${team.name} (${team.code})`;

  return (
    <div aria-label={title} className={`team-badge team-badge--${display}`} title={title}>
      {flagUrl ? (
        <img className="team-flag" src={flagUrl} alt="" loading="lazy" aria-hidden="true" />
      ) : (
        <span className="team-flag team-flag--fallback" aria-hidden="true">
          {team.code.slice(0, 2)}
        </span>
      )}
      <span className="team-copy">
        <strong>{display === "code" ? team.code : team.name}</strong>
        {display === "full" ? <small>{team.code}</small> : null}
      </span>
    </div>
  );
}
