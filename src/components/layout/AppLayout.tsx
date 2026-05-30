import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import DesktopHeader from './DesktopHeader'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden">
          <TopBar />
        </div>
        {/* Desktop header */}
        <div className="hidden lg:block">
          <DesktopHeader />
        </div>
        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">
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
