"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import {
  Coins,
  Image as ImageIcon,
  Network,
  Layers,
  GitBranch,
  Download,
  RotateCcw,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  PROTOCOL_TYPES,
  STACK_LANGS,
  ProtocolType,
  StackLang,
  threatsFor,
} from "@/lib/threat-models";
import { buildProposal, LocBucket, Urgency } from "@/lib/proposal";
import { generateProposalPdf } from "@/lib/pdf";

const TYPE_ICONS: Record<ProtocolType, LucideIcon> = {
  DeFi: Coins,
  NFT: ImageIcon,
  Infrastructure: Network,
  "Layer 2": Layers,
  Bridge: GitBranch,
};

type State = {
  type: ProtocolType | null;
  stack: StackLang | null;
  loc: LocBucket | null;
  integrations: string[];
  upgradeable: boolean | null;
  urgency: Urgency | null;
};

type Action =
  | { kind: "type"; v: ProtocolType }
  | { kind: "stack"; v: StackLang }
  | { kind: "loc"; v: LocBucket }
  | { kind: "toggleIntegration"; v: string }
  | { kind: "upgradeable"; v: boolean }
  | { kind: "urgency"; v: Urgency }
  | { kind: "reset" };

const initial: State = {
  type: null,
  stack: null,
  loc: null,
  integrations: [],
  upgradeable: null,
  urgency: null,
};

function reducer(s: State, a: Action): State {
  switch (a.kind) {
    case "type":
      return { ...s, type: a.v };
    case "stack":
      return { ...s, stack: a.v };
    case "loc":
      return { ...s, loc: a.v };
    case "toggleIntegration":
      return {
        ...s,
        integrations: s.integrations.includes(a.v)
          ? s.integrations.filter((x) => x !== a.v)
          : [...s.integrations, a.v],
      };
    case "upgradeable":
      return { ...s, upgradeable: a.v };
    case "urgency":
      return { ...s, urgency: a.v };
    case "reset":
      return initial;
  }
}

const INTEGRATIONS = [
  "Oracle",
  "Cross-chain messaging",
  "Governance",
  "ERC-4626 vault",
  "Permit/EIP-2612",
];
const LOC_OPTIONS: { v: LocBucket; label: string; hint: string }[] = [
  { v: "<1k", label: "<1k LOC", hint: "Single contract" },
  { v: "1-5k", label: "1 to 5k LOC", hint: "Small protocol" },
  { v: "5-15k", label: "5 to 15k LOC", hint: "Full protocol" },
  { v: ">15k", label: ">15k LOC", hint: "Phased engagement" },
];

function progress(s: State): number {
  let p = 0;
  if (s.type) p++;
  if (s.stack) p++;
  if (s.loc) p++;
  if (s.upgradeable !== null) p++;
  if (s.urgency) p++;
  return p;
}

