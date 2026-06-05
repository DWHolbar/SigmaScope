import mock from "./data/beacon-mock.json";

export type BeaconSource = "live" | "api-enriched" | "estimated";

export type BeaconResponse = {
  source: BeaconSource;
  apiOk: boolean;
  epoch: {
    epoch: number;
    finalizedEpoch: number;
    participationRate: number;
    activeValidators: number;
  };
  slot: {
    slot: number;
    epoch: number;
    slotInEpoch: number;
    secondsIntoSlot: number;
  };
  participationHistory: { epoch: number; rate: number }[];
  fetchedAt: string;
  genesisTime: number;
};

const UPSTREAM = "https://beaconcha.in/api/v1";

export const BEACON_GENESIS = 1606824023;
export const SECONDS_PER_SLOT = 12;
export const SLOTS_PER_EPOCH = 32;

export function deriveSlotEpoch(nowSeconds = Math.floor(Date.now() / 1000)) {
  const elapsed = Math.max(0, nowSeconds - BEACON_GENESIS);
  const slot = Math.floor(elapsed / SECONDS_PER_SLOT);
  const epoch = Math.floor(slot / SLOTS_PER_EPOCH);
  const slotInEpoch = slot % SLOTS_PER_EPOCH;
  const secondsIntoSlot = elapsed % SECONDS_PER_SLOT;
  const finalizedEpoch = Math.max(0, epoch - 2);
  return { slot, epoch, slotInEpoch, secondsIntoSlot, finalizedEpoch };
}

async function safeJson(url: string, timeoutMs = 3500): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "SigmaScope/0.1 (+https://github.com/dwholbar/sigmascope)",
      },
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
  const derived = deriveSlotEpoch();

  const epochData = await safeJson(`${UPSTREAM}/epoch/${derived.epoch}`);
  const apiOk = !!epochData;

  let participationRate = mock.epoch.globalparticipationrate;
  let activeValidators = mock.epoch.validatorscount;
  let participationHistory = mock.participationHistory.map((p, i) => ({
    epoch: derived.epoch - (mock.participationHistory.length - 1 - i),
    rate: p.rate,
  }));

  if (apiOk) {
    if (typeof epochData.globalparticipationrate === "number") {
      participationRate = epochData.globalparticipationrate;
    }
    if (typeof epochData.validatorscount === "number") {
      activeValidators = epochData.validatorscount;
    }

    const histEpochs = await Promise.all(
      [...Array(9)].map((_, i) => safeJson(`${UPSTREAM}/epoch/${derived.epoch - 1 - i}`)),
    );
    const hist = histEpochs
      .filter(Boolean)
      .map((e: any) => ({
        epoch: e.epoch as number,
        rate: e.globalparticipationrate as number,
      }))
      .filter((p) => typeof p.rate === "number")
      .reverse();

    if (hist.length >= 2) {
      participationHistory = [...hist, { epoch: derived.epoch, rate: participationRate }];
    }
  }

  return {
    source: apiOk ? "api-enriched" : "estimated",
    apiOk,
    epoch: {
      epoch: derived.epoch,
      finalizedEpoch: derived.finalizedEpoch,
      participationRate,
      activeValidators,
    },
    slot: {
      slot: derived.slot,
      epoch: derived.epoch,
      slotInEpoch: derived.slotInEpoch,
      secondsIntoSlot: derived.secondsIntoSlot,
    },
    participationHistory,
    fetchedAt: new Date().toISOString(),
    genesisTime: BEACON_GENESIS,
  };
}
