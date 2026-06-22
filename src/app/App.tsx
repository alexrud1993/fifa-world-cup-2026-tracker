import { useEffect, useState } from "react";
import { ErrorState } from "../components/ErrorState";
import { Header } from "../components/Header";
import { loadTournamentData } from "../lib/data";
import { GroupsPage } from "../pages/GroupsPage";
import { HomePage } from "../pages/HomePage";
import { KnockoutPage } from "../pages/KnockoutPage";
import { MatchesPage } from "../pages/MatchesPage";
import { AboutPage } from "../pages/AboutPage";
import type { TournamentData, ViewId } from "../lib/types";

const hashToView = (): ViewId => {
  const hash = window.location.hash.replace("#", "");
  return hash === "groups" || hash === "matches" || hash === "knockout" || hash === "about"
    ? hash
    : "home";
};

function App() {
  const [activeView, setActiveView] = useState<ViewId>(hashToView);
  const [data, setData] = useState<TournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNavigate = (view: ViewId) => {
    setActiveView(view);
    const nextHash = `#${view}`;

    if (window.location.hash !== nextHash) {
      window.location.hash = view;
    }
  };

  useEffect(() => {
    const handleHashChange = () => setActiveView(hashToView());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    loadTournamentData()
      .then(setData)
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load tournament data."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="app-shell">
      <Header activeView={activeView} onNavigate={handleNavigate} />
      <main className="page-shell">
        {error ? (
          <ErrorState message={error} title="Data unavailable" />
        ) : null}
        {!error && isLoading ? <div className="state-panel">Loading tournament data...</div> : null}
        {data ? renderView(activeView, data, handleNavigate) : null}
      </main>
    </div>
  );
}

function renderView(
  activeView: ViewId,
  data: TournamentData,
  onNavigate: (view: ViewId) => void
) {
  if (activeView === "groups") return <GroupsPage data={data} />;
  if (activeView === "matches") return <MatchesPage data={data} />;
  if (activeView === "knockout") return <KnockoutPage data={data} />;
  if (activeView === "about") return <AboutPage data={data} />;

  return <HomePage data={data} onNavigate={onNavigate} />;
}

export default App;
