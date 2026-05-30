import { Outlet, useLocation } from 'react-router-dom'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import GreetingHeader from './GreetingHeader'

// Routes that are forms/detail/settings read better in a narrower centered column.
const NARROW = ['/stock-in', '/stock-out', '/opname', '/new', '/edit', '/settings']

export default function AppLayout() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/app'
  const isNarrow = NARROW.some((p) => pathname.includes(p))

  return (
    <div className="min-h-screen bg-background p-0 lg:p-4">
      <div className="mx-auto min-h-screen max-w-[1400px] bg-shell lg:min-h-[calc(100vh-2rem)] lg:rounded-3xl lg:shadow-shell">
        <TopNav />
        <main className="px-4 pb-24 pt-2 lg:px-10 lg:pb-12">
          {isDashboard && <GreetingHeader />}
          <div key={pathname} className={`stagger ${isNarrow ? 'mx-auto max-w-2xl' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
