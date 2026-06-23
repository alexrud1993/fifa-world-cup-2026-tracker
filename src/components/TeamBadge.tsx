import type { Team } from "../lib/types";
import { getFlagUrlForTeamCode } from "../lib/flags";

interface TeamBadgeProps {
  team: Team;
}

export function TeamBadge({ team }: TeamBadgeProps) {
  const flagUrl = getFlagUrlForTeamCode(team.code);

  return (
    <div className="team-badge">
      {flagUrl ? (
        <img className="team-flag" src={flagUrl} alt="" loading="lazy" aria-hidden="true" />
      ) : (
        <span className="team-flag team-flag--fallback" aria-hidden="true">
          {team.code.slice(0, 2)}
        </span>
      )}
      <span className="team-copy">
        <strong>{team.name}</strong>
        <small>{team.code}</small>
      </span>
    </div>
  );
}
