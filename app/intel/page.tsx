import { PageHeader } from "@/components/PageHeader";
import { VulnerabilityExplorer } from "@/components/intel/VulnerabilityExplorer";

export default function IntelPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tab="Tab 4 · Vulnerability Intel"
        badge="Historical exploits, 2016 to present"
        title="Every hack, three ways."
        description="Engineers want the call trace. Founders want the dollar figure and the headline. A TAM translates between them. Each curated entry below carries all three framings, plus how the kind of review Sigma Prime sells would have caught it."
        howToUse={
          <>
            The archive merges 29 hand-curated entries (2016 to 2025) with a live overlay from
            DefiLlama's hacks API, fetched on every page load and cached for one hour. New
            incidents recorded by DefiLlama show up here automatically with a{" "}
            <span className="mono text-accent">live</span> badge.
          </>
        }
      />
      <VulnerabilityExplorer />
    </div>
  );
}
