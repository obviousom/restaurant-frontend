import { Navigate, Route, Routes } from "react-router-dom";

import { firstAllowedPath } from "@/components/layout/nav";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import BillingPage from "@/pages/BillingPage";
import CustomersPage from "@/pages/CustomersPage";
import DashboardPage from "@/pages/DashboardPage";
import ExpensesPage from "@/pages/ExpensesPage";
import InventoryPage from "@/pages/InventoryPage";
import KitchenPage from "@/pages/KitchenPage";
import LoginPage from "@/pages/LoginPage";
import MenuPage from "@/pages/MenuPage";
import OrdersPage from "@/pages/OrdersPage";
import PnlPage from "@/pages/PnlPage";
import PurchasesPage from "@/pages/PurchasesPage";
import RecipesPage from "@/pages/RecipesPage";
import SalesAnalyticsPage from "@/pages/SalesAnalyticsPage";
import StaffPage from "@/pages/StaffPage";
import SuppliersPage from "@/pages/SuppliersPage";

import ProtectedRoute from "./ProtectedRoute";

function RoleHome() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={firstAllowedPath(user.role)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pnl"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PnlPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SalesAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CASHIER", "WAITER"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CHEF"]}>
              <KitchenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CHEF"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <PurchasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <RecipesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<RoleHome />} />
      <Route path="*" element={<RoleHome />} />
    </Routes>
  );
}
