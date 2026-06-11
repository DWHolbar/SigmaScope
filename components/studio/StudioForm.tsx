"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  MessageSquare,
  AlignLeft,
  Linkedin,
  Mail,
  Megaphone,
  FileText,
  HelpCircle,
  Star,
  Copy,
  Check,
  Download,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { TEMPLATES, TEMPLATE_BY_ID } from "@/lib/studio/templates";
import type { TemplateId, Audience, Tone, Length } from "@/lib/studio/templates";
import { TOPICS, TOPIC_BY_ID } from "@/lib/studio/topics";
import { generateContentPdf } from "@/lib/pdf";

const TEMPLATE_ICONS: Record<TemplateId, LucideIcon> = {
  tweet: MessageSquare,
  thread: AlignLeft,
  linkedin: Linkedin,
  newsletter: Mail,
  "pr-pitch": Megaphone,
  "blog-outline": FileText,
  faq: HelpCircle,
  "tool-review": Star,
};

type State = {
  templateId: TemplateId | null;
  topicId: string | null;
  audience: Audience | null;
  tone: Tone | null;
  length: Length;
  draft: string | null;
};

type Action =
  | { kind: "template"; v: TemplateId }
  | { kind: "topic"; v: string }
  | { kind: "audience"; v: Audience }
  | { kind: "tone"; v: Tone }
  | { kind: "length"; v: Length }
  | { kind: "draft"; v: string }
  | { kind: "reset" };

const initial: State = {
  templateId: null,
  topicId: null,
  audience: null,
  tone: null,
  length: "standard",
  draft: null,
};

function reducer(s: State, a: Action): State {
  switch (a.kind) {
    case "template":
      return { ...s, templateId: a.v, draft: null };
    case "topic":
      return { ...s, topicId: a.v, draft: null };
    case "audience":
      return { ...s, audience: a.v, draft: null };
    case "tone":
      return { ...s, tone: a.v, draft: null };
    case "length":
      return { ...s, length: a.v, draft: null };
    case "draft":
      return { ...s, draft: a.v };
    case "reset":
      return initial;
  }
}

function progress(s: State): number {
  let p = 0;
  if (s.templateId) p++;
  if (s.topicId) p++;
  if (s.audience) p++;
  if (s.tone) p++;
  return p;
}

