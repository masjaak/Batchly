import { Outlet, useLocation } from 'react-router-dom'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import GreetingHeader from './GreetingHeader'

export default function AppLayout() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/app'

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 lg:px-8 lg:pb-10">
        {isDashboard && <GreetingHeader />}
        <Outlet />
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
