"use client";

import diversity from "@/lib/data/client-diversity.json";

const COLORS: Record<string, string> = {
  Lighthouse: "#22d3ee",
  Prysm: "#71717a",
  Teku: "#52525b",
  Nimbus: "#3f3f46",
  Lodestar: "#27272a",
};

const SIZE = 200;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export function ClientDiversityChart() {
  const total = diversity.clients.reduce((acc, c) => acc + c.share, 0);
  let offset = 0;
  const slices = diversity.clients.map((c) => {
    const length = (c.share / total) * CIRC;
    const slice = {
      name: c.name,
      color: COLORS[c.name] ?? "#3f3f46",
      length,
      offset,
      share: c.share,
    };
    offset += length;
    return slice;
  });

  const lighthouse = diversity.clients.find((c) => c.name === "Lighthouse")!;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="relative flex h-56 items-center justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          role="img"
          aria-label="Consensus client diversity donut chart"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#18181b"
            strokeWidth={STROKE}
          />
          {slices.map((s) => (
            <circle
              key={s.name}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${s.length} ${CIRC - s.length}`}
              strokeDashoffset={-s.offset}
              className="transition-all"
            />
          ))}
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="mono text-2xl font-semibold text-accent">
            {lighthouse.share.toFixed(1)}%
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            Lighthouse
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <div className="mb-1 text-xs uppercase tracking-widest text-zinc-500">
          Consensus client share
        </div>
        {diversity.clients.map((c) => (
          <div
            key={c.name}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
              c.name === "Lighthouse"
                ? "border-accent/30 bg-accent/10"
                : "border-zinc-800 bg-zinc-900/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: COLORS[c.name] ?? "#3f3f46" }}
              />
              <span className={c.name === "Lighthouse" ? "text-accent" : "text-zinc-200"}>
                {c.name}
              </span>
              <span className="mono text-[10px] text-zinc-500">{c.language}</span>
            </div>
            <span className="mono text-sm">{c.share.toFixed(1)}%</span>
          </div>
        ))}
        <p className="mt-1 text-[11px] text-zinc-500">
          Lighthouse, built by {lighthouse.team}. Snapshot {diversity.updatedAt}, {diversity.source}.
        </p>
      </div>
    </div>
  );
}
