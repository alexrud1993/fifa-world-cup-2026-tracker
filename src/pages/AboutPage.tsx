import type { Translate } from "../lib/i18n";
import type { TournamentData } from "../lib/types";

interface AboutPageProps {
  data: TournamentData;
  t: Translate;
}

export function AboutPage({ data, t }: AboutPageProps) {
  return (
    <section className="about-page" aria-labelledby="about-title">
      <div className="page-heading">
        <p className="eyebrow">{t("about.eyebrow")}</p>
        <h1 id="about-title">{t("about.title")}</h1>
        <p className="section-copy">{t("about.copy")}</p>
      </div>

      <div className="about-grid">
        <article className="info-panel">
          <h2>{t("about.what")}</h2>
          <p>{t("about.whatBody")}</p>
          <p>{t("about.noKeys")}</p>
          <p>{t("about.manual")}</p>
        </article>

        <article className="info-panel">
          <h2>{t("about.dataStatus")}</h2>
          <dl className="about-details">
            <div>
              <dt>{t("about.dataStatus")}</dt>
              <dd>{t("about.localJson")}</dd>
            </div>
            <div>
              <dt>{t("about.lastUpdated")}</dt>
              <dd>{data.tournament.lastUpdated}</dd>
            </div>
            <div>
              <dt>{t("about.sourceNote")}</dt>
              <dd>{data.tournament.note}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
