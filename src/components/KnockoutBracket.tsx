import { formatDateTimeKyiv } from "../lib/dates";
import {
  getMatchParticipant,
  getWinnerTeamId,
  groupKnockoutMatchesByStage,
  knockoutStageLabels,
  knockoutStages
} from "../lib/knockout";
import type { Match, Team, TournamentData } from "../lib/types";

interface KnockoutBracketProps {
  data: TournamentData;
}

export function KnockoutBracket({ data }: KnockoutBracketProps) {
  const matchesByStage = groupKnockoutMatchesByStage(data);
  const teamsById = new Map(data.teams.map((team) => [team.id, team]));

  return (
    <div className="knockout-bracket" aria-label="Knockout bracket">
      {knockoutStages.map((stage) => (
        <section className="knockout-stage" key={stage}>
          <div className="knockout-stage-header">
            <p className="eyebrow">Bracket</p>
            <h2>{knockoutStageLabels[stage]}</h2>
          </div>

          <div className="knockout-match-list">
            {matchesByStage[stage].length > 0 ? (
              matchesByStage[stage].map((match) => (
                <KnockoutMatchCard key={match.id} match={match} teamsById={teamsById} />
              ))
            ) : (
              <div className="knockout-empty">No fixture slot yet</div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

interface KnockoutMatchCardProps {
  match: Match;
  teamsById: Map<string, Team>;
}

function KnockoutMatchCard({ match, teamsById }: KnockoutMatchCardProps) {
  const home = getMatchParticipant(match, "home", teamsById);
  const away = getMatchParticipant(match, "away", teamsById);
  const winnerTeamId = getWinnerTeamId(match);
  const hasScore = typeof match.homeScore === "number" && typeof match.awayScore === "number";

  return (
    <article className="knockout-match-card">
      <div className="knockout-match-meta">
        <span className={`match-status-badge match-status-badge--${match.status}`}>
          {getStatusLabel(match.status)}
        </span>
        {match.status === "scheduled" ? (
          <span>{formatDateTimeKyiv(match.kickoffUtc)}</span>
        ) : null}
      </div>

      <div className="knockout-teams">
        <ParticipantRow
          isWinner={match.status === "finished" && winnerTeamId === home.teamId}
          participant={home}
          score={hasScore ? match.homeScore : undefined}
        />
        <ParticipantRow
          isWinner={match.status === "finished" && winnerTeamId === away.teamId}
          participant={away}
          score={hasScore ? match.awayScore : undefined}
        />
      </div>
    </article>
  );
}

interface ParticipantRowProps {
  isWinner: boolean;
  participant: ReturnType<typeof getMatchParticipant>;
  score?: number;
}

function ParticipantRow({ isWinner, participant, score }: ParticipantRowProps) {
  const className = [
    "knockout-participant",
    participant.isPlaceholder ? "knockout-participant--placeholder" : "",
    isWinner ? "knockout-participant--winner" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <span>{participant.label}</span>
      {score !== undefined ? <strong>{score}</strong> : null}
    </div>
  );
}

function getStatusLabel(status: Match["status"]) {
  if (status === "finished") return "Finished";
  if (status === "live") return "Live";
  if (status === "postponed") return "Postponed";
  if (status === "cancelled") return "Cancelled";
  return "Scheduled";
}
