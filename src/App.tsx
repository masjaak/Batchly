import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import PublicLayout from '@/components/layout/PublicLayout'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import InventoryPage from '@/pages/inventory/InventoryPage'
import IngredientDetailPage from '@/pages/inventory/IngredientDetailPage'
import StockInPage from '@/pages/inventory/StockInPage'
import StockOutPage from '@/pages/inventory/StockOutPage'
import StockOpnamePage from '@/pages/inventory/StockOpnamePage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import SupplierDetailPage from '@/pages/suppliers/SupplierDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/inventory" element={<InventoryPage />} />
          <Route path="/app/inventory/stock-in" element={<StockInPage />} />
          <Route path="/app/inventory/stock-out" element={<StockOutPage />} />
          <Route path="/app/inventory/opname" element={<StockOpnamePage />} />
          <Route path="/app/inventory/:id" element={<IngredientDetailPage />} />
          <Route path="/app/suppliers" element={<SuppliersPage />} />
          <Route path="/app/suppliers/:id" element={<SupplierDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
