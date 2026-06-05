"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import diversity from "@/lib/data/client-diversity.json";

const COLORS: Record<string, string> = {
  Lighthouse: "#22d3ee",
  Prysm: "#52525b",
  Teku: "#3f3f46",
  Nimbus: "#27272a",
  Lodestar: "#18181b",
};

export function ClientDiversityChart() {
  const data = diversity.clients.map((c) => ({ name: c.name, value: c.share }));
  const lighthouse = diversity.clients.find((c) => c.name === "Lighthouse")!;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
              stroke="#0a0a0a"
              strokeWidth={2}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={COLORS[d.name] ?? "#3f3f46"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => `${v.toFixed(1)}%`}
            />
          </PieChart>
        </ResponsiveContainer>
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
          Lighthouse · {lighthouse.team}. Snapshot {diversity.updatedAt} · {diversity.source}.
        </p>
      </div>
    </div>
  );
}
