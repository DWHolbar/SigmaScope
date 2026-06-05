import { Badge } from "@/components/ui/Badge";
import { VulnerabilityExplorer } from "@/components/intel/VulnerabilityExplorer";

export default function IntelPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Tab · Vulnerability Intel</Badge>
          <Badge tone="muted">Historical exploits · 2016–2023</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Every hack, three ways.
        </h1>
        <p className="max-w-3xl text-sm text-zinc-400">
          Engineers want the call trace. Founders want the dollar figure and the headline. A TAM
          translates between them. Each entry below carries all three framings — plus how the kind
          of review Sigma Prime sells would have caught it.
        </p>
      </header>
      <VulnerabilityExplorer />
    </div>
  );
}
