import { EmptyState } from "../components/EmptyState";
import { KnockoutBracket } from "../components/KnockoutBracket";
import type { Translate } from "../lib/i18n";
import type { TournamentData } from "../lib/types";

interface KnockoutPageProps {
  data: TournamentData;
  t: Translate;
}

export function KnockoutPage({ data, t }: KnockoutPageProps) {
  const knockoutMatches = data.matches.filter((match) => match.stage !== "group");

  return (
    <section aria-labelledby="knockout-title">
      <div className="page-heading">
        <p className="eyebrow">{t("knockout.eyebrow")}</p>
        <h1 id="knockout-title">{t("knockout.title")}</h1>
        <p className="section-copy">{t("knockout.copy")}</p>
      </div>

      {knockoutMatches.length > 0 ? (
        <>
          {/* TODO: Fill knockout slots automatically once official advancement rules are modeled. */}
          <KnockoutBracket data={data} t={t} />
        </>
      ) : (
        <EmptyState
          message={t("knockout.emptyMessage")}
          title={t("knockout.emptyTitle")}
        />
      )}
    </section>
  );
}
