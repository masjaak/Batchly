import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'

// Forms/detail/settings read better in a narrower centered column.
const NARROW = ['/stock-in', '/stock-out', '/opname', '/new', '/edit', '/settings']

export default function AppLayout() {
  const { pathname } = useLocation()
  const isNarrow = NARROW.some((p) => pathname.includes(p))
  const [drawer, setDrawer] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full bg-shell">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setDrawer(true)} />
        <main className="flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-8">
          <div key={pathname} className={`stagger ${isNarrow ? 'mx-auto max-w-2xl' : 'mx-auto max-w-[1240px]'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
