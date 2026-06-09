import clients from "./data/clients.json";
import type { ProtocolType, StackLang, Threat } from "./threat-models";

export type LocBucket = "<1k" | "1-5k" | "5-15k" | ">15k";
export type Urgency = "Standard" | "Expedited";

export type ScopingInputs = {
  type: ProtocolType;
  stack: StackLang;
  loc: LocBucket;
  integrations: string[];
  upgradeable: boolean;
  urgency: Urgency;
};

export type CalcStep = {
  label: string;
  delta: string;
  rationale: string;
};

export type Proposal = {
  weeksLow: number;
  weeksHigh: number;
  team: string[];
  deliverables: string[];
  comparable: { client: string; note: string } | null;
  caveats: string[];
  calculation: {
    base: { low: number; high: number; label: string };
    steps: CalcStep[];
    weekRate: { low: number; high: number };
    teamSize: number;
    estTotalCostLow: number;
    estTotalCostHigh: number;
  };
};

const WEEKS_BASE: Record<LocBucket, [number, number, string]> = {
  "<1k": [2, 3, "single contract or focused module"],
  "1-5k": [3, 5, "small protocol surface"],
  "5-15k": [6, 9, "full protocol, multiple contracts"],
  ">15k": [10, 14, "phased engagement, fix-review gate"],
};

const PER_ENGINEER_WEEK_RATE: [number, number] = [25_000, 50_000];

function pickComparable(type: ProtocolType): Proposal["comparable"] {
  const match = (clients as { name: string; protocolType: string; engagementHint: string }[]).find(
    (c) => c.protocolType === type,
  );
  if (!match) return null;
  return {
    client: match.name,
    note: match.engagementHint,
  };
}

export function buildProposal(inputs: ScopingInputs, threats: Threat[]): Proposal {
  const [baseLow, baseHigh, baseLabel] = WEEKS_BASE[inputs.loc];
  const steps: CalcStep[] = [];

  let lo = baseLow;
  let hi = baseHigh;

  if (inputs.stack === "Rust" || inputs.stack === "Cairo") {
    lo += 1;
    hi += 2;
    steps.push({
      label: `${inputs.stack} stack`,
      delta: "+1 to +2 wks",
      rationale: `Non-Solidity stack: auditor warm-up, tooling allowance, fewer reusable Slither/Foundry harnesses.`,
    });
  } else if (inputs.stack === "Vyper") {
    lo += 1;
    hi += 1;
    steps.push({
      label: "Vyper stack",
      delta: "+1 wk",
      rationale: "Compiler-version pinning and reproducible-build verification add scope (Curve 2023 precedent).",
    });
  }

  if (inputs.upgradeable) {
    lo += 1;
    hi += 1;
    steps.push({
      label: "Upgradeable contracts",
      delta: "+1 wk",
      rationale: "Storage-layout deltas and privileged-init invariants require a separate review pass (Nomad 2022 precedent).",
    });
  }

  if (inputs.type === "Bridge" || inputs.integrations.includes("Cross-chain messaging")) {
    lo += 2;
    hi += 3;
    steps.push({
      label: "Cross-chain / bridge surface",
      delta: "+2 to +3 wks",
      rationale: "Multi-VM signature paths, guardian-set rotation, and asset-accounting fuzz suite.",
    });
  }

  if (inputs.type === "Layer 2") {
    lo += 2;
    hi += 4;
    steps.push({
      label: "Layer 2 stack",
      delta: "+2 to +4 wks",
      rationale: "Proof-system soundness, sequencer-censorship paths, and force-inclusion exercises require a cryptographer.",
    });
  }

  if (inputs.integrations.includes("Oracle")) {
    lo += 1;
    hi += 1;
    steps.push({
      label: "Oracle integration",
      delta: "+1 wk",
      rationale: "Map every price source end-to-end, TWAP windows, deviation thresholds, fallback handling.",
    });
  }

  if (inputs.integrations.includes("Governance")) {
    lo += 1;
    hi += 1;
    steps.push({
      label: "Governance surface",
      delta: "+1 wk",
      rationale: "Flash-loan-funded voting attacks, proposal-execution timing (Beanstalk 2022 precedent).",
    });
  }

  if (inputs.urgency === "Expedited") {
    const dropLo = Math.min(2, Math.max(0, lo - baseLow));
    const dropHi = Math.min(2, Math.max(0, hi - baseHigh));
    lo = Math.max(baseLow, lo - dropLo);
    hi = Math.max(lo, hi - dropHi);
    steps.push({
      label: "Expedited timeline",
      delta: `-${dropLo} to -${dropHi} wks`,
      rationale: "Parallel auditors compress calendar weeks; engineering-weeks remain similar, expect deeper findings to land late.",
    });
  }

  const team: string[] = ["Lead Auditor", "Senior Auditor"];
  if (inputs.type === "Layer 2" || inputs.type === "Bridge")
    team.push("Cryptography Researcher");
  if (inputs.upgradeable) team.push("Upgrade-Path Reviewer");
  if (inputs.integrations.includes("Oracle")) team.push("Oracle Specialist");
  if (inputs.urgency === "Expedited" && team.length < 4) team.push("Reviewer (parallel pass)");

  const deliverables = [
    "Interim findings report at the midpoint of the engagement",
    "Final audit report with severity-classified findings (Critical, High, Medium, Low, Informational)",
    "Fix-review pass on remediations submitted by the client",
    "Threat-model document covering: " + threats.map((t) => t.category).join(", "),
  ];
  if (inputs.upgradeable) {
    deliverables.push("Upgrade runbook review (storage layout + privileged-init invariants)");
  }
  if (inputs.type === "Bridge" || inputs.integrations.includes("Cross-chain messaging")) {
    deliverables.push("Cross-chain invariant fuzz suite (Echidna or Foundry harness)");
  }
  if (inputs.type === "Layer 2") {
    deliverables.push("Force-inclusion and sequencer-censorship exercise log");
  }

  const caveats: string[] = [];
  if (inputs.urgency === "Expedited")
    caveats.push("Expedited timelines reduce slack for deep invariant work; deeper findings may land late or roll into a follow-up engagement.");
  if (inputs.loc === ">15k")
    caveats.push("Codebases over 15k LOC are typically split into two phases with a fix-review gate between.");
  if (inputs.stack === "Cairo" || inputs.stack === "Rust")
    caveats.push("Non-Solidity stacks require an auditor warm-up week and may have a smaller pool of qualified reviewers.");

  const teamSize = team.length;
  const estTotalCostLow = lo * teamSize * PER_ENGINEER_WEEK_RATE[0];
  const estTotalCostHigh = hi * teamSize * PER_ENGINEER_WEEK_RATE[1];

  return {
    weeksLow: lo,
    weeksHigh: hi,
    team,
    deliverables,
    comparable: pickComparable(inputs.type),
    caveats,
    calculation: {
      base: { low: baseLow, high: baseHigh, label: baseLabel },
      steps,
      weekRate: { low: PER_ENGINEER_WEEK_RATE[0], high: PER_ENGINEER_WEEK_RATE[1] },
      teamSize,
      estTotalCostLow,
      estTotalCostHigh,
    },
  };
}
