import type { Metadata } from "next";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tight">Welcome back</h1>
      <AuthForm mode="login" />
    </>
  );
}
