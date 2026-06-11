"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, GitCommit, Tag, Sparkles, Wrench, ExternalLink, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type NotificationKind = "commit" | "release" | "tag";
type NotificationSource = "sigmascope" | "sigp";

type Notification = {
  id: string;
  source: NotificationSource;
  kind: NotificationKind;
  title: string;
  body: string;
  url: string;
  author: string;
  timestamp: string;
  flair?: "feature" | "fix" | "release" | null;
};

type Feed = {
  items: Notification[];
  fetchedAt: string;
  sources: { sigmascope: "ok" | "unreachable"; sigp: "ok" | "unreachable" };
};

const POLL_MS = 60_000;
const LS_KEY = "sigmascope.notifications.lastReadAt";

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function flairLabel(flair: Notification["flair"]): string | null {
  if (flair === "feature") return "feature";
  if (flair === "fix") return "fix";
  if (flair === "release") return "release";
  return null;
}

function flairTone(flair: Notification["flair"]): "ok" | "accent" | "warn" | "muted" {
  if (flair === "feature") return "accent";
  if (flair === "release") return "ok";
  if (flair === "fix") return "warn";
  return "muted";
}

function kindIcon(n: Notification) {
  if (n.flair === "feature") return Sparkles;
  if (n.flair === "fix") return Wrench;
  if (n.kind === "release" || n.kind === "tag") return Tag;
  return GitCommit;
}

export function NotificationBell() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [open, setOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<string>(() => {
    if (typeof window === "undefined") return new Date(0).toISOString();
    return window.localStorage.getItem(LS_KEY) ?? new Date(0).toISOString();
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) throw new Error("notifications api failed");
        const j: Feed = await res.json();
        if (!cancelled) setFeed(j);
      } catch {
        if (!cancelled && !feed) {
          setFeed({
            items: [],
            fetchedAt: new Date().toISOString(),
            sources: { sigmascope: "unreachable", sigp: "unreachable" },
          });
        }
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // intentionally not in deps; we only want the interval set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (buttonRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = (feed?.items ?? []).filter((n) => n.timestamp > lastReadAt);
  const unreadCount = unread.length;

  function markAllRead() {
    const now = feed?.fetchedAt ?? new Date().toISOString();
    setLastReadAt(now);
    if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, now);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className={`relative grid h-8 w-8 place-items-center rounded-md border transition ${
          open
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
        }`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="mono absolute -right-1 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 flex max-h-[70vh] w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-100">Activity</span>
              {feed?.fetchedAt && (
                <span className="mono text-[10px] text-zinc-500">
                  updated {relativeTime(feed.fetchedAt)}
                </span>
              )}
            </div>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={10} />
              Mark all read
            </button>
          </div>

          {feed?.sources && (feed.sources.sigmascope === "unreachable" || feed.sources.sigp === "unreachable") && (
            <div className="border-b border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[11px] text-zinc-500">
              {feed.sources.sigmascope === "unreachable" && (
                <div>SigmaScope repo feed unreachable.</div>
              )}
              {feed.sources.sigp === "unreachable" && (
                <div>sigp Lighthouse feed unreachable.</div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {!feed ? (
              <div className="grid h-32 place-items-center text-[11px] text-zinc-500">
                Loading activity...
              </div>
            ) : feed.items.length === 0 ? (
              <div className="grid h-32 place-items-center px-4 text-center text-[11px] text-zinc-500">
                No recent activity. Polling every 60 seconds.
              </div>
            ) : (
              <ul className="flex flex-col">
                {feed.items.map((n) => {
                  const isUnread = n.timestamp > lastReadAt;
                  const Icon = kindIcon(n);
                  return (
                    <li key={n.id} className="border-b border-zinc-800/60 last:border-b-0">
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`group flex items-start gap-2 px-3 py-2.5 transition hover:bg-zinc-900/60 ${
                          isUnread ? "bg-accent/[0.04]" : ""
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 text-zinc-500 group-hover:text-accent">
                          <Icon size={12} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {isUnread && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            )}
                            <span className="line-clamp-2 text-[12px] text-zinc-100 group-hover:text-accent">
                              {n.title}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500">
                            <Badge tone={n.source === "sigmascope" ? "accent" : "muted"}>
                              {n.source === "sigmascope" ? "SigmaScope" : "sigp"}
                            </Badge>
                            {flairLabel(n.flair) && (
                              <Badge tone={flairTone(n.flair)}>
                                {flairLabel(n.flair)}
                              </Badge>
                            )}
                            <span>{n.author}</span>
                            <span>&middot;</span>
                            <span>{relativeTime(n.timestamp)}</span>
                          </div>
                        </div>
                        <ExternalLink
                          size={10}
                          className="mt-0.5 shrink-0 text-zinc-700 group-hover:text-accent"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-zinc-800 px-3 py-2 text-[10px] text-zinc-500">
            Polls GitHub every 60s. Edge-cached for the first minute.
          </div>
        </div>
      )}
    </div>
  );
}
