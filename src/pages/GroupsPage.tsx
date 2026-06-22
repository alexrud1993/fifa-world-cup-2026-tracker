import { EmptyState } from "../components/EmptyState";
import { GroupTable } from "../components/GroupTable";
import type { Translate } from "../lib/i18n";
import type { TournamentData } from "../lib/types";

interface GroupsPageProps {
  data: TournamentData;
  t: Translate;
}

export function GroupsPage({ data, t }: GroupsPageProps) {
  return (
    <section aria-labelledby="groups-title">
      <div className="page-heading">
        <p className="eyebrow">{t("groups.eyebrow")}</p>
        <h1 id="groups-title">{t("groups.title")}</h1>
        <p className="section-copy">{t("groups.copy")}</p>
      </div>

      {data.groups.length > 0 ? (
        <div className="groups-layout">
          {data.groups.map((group) => (
            <GroupTable data={data} group={group} key={group.id} t={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          message={t("groups.emptyMessage")}
          title={t("groups.emptyTitle")}
        />
      )}
    </section>
  );
}
