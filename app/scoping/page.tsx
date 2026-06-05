import { Badge } from "@/components/ui/Badge";
import { ScopingForm } from "@/components/scoping/ScopingForm";

export default function ScopingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Tab · Audit Scoping Simulator</Badge>
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
      </header>
      <ScopingForm />
    </div>
  );
}
