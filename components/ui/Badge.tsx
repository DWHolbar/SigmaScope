import { ReactNode } from "react";

type Tone = "default" | "accent" | "warn" | "danger" | "ok" | "muted";

const toneClasses: Record<Tone, string> = {
  default: "bg-zinc-800/80 text-zinc-200 border-zinc-700",
  accent: "bg-accent/10 text-accent border-accent/30",
  warn: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  danger: "bg-red-500/10 text-red-300 border-red-500/30",
  ok: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  muted: "bg-zinc-900 text-zinc-400 border-zinc-800",
};

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
