"use client";

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
  const W = 320;
  const H = 60;
  const padding = 4;

  const rates = history.map((h) => h.rate);
  const min = rates.length ? Math.min(...rates) : rate;
  const max = rates.length ? Math.max(...rates) : rate;
  const span = Math.max(0.001, max - min);

  const points = history.map((h, i) => {
    const x =
      history.length <= 1
        ? W / 2
        : padding + (i / (history.length - 1)) * (W - padding * 2);
    const y = padding + (1 - (h.rate - min) / span) * (H - padding * 2);
    return { x, y, epoch: h.epoch, rate: h.rate };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    points.length > 1
      ? `${path} L${points[points.length - 1].x.toFixed(1)},${H} L${points[0].x.toFixed(1)},${H} Z`
      : "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="mono text-4xl font-semibold text-zinc-100">{pct}%</div>
          <div className="mt-1 text-xs text-zinc-500">
            global validator participation, last {history.length} epochs
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-xs text-emerald-400">healthy &ge; 99.0%</div>
          <div className="mono text-[10px] text-zinc-500">
            {apiOk ? "beaconcha.in" : "estimate"}
          </div>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-20 w-full"
        role="img"
        aria-label="Validator participation sparkline"
      >
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#spark-fill)" />}
        <path d={path} stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.epoch} cx={p.x} cy={p.y} r="2" fill="#22d3ee">
            <title>
              epoch {p.epoch}: {(p.rate * 100).toFixed(2)}%
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-zinc-500">
        <span className="mono">epoch {history[0]?.epoch ?? ""}</span>
        <span className="mono">epoch {history[history.length - 1]?.epoch ?? ""}</span>
      </div>
    </div>
  );
}
