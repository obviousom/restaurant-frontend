import { LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/types/auth";

import { NAV_ITEMS } from "./nav";

export default function AppShell() {
  const { user, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[250px] shrink-0 flex-col bg-sidebar px-4 py-6">
        <div className="px-1 pb-5">
          <div className="font-serif text-2xl font-bold leading-tight text-sidebar-foreground">Shri Nyahari</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-accent">Management Suite</div>
        </div>
        <div className="mb-4 h-px bg-sidebar-foreground/15" />
        <nav className="flex flex-1 flex-col gap-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "rounded px-3.5 py-2.5 text-sm font-semibold text-sidebar-foreground/75 transition-colors hover:bg-sidebar-foreground/10",
                  isActive && "bg-primary font-bold text-primary-foreground hover:bg-primary"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-3 border-t border-sidebar-foreground/15 pt-4">
          <div className="mb-2 px-1 text-[10.5px] font-bold uppercase tracking-wide text-sidebar-foreground/50">
            Signed in as
          </div>
          <div className="mb-3 px-1 text-sm text-sidebar-foreground">
            <span className="font-semibold">{user?.username}</span>{" "}
            <span className="text-sidebar-foreground/60">({user ? ROLE_LABELS[user.role] : ""})</span>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded border border-sidebar-foreground/25 px-3 py-2.5 text-left text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-foreground/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto bg-background">
        <div className="heritage-stripe h-1" />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
