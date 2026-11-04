import type { Metadata } from "next";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getAvailability } from "@/server/users";
import { AvailabilityForm } from "./availability-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const availability = await getAvailability(await requireCurrentUserId());
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl font-bold tracking-tight">Your available hours</h1>
      <p className="mt-2 text-muted">
        How many hours you can spend on planned tasks each day. The week view rules one line per hour, and Plan my week never
        books more than this.
      </p>
      <AvailabilityForm initial={availability} />
    </div>
  );
}
