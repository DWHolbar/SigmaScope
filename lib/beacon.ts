import mock from "./data/beacon-mock.json";

export type BeaconResponse = {
  source: "live" | "mock";
  epoch: {
    epoch: number;
    finalized: boolean;
    participationRate: number;
    activeValidators: number;
    ts: string;
  };
  slot: {
    slot: number;
    epoch: number;
    proposer: number;
    status: string;
    ts: string;
  };
  participationHistory: { epoch: number; rate: number }[];
  fetchedAt: string;
};

const UPSTREAM = "https://beaconcha.in/api/v1";

async function safeJson(url: string, timeoutMs = 4000): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const j = await res.json();
    return j?.data ?? null;
  } catch {
    return null;
  }
}

export async function getBeaconSnapshot(): Promise<BeaconResponse> {
  const [epochData, slotData] = await Promise.all([
    safeJson(`${UPSTREAM}/epoch/latest`),
    safeJson(`${UPSTREAM}/slot/latest`),
  ]);

  if (!epochData || !slotData) {
    return {
      source: "mock",
      epoch: {
        epoch: mock.epoch.epoch,
        finalized: mock.epoch.finalized,
        participationRate: mock.epoch.globalparticipationrate,
        activeValidators: mock.epoch.validatorscount,
        ts: mock.epoch.ts,
      },
      slot: {
        slot: mock.slot.slot,
        epoch: mock.slot.epoch,
        proposer: mock.slot.proposer,
        status: mock.slot.status,
        ts: mock.slot.ts,
      },
      participationHistory: mock.participationHistory,
      fetchedAt: new Date().toISOString(),
    };
  }

  const currentEpoch: number = epochData.epoch;
  const histEpochs = await Promise.all(
    [...Array(9)].map((_, i) => safeJson(`${UPSTREAM}/epoch/${currentEpoch - 1 - i}`)),
  );

  const participationHistory = [
    ...histEpochs
      .filter(Boolean)
      .map((e: any) => ({
        epoch: e.epoch as number,
        rate: e.globalparticipationrate as number,
      }))
      .reverse(),
    { epoch: currentEpoch, rate: epochData.globalparticipationrate },
  ];

  return {
    source: "live",
    epoch: {
      epoch: currentEpoch,
      finalized: !!epochData.finalized,
      participationRate: epochData.globalparticipationrate,
      activeValidators: epochData.validatorscount,
      ts: epochData.ts ?? new Date().toISOString(),
    },
    slot: {
      slot: slotData.slot,
      epoch: slotData.epoch,
      proposer: slotData.proposer,
      status: String(slotData.status ?? ""),
      ts: slotData.ts ?? new Date().toISOString(),
    },
    participationHistory:
      participationHistory.length >= 2 ? participationHistory : mock.participationHistory,
    fetchedAt: new Date().toISOString(),
  };
}
