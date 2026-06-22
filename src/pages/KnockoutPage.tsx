import { EmptyState } from "../components/EmptyState";
import { KnockoutBracket } from "../components/KnockoutBracket";
import type { TournamentData } from "../lib/types";

interface KnockoutPageProps {
  data: TournamentData;
}

export function KnockoutPage({ data }: KnockoutPageProps) {
  const knockoutMatches = data.matches.filter((match) => match.stage !== "group");

  return (
    <section aria-labelledby="knockout-title">
      <div className="page-heading">
        <p className="eyebrow">Elimination rounds</p>
        <h1 id="knockout-title">Knockout</h1>
        <p className="section-copy">
          Bracket slots are read from local JSON. Automatic filling from group standings can be added later.
        </p>
      </div>

      {knockoutMatches.length > 0 ? (
        <>
          {/* TODO: Fill knockout slots automatically once official advancement rules are modeled. */}
          <KnockoutBracket data={data} />
        </>
      ) : (
        <EmptyState
          message="Add knockout fixtures to the local tournament JSON to show the bracket here."
          title="No knockout matches available"
        />
      )}
    </section>
  );
}
