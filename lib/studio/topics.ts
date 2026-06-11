export type TopicKind = "tool" | "audit-archetype" | "hack" | "eth-update" | "tam-workflow";

export type Topic = {
  id: string;
  kind: TopicKind;
  name: string;
  short: string;
  facets: {
    what: string;
    whyItMatters: string;
    standout?: string;
    numbers?: string;
    risk?: string;
    cta?: string;
  };
};

export const TOPICS: Topic[] = [
  {
    id: "lighthouse",
    kind: "tool",
    name: "Lighthouse",
    short: "Sigma Prime's flagship Rust consensus client for Ethereum.",
    facets: {
      what: "Lighthouse is a high-performance Ethereum consensus client written in Rust by Sigma Prime, in production on roughly 35-40% of Ethereum validators.",
      whyItMatters: "Client diversity is the single biggest insurance policy on Ethereum's consensus layer. A supermajority on any one client is a single-bug catastrophe waiting to happen.",
      standout: "Memory-safe Rust, aggressive BLS aggregation, and a track record of catching consensus-layer issues before they ship.",
      numbers: "~3,000 stars on GitHub, ~800 forks, hundreds of releases since 2019.",
      risk: "Consensus-client bugs do not respect audits. Lighthouse uses differential fuzzing and formal modelling to attack itself before adversaries can.",
      cta: "If you run a staking operation, run more than one client. Lighthouse is one of the strongest options.",
    },
  },
  {
    id: "discv5",
    kind: "tool",
    name: "discv5",
    short: "Sigma Prime's Rust implementation of Ethereum Node Discovery v5.",
    facets: {
      what: "discv5 is the Rust crate that lets Ethereum nodes find each other. It is the discovery layer powering Lighthouse and a growing number of other Ethereum clients.",
      whyItMatters: "Peer discovery is invisible until it breaks. A subtle bug here partitions the network or leaks topology.",
      standout: "Async, no_std-friendly, hardened against eclipse attacks and topology fingerprinting.",
      numbers: "Powers Lighthouse and is depended on by Reth and several rollup node implementations.",
      risk: "Discovery DoS is a well-studied attack class; Sigma Prime maintains it precisely because nobody else wanted to.",
      cta: "If you write Ethereum tooling, audit your discovery layer the way you audit your consensus.",
    },
  },
  {
    id: "ssz_rs",
    kind: "tool",
    name: "ssz_rs",
    short: "Rust implementation of SimpleSerialize, Ethereum's canonical encoding.",
    facets: {
      what: "ssz_rs is a from-scratch SSZ implementation in Rust, with derive macros for ergonomics and a focus on no_std support.",
      whyItMatters: "SSZ is the format every consensus message uses. A bug here corrupts state across an entire network.",
      standout: "Type-driven derives, low allocation count, and tested against the canonical Ethereum consensus-specs test vectors.",
      cta: "Anyone working on Ethereum-adjacent infrastructure in Rust should know this crate exists.",
    },
  },
  {
    id: "milhouse",
    kind: "tool",
    name: "Milhouse",
    short: "Persistent binary Merkle tree for Lighthouse's state.",
    facets: {
      what: "Milhouse is a persistent (versioned, structurally shared) binary Merkle tree, optimized for the Lighthouse beacon state.",
      whyItMatters: "Beacon-state size dominates client memory. Persistent data structures let Lighthouse hold multiple states without copy explosions.",
      standout: "Structurally shared updates, no global locks, designed specifically for Ethereum-shaped data.",
    },
  },
  {
    id: "audit-defi-protocol",
    kind: "audit-archetype",
    name: "DeFi protocol audit",
    short: "Soup-to-nuts review of a lending or AMM-style protocol.",
    facets: {
      what: "A typical DeFi engagement reviews a contract suite that holds and accounts for user funds, with external oracle and DEX integrations.",
      whyItMatters: "DeFi protocols are where attackers iterate fastest. Last year's safe pattern is this year's exploit.",
      standout: "Sigma Prime's reviews go beyond function-by-function checks: protocol invariants are fuzzed (Echidna or Foundry) and threat-modelled as a whole.",
      risk: "Common categories: reentrancy, oracle manipulation, flash-loan composability, governance and admin-key risk, liquidation bypass.",
    },
  },
  {
    id: "audit-bridge",
    kind: "audit-archetype",
    name: "Bridge audit",
    short: "Cross-chain message routing and validator-set custody review.",
    facets: {
      what: "Bridges have lost more funds than any other DeFi category. An audit covers the contract surface plus the off-chain validator infrastructure and the signing flow.",
      whyItMatters: "$2B+ in cumulative bridge losses since 2022 (Ronin, Wormhole, Nomad, Multichain, Orbit). The contracts are necessary but not sufficient.",
      standout: "Engagements include key-custody review and supply-chain hardening, not just contract review.",
      risk: "Signing-UI compromise (Bybit 2025, Radiant 2024, WazirX 2024) is the dominant attack class right now.",
    },
  },
  {
    id: "audit-wallet",
    kind: "audit-archetype",
    name: "Wallet audit",
    short: "Self-custody wallet and signing-flow review.",
    facets: {
      what: "Wallet audits cover key generation, storage, dApp signing surfaces, and the user-facing display of what is being signed.",
      whyItMatters: "Wallets are the last mile of security. A bug here exposes every user simultaneously.",
      standout: "Engagements assess entropy sources, dependency supply chain, and user-facing calldata clarity.",
      risk: "Blind signing remains the dominant problem. Permit2 and EIP-712 typed-data display are the current state of the art.",
    },
  },
  {
    id: "hack-bybit",
    kind: "hack",
    name: "Bybit Cold Wallet (Feb 2025)",
    short: "$1.46B Lazarus theft via Safe-UI supply chain.",
    facets: {
      what: "Lazarus compromised a Safe-Wallet developer machine, injected malicious JavaScript targeting Bybit's specific Safe address, and tricked cold-wallet signers into delegatecalling an attacker-controlled implementation.",
      whyItMatters: "Largest crypto theft ever. The signing UI itself was the attack surface.",
      numbers: "401,346 ETH (about $1.46B) drained in a single transaction.",
      risk: "Same root-cause class as Radiant 2024 ($50M) and WazirX 2024 ($230M). Sign-what-you-see attacks are now the bridge-class problem of 2025.",
      cta: "Treat the signing UI as untrusted. Hardware-only calldata display, second-channel hash verification, and monitored Safe-implementation slot writes are table stakes.",
    },
  },
  {
    id: "hack-ronin",
    kind: "hack",
    name: "Ronin Bridge (Mar 2022)",
    short: "$624M Lazarus theft via validator key compromise.",
    facets: {
      what: "Attacker compromised 4 of 9 Sky Mavis validator keys directly and obtained a 5th via a stale RPC allowlist, then signed two withdrawal transactions emptying the bridge.",
      whyItMatters: "Reframed how the industry thinks about m-of-n bridge custody.",
      numbers: "$624M, the largest crypto theft of 2022 until Wormhole was scaled to its current loss.",
      risk: "Stale operational trust (RPC allowlists, signer device hardening, rotation cadence) is invisible until it isn't.",
      cta: "Bridge audits must include the operational layer, not just the contracts.",
    },
  },
  {
    id: "hack-curve",
    kind: "hack",
    name: "Curve / Vyper compiler (Jul 2023)",
    short: "$73M via a malfunctioning Vyper reentrancy decorator.",
    facets: {
      what: "Vyper compiler versions 0.2.15, 0.2.16, and 0.3.0 emitted reentrancy-lock bytecode that collided with normal storage slots, silently disabling protection on every contract compiled with those versions.",
      whyItMatters: "Compiler bugs are an attack surface even when contract code is otherwise correct.",
      numbers: "$73M across multiple Curve pools (alETH, msETH, pETH).",
      cta: "Audits should diff deployed bytecode against a fresh build from source. Compiler-version pinning is a deliverable.",
    },
  },
  {
    id: "eth-pectra",
    kind: "eth-update",
    name: "Pectra hard fork",
    short: "Combined Prague (EL) and Electra (CL) upgrade.",
    facets: {
      what: "Pectra combines a set of execution-layer and consensus-layer EIPs, headlined by EIP-7251 (MaxEB lift from 32 to 2048 ETH) and EIP-7702 (smart-account EOA upgrades).",
      whyItMatters: "Lifts validator-count pressure on the consensus layer and gives EOAs an account-abstraction story without forcing a full ERC-4337 migration.",
      standout: "Lighthouse shipped Pectra-compat releases ahead of mainnet activation; client-diversity discipline matters most at upgrade time.",
    },
  },
  {
    id: "eth-7702",
    kind: "eth-update",
    name: "EIP-7702",
    short: "Lets externally-owned accounts run contract code for a single tx.",
    facets: {
      what: "EIP-7702 introduces a new transaction type that gives an EOA temporary contract behaviour, scoped to one tx, via an authorization signature.",
      whyItMatters: "Account abstraction without forcing every user to migrate to a new account type.",
      standout: "Reduces dApp UX friction; opens new signing-UX patterns and new attack-surface considerations.",
      risk: "Audits need to assess the per-tx authorization signing flow; a malicious dApp that gets you to sign a 7702 auth can do real damage.",
    },
  },
  {
    id: "eth-verkle",
    kind: "eth-update",
    name: "Verkle trees and PeerDAS",
    short: "Statelessness and data-availability sampling on the long-horizon roadmap.",
    facets: {
      what: "Verkle trees replace Merkle Patricia tries with vector commitments, enabling stateless clients. PeerDAS samples data-availability columns instead of full blobs.",
      whyItMatters: "These shape what consensus clients like Lighthouse will look like in 2026+.",
      standout: "Lighthouse and Sigma Prime have been involved in PeerDAS research since the proposal stage.",
    },
  },
  {
    id: "tam-scoping",
    kind: "tam-workflow",
    name: "Scoping a new client",
    short: "What happens between first contact and signed engagement.",
    facets: {
      what: "Discovery call, codebase walkthrough, threat-model draft, engagement proposal, scope negotiation, kickoff.",
      whyItMatters: "Most audit failures start at scoping. Mismatched expectations and missed surface area are recoverable; missed scope is not.",
      standout: "A Sigma Prime TAM brings the threat model with them to the discovery call, so the founder leaves with a list of attack vectors specific to their stack.",
    },
  },
  {
    id: "tam-postmortem",
    kind: "tam-workflow",
    name: "Post-engagement follow-up",
    short: "Fix-review, public disclosure, and the next conversation.",
    facets: {
      what: "After the final report: fix-review on remediations, coordinated disclosure planning, and laying the groundwork for follow-on work as the protocol evolves.",
      whyItMatters: "The first audit is a beginning, not an end. Protocols change; threat models change with them.",
      standout: "Sigma Prime treats long-term clients as a relationship, not a transaction.",
    },
  },
];

export const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));
