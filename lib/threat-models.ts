export type ProtocolType = "DeFi" | "NFT" | "Infrastructure" | "Layer 2" | "Bridge";
export type StackLang = "Solidity" | "Vyper" | "Rust" | "Cairo";

export type Threat = {
  vector: string;
  category: string;
  why: string;
};

const SHARED_EVM: Threat[] = [
  {
    vector: "Reentrancy on external calls",
    category: "Reentrancy",
    why: "External calls before state mutation are the #1 cause of historical drains (DAO 2016, Cream 2021).",
  },
  {
    vector: "Privileged-role compromise",
    category: "Access Control",
    why: "An EOA owner without a timelock is one phishing email away from a $100M event (BadgerDAO, Ronin).",
  },
];

const THREATS: Record<ProtocolType, Threat[]> = {
  DeFi: [
    ...SHARED_EVM,
    {
      vector: "Oracle manipulation",
      category: "Oracle",
      why: "Spot DEX prices, share-price-of-yield-vaults, and TWAP windows are routinely game-able (bZx, Cream).",
    },
    {
      vector: "Flash-loan composability",
      category: "Flash Loan",
      why: "Atomic borrow → manipulate → repay sequences invalidate naive single-tx invariants.",
    },
    {
      vector: "Liquidation / health-check bypass",
      category: "Invariant",
      why: "Functions that mutate balances outside the standard health check (Euler donateToReserves) silently break solvency.",
    },
  ],
  NFT: [
    ...SHARED_EVM,
    {
      vector: "Mint authorization & allowlist drift",
      category: "Access Control",
      why: "Merkle allowlists with mutable roots, and per-address mint caps that ignore approvals, are common money leaks.",
    },
    {
      vector: "Royalty enforcement / marketplace assumptions",
      category: "Economic",
      why: "Royalty bypass via wrappers (Sudoswap-style) erodes the revenue model audits are asked to certify.",
    },
    {
      vector: "Signature replay across chains",
      category: "Signature",
      why: "EIP-712 typed data without chainId/contract binding is replayable on every fork.",
    },
  ],
  Infrastructure: [
    ...SHARED_EVM,
    {
      vector: "Upgrade & initialization safety",
      category: "Upgradeability",
      why: "Uninitialized libraries (Parity) and zero-default storage on upgrade (Nomad) are systemic.",
    },
    {
      vector: "Oracle / message-passing trust path",
      category: "Oracle",
      why: "For oracle networks and message routers, the end-to-end trust path - including off-chain signers - is the audit unit.",
    },
    {
      vector: "Gas-griefing / DoS in critical paths",
      category: "DoS",
      why: "Loops bounded by user-controlled arrays can permanently brick withdrawal queues.",
    },
  ],
  "Layer 2": [
    {
      vector: "Sequencer-induced censorship",
      category: "Liveness",
      why: "Force-inclusion paths must be exercised under hostile-sequencer assumptions; a stuck withdrawal queue is the worst-case loss.",
    },
    {
      vector: "Proof system soundness",
      category: "Cryptography",
      why: "ZK circuit bugs and fraud-proof window mis-tunings allow invalid state roots to finalize. Requires a cryptographer on the team.",
    },
    {
      vector: "Bridge / canonical-asset accounting",
      category: "Bridge",
      why: "Every L2 has a bridge attached; the bridge is usually the higher-risk component.",
    },
    {
      vector: "Upgrade key custody",
      category: "Access Control",
      why: "Stage-0/1 rollups have privileged upgrade keys - custody, rotation, and timelocks are in scope.",
    },
  ],
  Bridge: [
    {
      vector: "Signature-verification edge cases",
      category: "Cryptography",
      why: "Wormhole-style instruction-introspection bugs and BLS-misuse let attackers forge guardian sets.",
    },
    {
      vector: "Validator set rotation",
      category: "Access Control",
      why: "Stale RPC trust, lack of timelocks on guardian changes, and m-of-n key custody dominate bridge losses (Ronin).",
    },
    {
      vector: "Replica root / message-root defaults",
      category: "Upgradeability",
      why: "Nomad's zero-root catastrophe - every privileged init must have a non-zero invariant asserted on-chain.",
    },
    {
      vector: "Asset-accounting drift across chains",
      category: "Invariant",
      why: "Per-chain mint/burn ledgers must reconcile; we fuzz the cross-chain invariant.",
    },
  ],
};

export function threatsFor(type: ProtocolType, _stack: StackLang): Threat[] {
  return THREATS[type];
}

export const PROTOCOL_TYPES: ProtocolType[] = [
  "DeFi",
  "NFT",
  "Infrastructure",
  "Layer 2",
  "Bridge",
];

export const STACK_LANGS: StackLang[] = ["Solidity", "Vyper", "Rust", "Cairo"];
