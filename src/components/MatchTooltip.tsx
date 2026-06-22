import type { Match } from "../lib/types";
import { formatDateKyiv, formatTimeKyiv, formatTimeUtc } from "../lib/dates";

interface MatchTooltipProps {
  match: Match;
  groupLabel?: string | null;
  stageLabel: string;
}

export function MatchTooltip({ match, groupLabel, stageLabel }: MatchTooltipProps) {
  return (
    <div className="match-tooltip" role="dialog" aria-label="Match details">
      <dl className="match-tooltip-grid">
        <div>
          <dt>Date</dt>
          <dd>{formatDateKyiv(match.kickoffUtc)}</dd>
        </div>
        <div>
          <dt>Kyiv time</dt>
          <dd>{formatTimeKyiv(match.kickoffUtc)}</dd>
        </div>
        <div>
          <dt>UTC time</dt>
          <dd>{formatTimeUtc(match.kickoffUtc)}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{stageLabel}</dd>
        </div>
        {groupLabel ? (
          <div>
            <dt>Group</dt>
            <dd>{groupLabel}</dd>
          </div>
        ) : null}
        {match.venue ? (
          <div>
            <dt>Venue</dt>
            <dd>{match.venue}</dd>
          </div>
        ) : null}
        {match.city ? (
          <div>
            <dt>City</dt>
            <dd>{match.city}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
