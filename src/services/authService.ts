import { useMutation } from "@tanstack/react-query";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types/auth";

interface LoginInput {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<LoginResponse>("/auth/token/", input);
      return data;
    },
    onSuccess: (data) => setAuth(data),
  });
}
