import type { TournamentData } from "../lib/types";

interface AboutPageProps {
  data: TournamentData;
}

export function AboutPage({ data }: AboutPageProps) {
  return (
    <section className="about-page" aria-labelledby="about-title">
      <div className="page-heading">
        <p className="eyebrow">About</p>
        <h1 id="about-title">Fan-made tracker</h1>
        <p className="section-copy">
          This is a simple static World Cup tracker made for fans. All data lives locally in JSON
          and can be updated by hand when match information changes.
        </p>
      </div>

      <div className="about-grid">
        <article className="info-panel">
          <h2>What this is</h2>
          <p>A fan-made static World Cup tracker with local JSON data only.</p>
          <p>No API keys are used anywhere in this app.</p>
          <p>Match data may be updated manually as results come in.</p>
        </article>

        <article className="info-panel">
          <h2>Data status</h2>
          <dl className="about-details">
            <div>
              <dt>Data status</dt>
              <dd>Local JSON source of truth</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{data.tournament.lastUpdated}</dd>
            </div>
            <div>
              <dt>Source note</dt>
              <dd>{data.tournament.note}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
