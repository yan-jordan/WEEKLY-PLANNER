"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/api-client";
import { Button, Field } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = { email: String(form.get("email")), password: String(form.get("password")) };
    const name = String(form.get("name") ?? "").trim();
    if (isSignup && name) body.name = name;

    setPending(true);
    setError(null);
    setFields({});
    try {
      await api(`/api/auth/${mode}`, "POST", body);
      router.replace("/week");
      router.refresh();
    } catch (err) {
      if (err instanceof ClientApiError) {
        setError(err.message);
        setFields(err.fields);
      } else setError("Couldn't reach the server. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {isSignup && <Field label="Name (optional)" name="name" autoComplete="name" maxLength={60} />}
      <Field label="Email" name="email" type="email" autoComplete="email" required error={fields.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        required
        minLength={isSignup ? 8 : undefined}
        error={fields.password}
      />
      {isSignup && <p className="-mt-3 text-sm text-muted">At least 8 characters.</p>}
      {error && !Object.keys(fields).length && (
        <p role="alert" className="rounded-lg bg-hard-soft px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <Button variant="primary" type="submit" disabled={pending} className="mt-2 min-h-12 text-base">
        {pending ? "One moment…" : isSignup ? "Create account" : "Log in"}
      </Button>
      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link className="font-bold text-brand underline-offset-4 hover:underline" href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
