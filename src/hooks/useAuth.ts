import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return {
    isAuthenticated: Boolean(accessToken && user),
    user,
    logout,
  };
}