export function ScopingForm() {
  const [s, dispatch] = useReducer(reducer, initial);
  const outputRef = useRef<HTMLDivElement>(null);

  const ready =
    !!s.type && !!s.stack && !!s.loc && s.upgradeable !== null && !!s.urgency;
  const totalSteps = 5;
  const done = progress(s);

  const result = useMemo(() => {
    if (!ready || !s.type || !s.stack || !s.loc || s.upgradeable === null || !s.urgency)
      return null;
    const threats = threatsFor(s.type, s.stack);
    const proposal = buildProposal(
      {
        type: s.type,
        stack: s.stack,
        loc: s.loc,
        integrations: s.integrations,
        upgradeable: s.upgradeable,
        urgency: s.urgency,
      },
      threats,
    );
    return { threats, proposal };
  }, [ready, s]);

  // Scroll to output on small screens once everything is filled in
  useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) return;
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [ready]);

  function download() {
    if (!result || !s.type || !s.stack || !s.loc || s.upgradeable === null || !s.urgency) return;
    const blob = generateProposalPdf(
      {
        type: s.type,
        stack: s.stack,
        loc: s.loc,
        integrations: s.integrations,
        upgradeable: s.upgradeable,
        urgency: s.urgency,
      },
      result.threats,
      result.proposal,
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sigmascope-${s.type.toLowerCase().replace(/\s+/g, "-")}-proposal.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader
            title="Tell us about the protocol"
            hint={`${done} of ${totalSteps} inputs complete · output appears once all are filled.`}
            right={
              <button
                onClick={() => dispatch({ kind: "reset" })}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-accent"
              >
                <RotateCcw size={12} /> reset
              </button>
            }
          />

          <Stepper done={done} total={totalSteps} />

          <div className="mt-6 flex flex-col gap-6">
            <Step n={1} title="Protocol type" filled={!!s.type}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PROTOCOL_TYPES.map((t) => {
                  const Icon = TYPE_ICONS[t];
                  const active = s.type === t;
                  return (
                    <button
                      key={t}
                      onClick={() => dispatch({ kind: "type", v: t })}
                      className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition ${
                        active
                          ? "border-accent/40 bg-accent/10"
                          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                      }`}
                    >
                      <Icon size={16} />
                      <span className={`text-sm ${active ? "text-accent" : "text-zinc-200"}`}>
                        {t}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n={2} title="Primary stack" filled={!!s.stack}>
              <div className="flex flex-wrap gap-2">
                {STACK_LANGS.map((l) => (
                  <Pill
                    key={l}
                    active={s.stack === l}
                    onClick={() => dispatch({ kind: "stack", v: l })}
                  >
                    {l}
                  </Pill>
                ))}
              </div>
            </Step>

            <Step n={3} title="Codebase size" filled={!!s.loc}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LOC_OPTIONS.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => dispatch({ kind: "loc", v: o.v })}
                    className={`rounded-lg border p-3 text-left ${
                      s.loc === o.v
                        ? "border-accent/40 bg-accent/10"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`text-sm ${s.loc === o.v ? "text-accent" : "text-zinc-100"}`}
                    >
                      {o.label}
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500">{o.hint}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <div className="mb-2 text-xs text-zinc-500">
                  External integrations (optional, multi-select)
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTEGRATIONS.map((i) => (
                    <Pill
                      key={i}
                      active={s.integrations.includes(i)}
                      onClick={() => dispatch({ kind: "toggleIntegration", v: i })}
                    >
                      {i}
                    </Pill>
                  ))}
                </div>
              </div>
            </Step>

            <Step n={4} title="Upgradeable contracts?" filled={s.upgradeable !== null}>
              <div className="flex gap-2">
                <Pill
                  active={s.upgradeable === true}
                  onClick={() => dispatch({ kind: "upgradeable", v: true })}
                >
                  Yes
                </Pill>
                <Pill
                  active={s.upgradeable === false}
                  onClick={() => dispatch({ kind: "upgradeable", v: false })}
                >
                  No
                </Pill>
              </div>
            </Step>

            <Step n={5} title="Timeline" filled={!!s.urgency}>
              <div className="flex gap-2">
                <Pill
                  active={s.urgency === "Standard"}
                  onClick={() => dispatch({ kind: "urgency", v: "Standard" })}
                >
                  Standard
                </Pill>
                <Pill
                  active={s.urgency === "Expedited"}
                  onClick={() => dispatch({ kind: "urgency", v: "Expedited" })}
                >
                  Expedited
                </Pill>
              </div>
            </Step>

            {!ready && (
              <div className="rounded-md border border-dashed border-zinc-800 bg-zinc-900/30 p-3 text-[12px] text-zinc-500">
                Fill all {totalSteps} inputs above. Output renders automatically - no submit button
                needed.
              </div>
            )}

            {ready && (
              <div className="flex items-center justify-between rounded-md border border-accent/30 bg-accent/5 p-3 text-[12px] text-accent lg:hidden">
                <span>Proposal ready below.</span>
                <ArrowDown size={14} />
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2" ref={outputRef}>
        {result ? (
          <Card className="lg:sticky lg:top-20">
            <CardHeader
              title="Threat model & engagement outline"
              hint="Generated from your inputs. Numbers are illustrative estimates, not a Sigma Prime quote."
              right={
                <Button variant="outline" onClick={download}>
                  <Download size={14} /> PDF
                </Button>
              }
            />

            <section className="mb-5">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
                Threat model summary
              </div>
              <ul className="flex flex-col gap-2">
                {result.threats.map((t) => (
                  <li
                    key={t.vector}
                    className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-100">{t.vector}</span>
                      <Badge tone="muted">{t.category}</Badge>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{t.why}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-5">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
                Engagement outline
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Stat
                  label="Duration"
                  value={`${result.proposal.weeksLow} to ${result.proposal.weeksHigh} weeks`}
                />
                <Stat label="Team" value={`${result.proposal.team.length} reviewers`} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.proposal.team.map((r) => (
                  <Badge key={r} tone="accent">
                    {r}
                  </Badge>
                ))}
              </div>
              <ul className="mt-3 flex flex-col gap-1.5 text-[12px] text-zinc-300">
                {result.proposal.deliverables.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-accent">▸</span>
                    <span className="text-zinc-400">{d}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-5">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
                How the week range is derived
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                <div className="flex items-baseline justify-between border-b border-zinc-800 pb-2">
                  <span className="text-[11px] font-medium text-zinc-300">
                    Base ({s.loc} LOC, {result.proposal.calculation.base.label})
                  </span>
                  <span className="mono text-[11px] text-zinc-200">
                    {result.proposal.calculation.base.low} to {result.proposal.calculation.base.high}{" "}
                    wks
                  </span>
                </div>
                {result.proposal.calculation.steps.length === 0 ? (
                  <div className="pt-2 text-[11px] text-zinc-500">
                    No modifiers apply for this combination.
                  </div>
                ) : (
                  <ul className="flex flex-col">
                    {result.proposal.calculation.steps.map((step) => (
                      <li
                        key={step.label}
                        className="flex flex-col gap-0.5 border-b border-zinc-800/60 py-2 last:border-b-0"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-medium text-zinc-300">
                            {step.label}
                          </span>
                          <span className="mono text-[11px] text-accent">{step.delta}</span>
                        </div>
                        <span className="text-[11px] leading-relaxed text-zinc-500">
                          {step.rationale}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 flex items-baseline justify-between border-t border-zinc-800 pt-2">
                  <span className="text-[11px] font-semibold text-zinc-200">Total</span>
                  <span className="mono text-[11px] font-semibold text-zinc-100">
                    {result.proposal.weeksLow} to {result.proposal.weeksHigh} wks
                  </span>
                </div>
              </div>
            </section>

            <section className="mb-5">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
                Indicative cost band
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
                <div className="mono text-lg font-semibold text-accent">
                  ${result.proposal.calculation.estTotalCostLow.toLocaleString()} to $
                  {result.proposal.calculation.estTotalCostHigh.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                  {result.proposal.weeksLow} to {result.proposal.weeksHigh} wks
                  &times; {result.proposal.calculation.teamSize} reviewers &times; $
                  {result.proposal.calculation.weekRate.low.toLocaleString()} to $
                  {result.proposal.calculation.weekRate.high.toLocaleString()} per engineer-week
                  (industry-published range from Trail of Bits, ConsenSys Diligence, OpenZeppelin).
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                This is an industry-anchored estimate, not Sigma Prime pricing. Sigma Prime does not
                publish a rate card; only their team can give a binding quote. Treat these numbers
                as a conversation starter.
              </p>
            </section>

            {result.proposal.comparable && (
              <section className="mb-5">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
                  Comparable prior engagement
                </div>
                <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
                  <div className="text-sm font-medium text-accent">
                    {result.proposal.comparable.client}
                  </div>
                  <p className="mt-1 text-[12px] text-zinc-400">
                    {result.proposal.comparable.note}
                  </p>
                </div>
              </section>
            )}

            {result.proposal.caveats.length > 0 && (
              <section>
                <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
                  Caveats
                </div>
                <ul className="flex flex-col gap-1.5 text-[12px] text-amber-200/80">
                  {result.proposal.caveats.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span>⚠</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </Card>
        ) : (
          <Card className="lg:sticky lg:top-20 border-dashed">
            <CardHeader
              title="Output preview"
              hint={`${done}/${totalSteps} inputs filled. Output renders automatically once all are set.`}
            />
            <div className="grid h-64 place-items-center text-center text-sm text-zinc-500">
              <div className="flex flex-col items-center gap-2">
                <div className="mono text-3xl text-zinc-700">{"</>"}</div>
                <div>Awaiting inputs.</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  filled,
  children,
}: {
  n: number;
  title: string;
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] transition ${
            filled
              ? "border-accent bg-accent/20 text-accent"
              : "border-zinc-700 text-zinc-400"
          }`}
        >
          {filled ? "✓" : n}
        </span>
        <span className="text-xs uppercase tracking-widest text-zinc-400">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Stepper({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < done ? "bg-accent" : "bg-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mono mt-1 text-base text-zinc-100">{value}</div>
    </div>
  );
}
