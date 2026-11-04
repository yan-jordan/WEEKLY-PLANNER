import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" | "danger" };

export function Button({ variant = "quiet", className = "", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-brand text-brand-ink hover:brightness-110",
    quiet: "border border-line bg-surface text-ink hover:border-muted",
    danger: "border border-line bg-surface text-danger hover:border-danger",
  }[variant];
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      <input
        className="min-h-11 rounded-lg border border-line bg-surface px-3 text-base text-ink aria-invalid:border-danger"
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}

/** Complexity 1-5 shown as filled pips, so it can be read without relying on color. */
export function Pips({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Complexity ${value} of ${max}`} role="img">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < value ? (value >= 4 ? "bg-hard" : "bg-ink") : "bg-line"}`} />
      ))}
    </span>
  );
}
