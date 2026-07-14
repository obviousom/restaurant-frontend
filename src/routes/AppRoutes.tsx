import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import BillingPage from "@/pages/BillingPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import KitchenPage from "@/pages/KitchenPage";
import LoginPage from "@/pages/LoginPage";
import MenuPage from "@/pages/MenuPage";
import OrdersPage from "@/pages/OrdersPage";
import PurchasesPage from "@/pages/PurchasesPage";
import RecipesPage from "@/pages/RecipesPage";
import SuppliersPage from "@/pages/SuppliersPage";

import ProtectedRoute from "./ProtectedRoute";

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
        <Route path="/dashboard" element={<DashboardPage />} />

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

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
