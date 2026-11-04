import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/current-user";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUserId()) redirect("/week");
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-10 font-display text-2xl font-bold tracking-tight">
        Chinesh
      </Link>
      {children}
    </main>
  );
}