export function StudioForm() {
  const [s, dispatch] = useReducer(reducer, initial);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const ready = !!s.templateId && !!s.topicId && !!s.audience && !!s.tone;

  const generated = useMemo(() => {
    if (!ready || !s.templateId || !s.topicId || !s.audience || !s.tone) return null;
    const template = TEMPLATE_BY_ID.get(s.templateId);
    const topic = TOPIC_BY_ID.get(s.topicId);
    if (!template || !topic) return null;
    return template.render({
      topic,
      audience: s.audience,
      tone: s.tone,
      length: s.length,
    });
  }, [ready, s]);

  const draftText = s.draft ?? generated ?? "";
  const isTweet = s.templateId === "tweet";
  const isThread = s.templateId === "thread";
  const charCount = draftText.length;
  const wordCount = draftText.trim().split(/\s+/).filter(Boolean).length;
  const tweetSegments = isThread ? draftText.split(/\n\n+/).filter(Boolean) : [];

  useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) return;
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [ready]);

  function copyToClipboard() {
    if (!draftText) return;
    navigator.clipboard
      .writeText(draftText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  function downloadTxt() {
    if (!draftText) return;
    saveBlob(new Blob([draftText], { type: "text/plain" }), fileName("txt"));
  }

  function downloadMd() {
    if (!draftText) return;
    saveBlob(new Blob([draftText], { type: "text/markdown" }), fileName("md"));
  }

  function downloadPdf() {
    if (!draftText || !s.templateId || !s.topicId) return;
    const template = TEMPLATE_BY_ID.get(s.templateId)!;
    const topic = TOPIC_BY_ID.get(s.topicId)!;
    const blob = generateContentPdf({
      templateName: template.name,
      topicName: topic.name,
      body: draftText,
    });
    saveBlob(blob, fileName("pdf"));
  }

  function fileName(ext: string): string {
    const tpl = s.templateId ?? "draft";
    const topic = s.topicId ?? "topic";
    return `sigmascope-${tpl}-${topic}.${ext}`;
  }

  function saveBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const topicOptions = useMemo(
    () =>
      TOPICS.map((t) => ({
        value: t.id,
        label: `${t.name} (${labelForKind(t.kind)})`,
      })),
    [],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader
            title="Compose"
            hint={`${progress(s)} of 4 inputs set. The draft renders automatically.`}
            right={
              <button
                onClick={() => dispatch({ kind: "reset" })}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-accent"
              >
                <RotateCcw size={12} /> reset
              </button>
            }
          />

          <div className="flex flex-col gap-6">
            <Step n={1} title="Template" filled={!!s.templateId}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TEMPLATES.map((t) => {
                  const Icon = TEMPLATE_ICONS[t.id];
                  const active = s.templateId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => dispatch({ kind: "template", v: t.id })}
                      className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition ${
                        active
                          ? "border-accent/40 bg-accent/10"
                          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                      }`}
                    >
                      <Icon size={16} />
                      <span
                        className={`text-[13px] font-medium ${
                          active ? "text-accent" : "text-zinc-100"
                        }`}
                      >
                        {t.name}
                      </span>
                      <span className="text-[10px] leading-relaxed text-zinc-500">
                        {t.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n={2} title="Topic" filled={!!s.topicId}>
              <Dropdown
                value={s.topicId}
                onChange={(v) => v && dispatch({ kind: "topic", v })}
                options={topicOptions}
                placeholder="Pick a topic"
              />
            </Step>

            <Step n={3} title="Audience" filled={!!s.audience}>
              <div className="flex flex-wrap gap-2">
                <Pill active={s.audience === "engineer"} onClick={() => dispatch({ kind: "audience", v: "engineer" })}>
                  Engineer
                </Pill>
                <Pill active={s.audience === "founder"} onClick={() => dispatch({ kind: "audience", v: "founder" })}>
                  Founder
                </Pill>
                <Pill active={s.audience === "general"} onClick={() => dispatch({ kind: "audience", v: "general" })}>
                  General
                </Pill>
              </div>
            </Step>

            <Step n={4} title="Tone" filled={!!s.tone}>
              <div className="flex flex-wrap gap-2">
                <Pill active={s.tone === "technical"} onClick={() => dispatch({ kind: "tone", v: "technical" })}>
                  Technical
                </Pill>
                <Pill active={s.tone === "accessible"} onClick={() => dispatch({ kind: "tone", v: "accessible" })}>
                  Accessible
                </Pill>
                <Pill active={s.tone === "promotional"} onClick={() => dispatch({ kind: "tone", v: "promotional" })}>
                  Promotional
                </Pill>
              </div>
            </Step>

            <Step n={5} title="Length nudge" filled={true}>
              <div className="flex flex-wrap gap-2">
                <Pill active={s.length === "short"} onClick={() => dispatch({ kind: "length", v: "short" })}>
                  Short
                </Pill>
                <Pill active={s.length === "standard"} onClick={() => dispatch({ kind: "length", v: "standard" })}>
                  Standard
                </Pill>
                <Pill active={s.length === "long"} onClick={() => dispatch({ kind: "length", v: "long" })}>
                  Long
                </Pill>
              </div>
            </Step>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2" ref={outputRef}>
        {ready ? (
          <Card className="lg:sticky lg:top-20 flex flex-col gap-3">
            <CardHeader
              title="Draft"
              hint="Edit in place. The buttons export whatever is in the box."
              right={
                <Button variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "copied" : "copy"}
                </Button>
              }
            />
            <textarea
              value={draftText}
              onChange={(e) => dispatch({ kind: "draft", v: e.target.value })}
              rows={Math.max(10, Math.min(28, draftText.split("\n").length + 2))}
              className="mono w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 p-3 text-[12px] leading-relaxed text-zinc-200 focus:border-accent/40 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                {isTweet ? (
                  <Badge tone={charCount > 280 ? "danger" : charCount > 260 ? "warn" : "ok"}>
                    {charCount} / 280 chars
                  </Badge>
                ) : isThread ? (
                  <>
                    <Badge tone="muted">{tweetSegments.length} tweets</Badge>
                    <Badge tone={tweetSegments.some((t) => t.length > 280) ? "danger" : "ok"}>
                      longest {Math.max(0, ...tweetSegments.map((t) => t.length))} / 280
                    </Badge>
                  </>
                ) : (
                  <>
                    <span>{wordCount} words</span>
                    <span>&middot;</span>
                    <span>{charCount} chars</span>
                  </>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="outline" onClick={downloadTxt}>
                  <Download size={14} /> .txt
                </Button>
                <Button variant="outline" onClick={downloadMd}>
                  <Download size={14} /> .md
                </Button>
                <Button variant="outline" onClick={downloadPdf}>
                  <Download size={14} /> .pdf
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="lg:sticky lg:top-20 border-dashed">
            <CardHeader
              title="Draft preview"
              hint={`${progress(s)} of 4 inputs set. Output renders once all four are picked.`}
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
            filled ? "border-accent bg-accent/20 text-accent" : "border-zinc-700 text-zinc-400"
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

function labelForKind(k: string): string {
  switch (k) {
    case "tool":
      return "tool";
    case "audit-archetype":
      return "audit case";
    case "hack":
      return "hack";
    case "eth-update":
      return "Ethereum update";
    case "tam-workflow":
      return "TAM workflow";
    default:
      return k;
  }
}
