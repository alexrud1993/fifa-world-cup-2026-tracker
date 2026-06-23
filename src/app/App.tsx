import { useEffect, useState } from "react";
import { ErrorState } from "../components/ErrorState";
import { Header } from "../components/Header";
import { loadTournamentData } from "../lib/data";
import { formatDateTimeKyiv } from "../lib/dates";
import { useLanguage, type Language, type Translate } from "../lib/i18n";
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
  const { language, setLanguage, t } = useLanguage();
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
      <Header
        activeView={activeView}
        language={language}
        onLanguageChange={setLanguage}
        onNavigate={handleNavigate}
        t={t}
      />
      <main className="page-shell">
        {error ? (
          <ErrorState message={error} title={t("error.title")} />
        ) : null}
        {!error && isLoading ? <div className="state-panel">{t("loading")}</div> : null}
        {data ? renderView(activeView, data, handleNavigate, language, t) : null}
      </main>
      {data ? <Footer language={language} lastUpdated={data.tournament.lastUpdated} t={t} /> : null}
    </div>
  );
}

function renderView(
  activeView: ViewId,
  data: TournamentData,
  onNavigate: (view: ViewId) => void,
  language: Language,
  t: Translate
) {
  if (activeView === "groups") return <GroupsPage data={data} language={language} t={t} />;
  if (activeView === "matches") return <MatchesPage data={data} language={language} t={t} />;
  if (activeView === "knockout") return <KnockoutPage data={data} language={language} t={t} />;
  if (activeView === "about") return <AboutPage data={data} language={language} t={t} />;

  return <HomePage data={data} language={language} onNavigate={onNavigate} t={t} />;
}

function Footer({ language, lastUpdated, t }: { language: Language; lastUpdated: string; t: Translate }) {
  return (
    <footer className="site-footer">
      <div>
        <strong>{t("brand.title")}</strong>
        <p>{t("footer.note")}</p>
      </div>
      <div className="footer-links">
        <span>
          {t("about.lastUpdated")}: {formatDateTimeKyiv(lastUpdated, language)}
        </span>
        <a href="#about">{t("footer.about")}</a>
        <a href="https://github.com/alexrud1993/fifa-world-cup-2026-tracker">
          {t("footer.github")}
        </a>
      </div>
    </footer>
  );
}

export default App;
