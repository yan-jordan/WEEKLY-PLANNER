import type { Metadata } from "next";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tight">Plan your first week</h1>
      <AuthForm mode="signup" />
    </>
  );
}
