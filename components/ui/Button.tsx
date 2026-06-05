import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-zinc-950 hover:bg-cyan-300 disabled:bg-zinc-700 disabled:text-zinc-500",
  ghost: "bg-transparent text-zinc-300 hover:bg-zinc-900",
  outline:
    "border border-zinc-700 bg-transparent text-zinc-200 hover:border-accent/40 hover:text-accent",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
