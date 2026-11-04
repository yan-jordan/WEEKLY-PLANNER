import Link from "next/link";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getUser } from "@/server/users";
import { LogoutButton } from "./logout-button";
import { NavLink } from "./nav-link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser(await requireCurrentUserId());
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/week" className="font-display text-xl font-bold tracking-tight">
            Chinesh
          </Link>
          <div className="flex gap-1">
            <NavLink href="/week">Week</NavLink>
            <NavLink href="/insights">Insights</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm text-muted">
            <span className="hidden sm:inline">{user.name ?? user.email}</span>
            <LogoutButton />
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
