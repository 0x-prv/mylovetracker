import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", emoji: "🏠", end: true },
  { to: "/exercises", label: "Exercises", emoji: "💪", end: false },
  { to: "/food", label: "Food", emoji: "🍽️", end: false },
  { to: "/food/plan", label: "Plan", emoji: "📋", end: false },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-sm"
      : "text-stone-600 hover:bg-purple-100 hover:text-purple-900 dark:text-stone-400 dark:hover:bg-purple-950 dark:hover:text-purple-200",
  ].join(" ");

const bottomNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors",
    isActive
      ? "text-purple-700 dark:text-purple-300"
      : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300",
  ].join(" ");

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 border-b border-stone-200 bg-stone-100/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-stone-800 dark:bg-stone-950/90">
        <div className="flex items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-lg font-bold text-white shadow-sm">
              L
            </span>
            <span className="text-lg font-bold tracking-tight">LaeTrack</span>
          </NavLink>
          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 py-6 pb-24 sm:pb-6">
        <Outlet />
      </main>

      <footer className="hidden border-t border-stone-200 py-4 text-center text-xs text-stone-500 sm:block dark:border-stone-800 dark:text-stone-400">
        Exercise data &amp; illustrations by Bryl Lim ·{" "}
        <a
          href="https://bryllim.com"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-stone-400 underline-offset-2 hover:text-purple-600"
        >
          CC BY-SA 4.0
        </a>
      </footer>

      {/* Mobile bottom nav (attribution moves here on small screens) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-purple-100 bg-white/95 backdrop-blur sm:hidden dark:border-stone-800 dark:bg-stone-950/95">
        <nav className="mx-auto flex max-w-6xl items-stretch gap-1 px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={bottomNavClass}
            >
              <span className="text-lg leading-none" aria-hidden>
                {item.emoji}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="px-4 pb-[max(0.375rem,env(safe-area-inset-bottom))] text-center text-[10px] leading-tight text-stone-400 dark:text-stone-500">
          Exercise data &amp; illustrations by Bryl Lim ·{" "}
          <a
            href="https://bryllim.com"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-stone-400 underline-offset-2"
          >
            CC BY-SA 4.0
          </a>
        </p>
      </div>
    </div>
  );
}
