import type { ViewId } from "../lib/types";

interface HeaderProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

const navItems: Array<{ id: ViewId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "groups", label: "Groups" },
  { id: "matches", label: "Matches" },
  { id: "knockout", label: "Knockout" },
  { id: "about", label: "About" }
];

export function Header({ activeView, onNavigate }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={() => onNavigate("home")}>
        <span className="brand-mark" aria-hidden="true" />
        <span>
          <strong>WC26</strong>
          <small>Tracker</small>
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
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
