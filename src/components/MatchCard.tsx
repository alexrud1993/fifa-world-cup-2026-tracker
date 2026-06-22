import type { Match } from "../lib/types";
import { formatDateCardKyiv, formatTimeKyiv } from "../lib/dates";
import { MatchTooltip } from "./MatchTooltip";

interface MatchCardProps {
  isOpen: boolean;
  match: Match;
  groupLabel?: string | null;
  homeLabel: string;
  awayLabel: string;
  onToggle: (matchId: string) => void;
  stageLabel: string;
}

export function MatchCard({
  isOpen,
  match,
  groupLabel,
  homeLabel,
  awayLabel,
  onToggle,
  stageLabel
}: MatchCardProps) {
  const isScheduled = match.status === "scheduled";
  const content = (
    <>
      <div className="match-card-topline">
        <div className="match-chip-row">
          <span className="match-stage-chip">{stageLabel}</span>
          {groupLabel ? <span className="match-group-chip">{groupLabel}</span> : null}
        </div>
        <span className={`match-status-badge match-status-badge--${match.status}`}>
          {getStatusLabel(match.status)}
        </span>
      </div>

      <div className="match-card-main">
        <div className="match-side">
          <strong>{homeLabel}</strong>
        </div>
        <div className="match-score-block">
          <span className="match-score">
            {match.status === "finished" &&
            typeof match.homeScore === "number" &&
            typeof match.awayScore === "number"
              ? `${match.homeScore} : ${match.awayScore}`
              : "vs"}
          </span>
          <small>
            {formatDateCardKyiv(match.kickoffUtc)} | {formatTimeKyiv(match.kickoffUtc)}
          </small>
        </div>
        <div className="match-side match-side--away">
          <strong>{awayLabel}</strong>
        </div>
      </div>

      <div className="match-card-footer">
        {match.venue || match.city ? (
          <span>{[match.venue, match.city].filter(Boolean).join(", ")}</span>
        ) : (
          <span>Venue to be confirmed</span>
        )}
        {isScheduled ? <span className="match-card-action">Tap for details</span> : null}
      </div>

      {isScheduled && isOpen ? (
        <MatchTooltip groupLabel={groupLabel} match={match} stageLabel={stageLabel} />
      ) : null}
    </>
  );

  if (!isScheduled) {
    return <article className="match-card match-card--static">{content}</article>;
  }

  return (
    <button
      aria-expanded={isOpen}
      className="match-card match-card--interactive"
      onClick={() => onToggle(match.id)}
      type="button"
    >
      {content}
    </button>
  );
}

function getStatusLabel(status: Match["status"]) {
  if (status === "finished") return "Finished";
  if (status === "live") return "Live";
  if (status === "postponed") return "Postponed";
  if (status === "cancelled") return "Cancelled";
  return "Scheduled";
}
