import { Badge } from "@/components/ui/Badge";
import { VulnerabilityExplorer } from "@/components/intel/VulnerabilityExplorer";
import { Info } from "lucide-react";

export default function IntelPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Tab 3 · Vulnerability Intel</Badge>
          <Badge tone="muted">Historical exploits, 2016 to present</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Every hack, three ways.
        </h1>
        <p className="max-w-3xl text-sm text-zinc-400">
          Engineers want the call trace. Founders want the dollar figure and the headline. A TAM
          translates between them. Each curated entry below carries all three framings, plus how
          the kind of review Sigma Prime sells would have caught it.
        </p>
        <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-[12px] text-zinc-300">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" />
          <span>
            The archive merges 28 hand-curated entries (2016 to 2025) with a live overlay from
            DefiLlama&rsquo;s hacks API, fetched on every page load and cached for one hour. New
            incidents recorded by DefiLlama show up here automatically with a{" "}
            <span className="mono text-accent">live</span> badge. Curated entries carry the full
            engineer / founder / TAM narrative; live entries carry just the rapid-summary fields
            until they&rsquo;re promoted to a curated slot.
          </span>
        </div>
      </header>
      <VulnerabilityExplorer />
    </div>
  );
}
