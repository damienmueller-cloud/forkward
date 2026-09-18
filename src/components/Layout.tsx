import { Link, NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/pantry', label: 'Pantry Lens' },
  { to: '/swaps', label: 'Swaps' },
  { to: '/reflect', label: 'Reflect AI' },
  { to: '/privacy', label: 'Privacy' },
]

export function Layout() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt=""
              className="h-9 w-9 rounded-full object-cover"
              width={36}
              height={36}
            />
            <span className="font-display text-xl text-navy tracking-tight">
              Forkward
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-navy text-lime'
                      : 'text-navy/70 hover:bg-navy/5 hover:text-navy'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/pantry" className="btn-lime text-sm !py-2 !px-3 md:hidden">
            Pantry
          </Link>
        </div>
        <div className="flex gap-1 overflow-x-auto border-t border-navy/5 px-2 py-2 md:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive ? 'bg-violet text-white' : 'bg-warm/40 text-navy/70'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-navy/10 bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-8 w-8 rounded-full" />
              <span className="font-display text-lg">Forkward</span>
            </div>
            <p className="mt-3 text-sm text-cream/70 leading-relaxed">
              Move Forkward with your health. Private pantry recipes, practical
              swaps, and conceptual visual studies — not medical advice.
            </p>
          </div>
          <div>
            <p className="eyebrow text-lime">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="hover:text-lime" to="/pantry">
                  Pantry Lens
                </Link>
              </li>
              <li>
                <Link className="hover:text-lime" to="/swaps">
                  Swaps program
                </Link>
              </li>
              <li>
                <Link className="hover:text-lime" to="/privacy">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-coral">Separate product</p>
            <p className="mt-3 text-sm text-cream/70 leading-relaxed">
              Reflect AI is a standalone visual study studio — not the Forkward
              home hero.
            </p>
            <Link
              to="/reflect"
              className="mt-4 inline-flex text-sm font-bold text-lime hover:underline"
            >
              Open Reflect AI →
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} Forkward · forkward.com.au · Educational
          only · Alcohol disclaimers apply
        </div>
      </footer>
    </>
  )
}
