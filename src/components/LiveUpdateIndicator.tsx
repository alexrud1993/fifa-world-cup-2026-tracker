import { formatDateTimeKyiv } from "../lib/dates";
import type { Language, Translate } from "../lib/i18n";
import type { Match } from "../lib/types";

interface LiveUpdateIndicatorProps {
  language: Language;
  lastUpdated: string;
  matches: Match[];
  t: Translate;
}

export function LiveUpdateIndicator({ language, lastUpdated, matches, t }: LiveUpdateIndicatorProps) {
  const liveCount = matches.filter((match) => match.status === "live").length;
  const isLive = liveCount > 0;

  return (
    <aside className={`live-update-indicator ${isLive ? "live-update-indicator--live" : "live-update-indicator--hourly"}`}>
      <div className="live-update-topline">
        <span className="live-update-dot" aria-hidden="true" />
        <span>{isLive ? t("liveUpdate.liveTitle") : t("liveUpdate.hourlyTitle")}</span>
      </div>
      <strong>
        {isLive ? `${liveCount} ${t("liveUpdate.liveMatches")}` : t("liveUpdate.standby")}
      </strong>
      <p>{isLive ? t("liveUpdate.liveCadence") : t("liveUpdate.hourlyCadence")}</p>
      <small>
        {t("liveUpdate.synced")}: {formatDateTimeKyiv(lastUpdated, language)}
      </small>
    </aside>
  );
}
