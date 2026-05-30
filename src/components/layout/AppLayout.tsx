import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { LayoutGrid, Package, Factory, BookOpen, ShoppingCart, Wallet, Settings } from 'lucide-react'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import GreetingHeader from './GreetingHeader'

const rail = [
  { to: '/app', icon: LayoutGrid, end: true },
  { to: '/app/inventory', icon: Package },
  { to: '/app/production', icon: Factory },
  { to: '/app/recipes', icon: BookOpen },
  { to: '/app/sales', icon: ShoppingCart },
  { to: '/app/expenses', icon: Wallet },
  { to: '/app/settings', icon: Settings },
]

export default function AppLayout() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/app'

  return (
    <div className="min-h-screen bg-background p-0 lg:p-4">
      <div className="mx-auto min-h-screen max-w-[1400px] bg-shell lg:min-h-[calc(100vh-2rem)] lg:rounded-3xl lg:shadow-shell">
        <TopNav />
        <div className="flex">
          {/* Left icon rail (desktop) */}
          <div className="hidden w-16 shrink-0 flex-col items-center gap-2 py-6 lg:flex">
            {rail.map(({ to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    isActive ? 'bg-ink text-white' : 'text-secondary hover:bg-surface-muted hover:text-ink'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
              </NavLink>
            ))}
          </div>

          {/* Main */}
          <main className="min-w-0 flex-1 px-4 pb-24 pt-2 lg:px-8 lg:pb-10">
            {isDashboard && <GreetingHeader />}
            <Outlet />
          </main>
        </div>
      </div>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
