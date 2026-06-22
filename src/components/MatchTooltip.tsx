import type { Match } from "../lib/types";
import { formatDateKyiv, formatTimeKyiv, formatTimeUtc } from "../lib/dates";
import type { Translate } from "../lib/i18n";

interface MatchTooltipProps {
  match: Match;
  groupLabel?: string | null;
  stageLabel: string;
  t: Translate;
}

export function MatchTooltip({ match, groupLabel, stageLabel, t }: MatchTooltipProps) {
  return (
    <div className="match-tooltip" role="dialog" aria-label="Match details">
      <dl className="match-tooltip-grid">
        <div>
          <dt>{t("matches.date")}</dt>
          <dd>{formatDateKyiv(match.kickoffUtc)}</dd>
        </div>
        <div>
          <dt>{t("matches.kyivTime")}</dt>
          <dd>{formatTimeKyiv(match.kickoffUtc)}</dd>
        </div>
        <div>
          <dt>{t("matches.utcTime")}</dt>
          <dd>{formatTimeUtc(match.kickoffUtc)}</dd>
        </div>
        <div>
          <dt>{t("matches.stage")}</dt>
          <dd>{stageLabel}</dd>
        </div>
        {groupLabel ? (
          <div>
            <dt>{t("matches.group")}</dt>
            <dd>{groupLabel}</dd>
          </div>
        ) : null}
        {match.venue ? (
          <div>
            <dt>{t("matches.venue")}</dt>
            <dd>{match.venue}</dd>
          </div>
        ) : null}
        {match.city ? (
          <div>
            <dt>{t("matches.city")}</dt>
            <dd>{match.city}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
