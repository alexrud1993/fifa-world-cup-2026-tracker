import type { Match } from "../lib/types";
import { formatDateCardKyiv, formatTimeKyiv } from "../lib/dates";
import { getStatusLabel, type Translate } from "../lib/i18n";
import { MatchTooltip } from "./MatchTooltip";

interface MatchCardProps {
  isOpen: boolean;
  match: Match;
  groupLabel?: string | null;
  homeLabel: string;
  awayLabel: string;
  onToggle: (matchId: string) => void;
  stageLabel: string;
  t: Translate;
}

export function MatchCard({
  isOpen,
  match,
  groupLabel,
  homeLabel,
  awayLabel,
  onToggle,
  stageLabel,
  t
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
          {getStatusLabel(match.status, t)}
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
          <span>{t("matches.venueTbc")}</span>
        )}
        {isScheduled ? <span className="match-card-action">{t("matches.tapDetails")}</span> : null}
      </div>

      {isScheduled && isOpen ? (
        <MatchTooltip groupLabel={groupLabel} match={match} stageLabel={stageLabel} t={t} />
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
