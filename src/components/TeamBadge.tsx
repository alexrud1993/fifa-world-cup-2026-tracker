import type { Team } from "../lib/types";

interface TeamBadgeProps {
  team: Team;
}

export function TeamBadge({ team }: TeamBadgeProps) {
  return (
    <div className="team-badge">
      <span className="team-flag" aria-hidden="true">
        {team.code.slice(0, 2)}
      </span>
      <span className="team-copy">
        <strong>{team.name}</strong>
        <small>{team.code}</small>
      </span>
    </div>
  );
}
