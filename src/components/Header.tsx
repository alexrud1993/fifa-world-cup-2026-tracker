import type { Language, Translate } from "../lib/i18n";
import type { ViewId } from "../lib/types";

interface HeaderProps {
  activeView: ViewId;
  language: Language;
  onNavigate: (view: ViewId) => void;
  onLanguageChange: (language: Language) => void;
  t: Translate;
}

const navItems: Array<{ id: ViewId; labelKey: Parameters<Translate>[0] }> = [
  { id: "home", labelKey: "nav.home" },
  { id: "groups", labelKey: "nav.groups" },
  { id: "matches", labelKey: "nav.matches" },
  { id: "knockout", labelKey: "nav.knockout" },
  { id: "about", labelKey: "nav.about" }
];

export function Header({ activeView, language, onNavigate, onLanguageChange, t }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href="#home" onClick={() => onNavigate("home")}>
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>{t("brand.title")}</strong>
            <small>WC26</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              className={activeView === item.id ? "active" : undefined}
              href={`#${item.id}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>

        <div className="language-switcher" aria-label="Language switcher">
          {(["uk", "en"] as const).map((item) => (
            <button
              aria-pressed={language === item}
              className={language === item ? "language-button active" : "language-button"}
              key={item}
              onClick={() => onLanguageChange(item)}
              type="button"
            >
              {item === "uk" ? "UA" : "EN"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
