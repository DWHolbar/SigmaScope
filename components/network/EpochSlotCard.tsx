import { Badge } from "@/components/ui/Badge";

export function EpochSlotCard({
  epoch,
  slot,
  finalized,
  activeValidators,
  source,
}: {
  epoch: number;
  slot: number;
  finalized: boolean;
  activeValidators: number;
  source: "live" | "mock";
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Stat label="Current epoch" value={epoch.toLocaleString()} />
      <Stat label="Current slot" value={slot.toLocaleString()} />
      <Stat
        label="Finality"
        value={finalized ? "Finalized" : "Pending"}
        accent={finalized ? "ok" : "warn"}
      />
      <Stat label="Active validators" value={activeValidators.toLocaleString()} />
      <div className="col-span-2 flex items-center gap-2 md:col-span-4">
        <Badge tone={source === "live" ? "ok" : "muted"}>
          {source === "live" ? "live · beaconcha.in" : "mock fallback"}
        </Badge>
        <span className="text-[11px] text-zinc-500">
          {source === "live"
            ? "Streaming through /api/beacon proxy — revalidates every 30s."
            : "Upstream unavailable from this environment — showing a realistic snapshot."}
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "ok" | "warn";
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div
        className={`mono mt-1 text-xl font-semibold ${
          accent === "ok"
            ? "text-emerald-400"
            : accent === "warn"
              ? "text-amber-300"
              : "text-zinc-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
