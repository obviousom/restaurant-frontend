import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { firstAllowedPath } from "@/components/layout/nav";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={firstAllowedPath(user.role)} replace />;
  }

  return <>{children}</>;
}
