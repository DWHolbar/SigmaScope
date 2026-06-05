import updates from "@/lib/data/eth-updates.json";

export function LighthouseHighlights() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {updates.lighthouseConcepts.map((c) => (
        <div key={c.title} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-medium text-zinc-300">{c.title}</div>
            <div className="mono text-[11px] text-accent">{c.value}</div>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">{c.blurb}</p>
        </div>
      ))}
    </div>
  );
}
