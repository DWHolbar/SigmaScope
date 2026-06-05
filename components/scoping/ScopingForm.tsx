"use client";

import { useMemo, useReducer } from "react";
import {
  Coins,
  Image as ImageIcon,
  Network,
  Layers,
  GitBranch,
  Download,
  RotateCcw,
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
import { buildProposal, proposalToMarkdown, LocBucket, Urgency } from "@/lib/proposal";

const TYPE_ICONS: Record<ProtocolType, LucideIcon> = {
  DeFi: Coins,
  NFT: ImageIcon,
  Infrastructure: Network,
  "Layer 2": Layers,
  Bridge: GitBranch,
};

type State = {
  step: 0 | 1 | 2 | 3 | 4;
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
  | { kind: "next" }
  | { kind: "back" }
  | { kind: "reset" };

const initial: State = {
  step: 0,
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
      return { ...s, type: a.v, step: 1 };
    case "stack":
      return { ...s, stack: a.v, step: 2 };
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
      return { ...s, urgency: a.v, step: 4 };
    case "next":
      return { ...s, step: Math.min(4, s.step + 1) as State["step"] };
    case "back":
      return { ...s, step: Math.max(0, s.step - 1) as State["step"] };
    case "reset":
      return initial;
  }
}

const INTEGRATIONS = ["Oracle", "Cross-chain messaging", "Governance", "ERC-4626 vault", "Permit/EIP-2612"];
const LOC_OPTIONS: { v: LocBucket; label: string; hint: string }[] = [
  { v: "<1k", label: "<1k LOC", hint: "Single contract, focused review" },
  { v: "1-5k", label: "1–5k LOC", hint: "Small protocol or module" },
  { v: "5-15k", label: "5–15k LOC", hint: "Full protocol surface" },
  { v: ">15k", label: ">15k LOC", hint: "Phased engagement" },
];

export function ScopingForm() {
  const [s, dispatch] = useReducer(reducer, initial);

  const ready = s.type && s.stack && s.loc && s.upgradeable !== null && s.urgency;

  const result = useMemo(() => {
    if (!ready || !s.type || !s.stack || !s.loc || s.upgradeable === null || !s.urgency) return null;
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

  function download() {
    if (!result || !s.type || !s.stack || !s.loc || s.upgradeable === null || !s.urgency) return;
    const md = proposalToMarkdown(
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
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sigmascope-${s.type.toLowerCase().replace(/\s+/g, "-")}-proposal.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader
            title="Tell us about the protocol"
            hint="Four quick steps. The output is a Threat Model and a mock engagement outline."
            right={
              <button
                onClick={() => dispatch({ kind: "reset" })}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-accent"
              >
                <RotateCcw size={12} /> reset
              </button>
            }
          />

          <Stepper step={s.step} />

          <div className="mt-6 flex flex-col gap-6">
            <Step n={1} title="Protocol type">
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

            <Step n={2} title="Primary stack" disabled={!s.type}>
              <div className="flex flex-wrap gap-2">
                {STACK_LANGS.map((l) => (
                  <Pill key={l} active={s.stack === l} onClick={() => dispatch({ kind: "stack", v: l })}>
                    {l}
                  </Pill>
                ))}
              </div>
            </Step>

            <Step n={3} title="Scope" disabled={!s.stack}>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 text-xs text-zinc-500">Codebase size</div>
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
                        <div className={`text-sm ${s.loc === o.v ? "text-accent" : "text-zinc-100"}`}>
                          {o.label}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">{o.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs text-zinc-500">External integrations</div>
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
                <div>
                  <div className="mb-2 text-xs text-zinc-500">Upgradeable contracts?</div>
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
                </div>
              </div>
            </Step>

            <Step n={4} title="Timeline" disabled={!s.loc || s.upgradeable === null}>
              <div className="flex gap-2">
                <Pill active={s.urgency === "Standard"} onClick={() => dispatch({ kind: "urgency", v: "Standard" })}>
                  Standard
                </Pill>
                <Pill active={s.urgency === "Expedited"} onClick={() => dispatch({ kind: "urgency", v: "Expedited" })}>
                  Expedited
                </Pill>
              </div>
            </Step>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {result ? (
          <Card className="sticky top-20">
            <CardHeader
              title="Threat model & engagement outline"
              hint="Generated from your inputs. Illustrative — not a binding quote."
              right={
                <Button variant="outline" onClick={download}>
                  <Download size={14} /> .md
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
                  value={`${result.proposal.weeksLow}–${result.proposal.weeksHigh} weeks`}
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
          <Card className="sticky top-20 border-dashed">
            <CardHeader
              title="Output will appear here"
              hint="Complete the four steps to generate a threat model and engagement outline."
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
  children,
  disabled,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-40" : ""}>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full border border-zinc-700 text-[10px] text-zinc-400">
          {n}
        </span>
        <span className="text-xs uppercase tracking-widest text-zinc-400">{title}</span>
      </div>
      <fieldset disabled={disabled}>{children}</fieldset>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i <= step ? "bg-accent" : "bg-zinc-800"
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
