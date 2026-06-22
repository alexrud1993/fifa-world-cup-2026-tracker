import { EmptyState } from "../components/EmptyState";
import { GroupTable } from "../components/GroupTable";
import type { TournamentData } from "../lib/types";

interface GroupsPageProps {
  data: TournamentData;
}

export function GroupsPage({ data }: GroupsPageProps) {
  return (
    <section aria-labelledby="groups-title">
      <div className="page-heading">
        <p className="eyebrow">Group stage</p>
        <h1 id="groups-title">Groups</h1>
        <p className="section-copy">
          All groups come from local JSON, and the tables are built from calculated standings.
        </p>
      </div>

      {data.groups.length > 0 ? (
        <div className="groups-layout">
          {data.groups.map((group) => (
            <GroupTable data={data} group={group} key={group.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          message="Add group definitions to the local tournament JSON to show the group tables here."
          title="No groups available"
        />
      )}
    </section>
  );
}
