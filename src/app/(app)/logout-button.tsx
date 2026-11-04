"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="font-bold text-ink underline-offset-4 hover:underline"
      onClick={async () => {
        await api("/api/auth/logout", "POST");
        router.replace("/login");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
