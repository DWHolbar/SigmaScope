import { Badge } from "@/components/ui/Badge";
import { ScopingForm } from "@/components/scoping/ScopingForm";
import { Info } from "lucide-react";

export default function ScopingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Tab 2 · Audit Scoping Simulator</Badge>
          <Badge tone="muted">Client conversation tool</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          The first conversation, simulated.
        </h1>
        <p className="max-w-3xl text-sm text-zinc-400">
          What a TAM does on day one: take a founder&rsquo;s rough description, map it to the right
          threat model, and propose an engagement they can actually defend internally. This tool
          runs the same flow against a small library of templates and Sigma Prime&rsquo;s real prior
          clients.
        </p>
        <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-[12px] text-zinc-300">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" />
          <span>
            Click through all five inputs on the left (protocol → stack → codebase size →
            upgradeable → timeline). The threat model and engagement outline render on the right
            (or below on mobile) the moment the last input is set. Hit{" "}
            <span className="mono text-accent">.md</span> to export a Markdown copy.
          </span>
        </div>
      </header>
      <ScopingForm />
    </div>
  );
}
