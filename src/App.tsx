import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth, useAuthStore } from '@/hooks/useAuth'
import PublicLayout from '@/components/layout/PublicLayout'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import InventoryPage from '@/pages/inventory/InventoryPage'
import IngredientDetailPage from '@/pages/inventory/IngredientDetailPage'
import IngredientFormPage from '@/pages/inventory/IngredientFormPage'
import StockInPage from '@/pages/inventory/StockInPage'
import StockOutPage from '@/pages/inventory/StockOutPage'
import StockOpnamePage from '@/pages/inventory/StockOpnamePage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import SupplierDetailPage from '@/pages/suppliers/SupplierDetailPage'
import RecipesPage from '@/pages/recipes/RecipesPage'
import RecipeDetailPage from '@/pages/recipes/RecipeDetailPage'
import ProductionPage from '@/pages/production/ProductionPage'
import NewBatchPage from '@/pages/production/NewBatchPage'
import BatchDetailPage from '@/pages/production/BatchDetailPage'
import ProductsPage from '@/pages/products/ProductsPage'
import ProductDetailPage from '@/pages/products/ProductDetailPage'
import SalesPage from '@/pages/sales/SalesPage'
import SettingsPage from '@/pages/settings/SettingsPage'

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
          <Route path="/app/inventory/:id/edit" element={<IngredientFormPage />} />
          <Route path="/app/inventory/new" element={<IngredientFormPage />} />
          <Route path="/app/suppliers" element={<SuppliersPage />} />
          <Route path="/app/suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="/app/production" element={<ProductionPage />} />
          <Route path="/app/production/new" element={<NewBatchPage />} />
          <Route path="/app/production/:id" element={<BatchDetailPage />} />
          <Route path="/app/recipes" element={<RecipesPage />} />
          <Route path="/app/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/app/products" element={<ProductsPage />} />
          <Route path="/app/products/:id" element={<ProductDetailPage />} />
          <Route path="/app/sales" element={<SalesPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    useAuthStore.getState().initialize()
  }, [])

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
