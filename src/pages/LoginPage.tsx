import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";

import { firstAllowedPath } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLogin } from "@/services/authService";
import { ROLE_LABELS, type Role } from "@/types/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_PASSWORD = "demopass123";
const DEMO_ACCOUNTS: { username: string; role: Role }[] = [
  { username: "admin", role: "ADMIN" },
  { username: "manager1", role: "MANAGER" },
  { username: "cashier1", role: "CASHIER" },
  { username: "waiter1", role: "WAITER" },
  { username: "chef1", role: "CHEF" },
];

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated && user) {
    return <Navigate to={firstAllowedPath(user.role)} replace />;
  }

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: (data) => navigate(firstAllowedPath(data.user.role)),
    });
  };

  const loginAsDemo = (username: string) => {
    login.mutate(
      { username, password: DEMO_PASSWORD },
      { onSuccess: (data) => navigate(firstAllowedPath(data.user.role)) }
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="heritage-stripe absolute inset-x-0 top-0 h-1.5" />
      <Card className="w-full max-w-[420px] rounded shadow-2xl">
        <CardContent className="p-10 pt-11">
          <div className="mb-7 text-center">
            <div className="mb-1.5 text-[15px] uppercase tracking-[3px] text-accent">
              Est. Management Suite
            </div>
            <div className="font-serif text-4xl font-bold leading-tight text-primary">Shri Nyahari</div>
            <div className="mt-0.5 font-serif text-lg italic text-muted-foreground">
              Restaurant &amp; Kitchen
            </div>
          </div>
          <div className="mb-6 h-px bg-border" />
          <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="manager@shrinyahari.in"
                className="rounded-sm border-border bg-background"
                {...register("username")}
              />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="rounded-sm border-border bg-background"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {login.isError && <p className="text-sm text-destructive">Invalid username or password.</p>}
            <Button
              type="submit"
              className="w-full rounded-sm bg-primary py-5 font-bold tracking-wide text-primary-foreground hover:bg-primary/90"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mb-3 mt-6 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Quick demo access
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.username}
                type="button"
                onClick={() => loginAsDemo(d.username)}
                disabled={login.isPending}
                className="rounded-full border border-border bg-background px-3.5 py-1.5 text-[12.5px] font-semibold text-primary hover:bg-secondary disabled:opacity-50"
              >
                {ROLE_LABELS[d.role]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
