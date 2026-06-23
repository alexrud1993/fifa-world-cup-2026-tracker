import { formatDateTimeKyiv } from "../lib/dates";
import {
  getMatchParticipant,
  getWinnerTeamId,
  groupKnockoutMatchesByStage,
  knockoutStages
} from "../lib/knockout";
import {
  getStageLabel,
  getStatusLabel,
  translatePlaceholderLabel,
  type Language,
  type Translate
} from "../lib/i18n";
import type { Match, Team, TournamentData } from "../lib/types";

interface KnockoutBracketProps {
  compact?: boolean;
  data: TournamentData;
  language: Language;
  t: Translate;
}

export function KnockoutBracket({ compact = false, data, language, t }: KnockoutBracketProps) {
  const matchesByStage = groupKnockoutMatchesByStage(data);
  const teamsById = new Map(data.teams.map((team) => [team.id, team]));
  const stages = compact
    ? knockoutStages.filter((stage) => stage !== "third-place")
    : knockoutStages;

  return (
    <div className={compact ? "knockout-bracket knockout-bracket--compact" : "knockout-bracket"} aria-label="Knockout bracket">
      {stages.map((stage) => (
        <section className="knockout-stage" key={stage}>
          <div className="knockout-stage-header">
            <p className="eyebrow">{t("knockout.bracket")}</p>
            <h2>{getStageLabel(stage, t)}</h2>
          </div>

          <div className="knockout-match-list">
            {matchesByStage[stage].length > 0 ? (
              matchesByStage[stage].slice(0, compact ? 4 : undefined).map((match) => (
                <KnockoutMatchCard
                  key={match.id}
                  language={language}
                  match={match}
                  teamsById={teamsById}
                  t={t}
                />
              ))
            ) : (
              <div className="knockout-empty">{t("knockout.noSlot")}</div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

interface KnockoutMatchCardProps {
  language: Language;
  match: Match;
  teamsById: Map<string, Team>;
  t: Translate;
}

function KnockoutMatchCard({ language, match, teamsById, t }: KnockoutMatchCardProps) {
  const home = getMatchParticipant(match, "home", teamsById);
  const away = getMatchParticipant(match, "away", teamsById);
  const winnerTeamId = getWinnerTeamId(match);
  const hasScore = typeof match.homeScore === "number" && typeof match.awayScore === "number";

  return (
    <article className="knockout-match-card">
      <div className="knockout-match-meta">
        <span className={`match-status-badge match-status-badge--${match.status}`}>
          {getStatusLabel(match.status, t)}
        </span>
        {match.status === "scheduled" ? (
          <span>{formatDateTimeKyiv(match.kickoffUtc, language)}</span>
        ) : null}
      </div>

      <div className="knockout-teams">
        <ParticipantRow
          isWinner={match.status === "finished" && winnerTeamId === home.teamId}
          language={language}
          participant={home}
          score={hasScore ? match.homeScore : undefined}
        />
        <ParticipantRow
          isWinner={match.status === "finished" && winnerTeamId === away.teamId}
          language={language}
          participant={away}
          score={hasScore ? match.awayScore : undefined}
        />
      </div>
    </article>
  );
}

interface ParticipantRowProps {
  isWinner: boolean;
  language: Language;
  participant: ReturnType<typeof getMatchParticipant>;
  score?: number;
}

function ParticipantRow({ isWinner, language, participant, score }: ParticipantRowProps) {
  const className = [
    "knockout-participant",
    participant.isPlaceholder ? "knockout-participant--placeholder" : "",
    isWinner ? "knockout-participant--winner" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <span>
        {participant.isPlaceholder
          ? translatePlaceholderLabel(participant.label, language)
          : participant.label}
      </span>
      {score !== undefined ? <strong>{score}</strong> : null}
    </div>
  );
}
