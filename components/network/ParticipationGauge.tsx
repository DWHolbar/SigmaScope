"use client";

import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

export function ParticipationGauge({
  rate,
  history,
  apiOk,
}: {
  rate: number;
  history: { epoch: number; rate: number }[];
  apiOk: boolean;
}) {
  const pct = (rate * 100).toFixed(2);
  const min = history.length ? Math.min(...history.map((h) => h.rate)) - 0.001 : rate - 0.01;
  const max = history.length ? Math.max(...history.map((h) => h.rate)) + 0.001 : rate + 0.01;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="mono text-4xl font-semibold text-zinc-100">{pct}%</div>
          <div className="mt-1 text-xs text-zinc-500">
            global validator participation · last {history.length} epochs
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-xs text-emerald-400">healthy ≥ 99.0%</div>
          <div className="mono text-[10px] text-zinc-500">
            {apiOk ? "beaconcha.in" : "estimate"}
          </div>
        </div>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <YAxis domain={[min, max]} hide />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 11,
              }}
              labelFormatter={(_, p) => (p[0] ? `epoch ${p[0].payload.epoch}` : "")}
              formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, "participation"]}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
