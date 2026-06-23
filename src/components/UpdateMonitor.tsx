import { formatDateTimeKyiv } from "../lib/dates";
import type { Language, Translate } from "../lib/i18n";
import type { Match } from "../lib/types";

type UpdateMonitorStatus = "waiting" | "syncing" | "updated" | "failed" | "live";

interface UpdateMonitorProps {
  language: Language;
  lastUpdated: string;
  matches: Match[];
  status?: UpdateMonitorStatus;
  t: Translate;
}

export function UpdateMonitor({ language, lastUpdated, matches, status, t }: UpdateMonitorProps) {
  const liveCount = matches.filter((match) => match.status === "live").length;
  const monitorStatus: UpdateMonitorStatus = status ?? (liveCount > 0 ? "live" : "waiting");
  const isLive = monitorStatus === "live";
  const statusLabelKey = `updateMonitor.status.${monitorStatus}` as Parameters<Translate>[0];

  return (
    <aside className={`update-monitor update-monitor--${monitorStatus}`}>
      <div className="update-monitor-topline">
        <span className="update-monitor-status-dot" aria-hidden="true" />
        <span>{t("updateMonitor.title")}</span>
      </div>

      <div className="update-monitor-body">
        <div className="update-monitor-copy">
          <strong>{t(statusLabelKey)}</strong>
          <p>{isLive ? t("updateMonitor.liveCadence") : t("updateMonitor.hourlyCadence")}</p>
        </div>

        <div className="update-ball-stage" aria-hidden="true">
          <span className="update-ball-shadow" />
          <span className="update-football">
            <span className="football-panel football-panel--center" />
            <span className="football-panel football-panel--top" />
            <span className="football-panel football-panel--right" />
            <span className="football-panel football-panel--bottom" />
            <span className="football-panel football-panel--left" />
          </span>
        </div>
      </div>

      <dl className="update-monitor-lines">
        <div>
          <dt>{t("updateMonitor.betweenMatches")}</dt>
          <dd>{t("updateMonitor.hourly")}</dd>
        </div>
        <div>
          <dt>{t("updateMonitor.synced")}</dt>
          <dd>{formatDateTimeKyiv(lastUpdated, language)}</dd>
        </div>
      </dl>

      <div className="update-monitor-chips" aria-label={t("updateMonitor.title")}>
        <span>{t("updateMonitor.localSnapshot")}</span>
        <span>{t("updateMonitor.publicRefresh")}</span>
        <span>{t("updateMonitor.noApiKeys")}</span>
      </div>
    </aside>
  );
}
