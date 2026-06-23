import type { Match, Team } from "../lib/types";
import { formatDateCardKyiv, formatTimeKyiv } from "../lib/dates";
import { getFlagUrlForTeamCode } from "../lib/flags";
import { getStatusLabel, type Language, type Translate } from "../lib/i18n";
import { MatchTooltip } from "./MatchTooltip";

interface MatchCardProps {
  variant?: "default" | "compact";
  isOpen: boolean;
  language: Language;
  match: Match;
  groupLabel?: string | null;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
  homeLabel: string;
  awayLabel: string;
  onToggle: (matchId: string) => void;
  stageLabel: string;
  t: Translate;
}

export function MatchCard({
  variant = "default",
  isOpen,
  language,
  match,
  groupLabel,
  homeTeam,
  awayTeam,
  homeLabel,
  awayLabel,
  onToggle,
  stageLabel,
  t
}: MatchCardProps) {
  const isInteractive = match.status === "scheduled" || match.status === "live";
  const hasScore = typeof match.homeScore === "number" && typeof match.awayScore === "number";
  const className = [
    "match-card",
    isInteractive ? "match-card--interactive" : "match-card--static",
    variant === "compact" ? "match-card--compact" : ""
  ]
    .filter(Boolean)
    .join(" ");
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
          <MatchTeamFlag team={homeTeam} label={homeLabel} />
          <strong title={homeLabel}>{homeLabel}</strong>
        </div>
        <div className="match-score-block">
          <span className="match-score">
            {(match.status === "finished" || match.status === "live") && hasScore
              ? `${match.homeScore} : ${match.awayScore}`
              : formatTimeKyiv(match.kickoffUtc, language)}
          </span>
          <small>
            {formatDateCardKyiv(match.kickoffUtc, language)} | {formatTimeKyiv(match.kickoffUtc, language)}
          </small>
        </div>
        <div className="match-side match-side--away">
          <MatchTeamFlag team={awayTeam} label={awayLabel} />
          <strong title={awayLabel}>{awayLabel}</strong>
        </div>
      </div>

      <div className="match-card-footer">
        {match.venue || match.city ? (
          <span>{[match.venue, match.city].filter(Boolean).join(", ")}</span>
        ) : (
          <span>{t("matches.venueTbc")}</span>
        )}
        {isInteractive ? <span className="match-card-action">{t("matches.tapDetails")}</span> : null}
      </div>

      {isInteractive && isOpen ? (
        <MatchTooltip
          groupLabel={groupLabel}
          language={language}
          match={match}
          stageLabel={stageLabel}
          t={t}
        />
      ) : null}
    </>
  );

  if (!isInteractive) {
    return <article className={className}>{content}</article>;
  }

  return (
    <button
      aria-expanded={isOpen}
      className={className}
      onClick={() => onToggle(match.id)}
      type="button"
    >
      {content}
    </button>
  );
}

function MatchTeamFlag({ label, team }: { label: string; team?: Team | null }) {
  const flagUrl = team ? getFlagUrlForTeamCode(team.code) : null;

  if (flagUrl) {
    return <img className="match-team-flag" src={flagUrl} alt="" loading="lazy" aria-hidden="true" />;
  }

  return <span className="match-team-token" aria-hidden="true">{getTeamInitials(label)}</span>;
}

function getTeamInitials(label: string) {
  const words = label
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "TBD";
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
