import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user?.first_name || user?.username}</h2>
        <p className="text-muted-foreground">
          Full charts and KPIs land in Phase 5 — this is the Phase 1 placeholder home screen.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your role</CardTitle>
          <CardDescription>Navigation on the left is filtered to what your role can access.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Signed in as <strong>{user?.username}</strong> ({user?.role})
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
