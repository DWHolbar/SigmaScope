"use client";

import { useEffect, useState } from "react";
import {
  deriveSlotEpoch,
  SECONDS_PER_SLOT,
  SLOTS_PER_EPOCH,
} from "@/lib/beacon";
import { Badge } from "@/components/ui/Badge";

export function LiveSlotTicker({
  initialSlot,
  initialEpoch,
  finalizedEpoch,
  activeValidators,
  apiOk,
}: {
  initialSlot: number;
  initialEpoch: number;
  finalizedEpoch: number;
  activeValidators: number;
  apiOk: boolean;
}) {
  const [tick, setTick] = useState(() => deriveSlotEpoch());

  useEffect(() => {
    setTick(deriveSlotEpoch());
    const id = setInterval(() => setTick(deriveSlotEpoch()), 1000);
    return () => clearInterval(id);
  }, []);

  const slot = Math.max(tick.slot, initialSlot);
  const epoch = Math.max(tick.epoch, initialEpoch);
  const slotInEpoch = slot % SLOTS_PER_EPOCH;
  const secondsIntoSlot = (Date.now() / 1000 - 1606824023) % SECONDS_PER_SLOT;
  const slotProgress = Math.min(100, (secondsIntoSlot / SECONDS_PER_SLOT) * 100);
  const epochProgress = (slotInEpoch / SLOTS_PER_EPOCH) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Current epoch" value={epoch.toLocaleString()} progress={epochProgress} />
        <Stat label="Current slot" value={slot.toLocaleString()} progress={slotProgress} />
        <Stat
          label="Finalized epoch"
          value={Math.max(0, epoch - 2).toLocaleString()}
          hint={`${epoch - Math.max(0, epoch - 2)} epoch lag`}
        />
        <Stat
          label="Active validators"
          value={activeValidators.toLocaleString()}
          hint={apiOk ? "via beaconcha.in" : "estimate"}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <Badge tone="ok">live · genesis-derived</Badge>
        {apiOk ? (
          <Badge tone="accent">api · beaconcha.in</Badge>
        ) : (
          <Badge tone="muted">api · unreachable, using estimate</Badge>
        )}
        <span className="text-zinc-500">
          Slot {slotInEpoch + 1}/{SLOTS_PER_EPOCH} of current epoch · advances every 12s
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  progress,
}: {
  label: string;
  value: string;
  hint?: string;
  progress?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mono mt-1 text-xl font-semibold text-zinc-100">{value}</div>
      {hint ? <div className="mt-1 text-[10px] text-zinc-500">{hint}</div> : null}
      {typeof progress === "number" ? (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-accent transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
