"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Map,
  ClipboardList,
  ShieldAlert,
  Github,
  PenTool,
} from "lucide-react";

const links = [
  { href: "/", label: "Pulse", icon: Activity },
  { href: "/blueprint", label: "Blueprint", icon: Map },
  { href: "/scoping", label: "Scoping", icon: ClipboardList },
  { href: "/intel", label: "Intel", icon: ShieldAlert },
  { href: "/github", label: "GitHub", icon: Github },
  { href: "/studio", label: "Studio", icon: PenTool },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-accent/30 bg-accent/10 text-accent">
            <span className="mono text-lg font-semibold leading-none">Σ</span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">SigmaScope</span>
            <span className="mono hidden text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:inline">
              web3 · security · hub
            </span>
          </span>
        </Link>

        <nav className="scroll-hide flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition lg:gap-2 lg:px-3 ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
