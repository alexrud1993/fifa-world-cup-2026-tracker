import { EmptyState } from "../components/EmptyState";
import { GroupTable } from "../components/GroupTable";
import type { Language, Translate } from "../lib/i18n";
import type { TournamentData } from "../lib/types";

interface GroupsPageProps {
  data: TournamentData;
  language: Language;
  t: Translate;
}

export function GroupsPage({ data, language, t }: GroupsPageProps) {
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
            <GroupTable data={data} group={group} key={group.id} language={language} t={t} />
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
