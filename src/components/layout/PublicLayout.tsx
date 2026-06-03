import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-pink opacity-30 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-lavender opacity-40 blur-3xl" />
        <div className="absolute left-1/3 bottom-1/4 h-72 w-72 rounded-full bg-yellow opacity-20 blur-3xl" />
      </div>
      <Outlet />
    </div>
  )
}
