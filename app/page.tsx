import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ClientDiversityChart } from "@/components/network/ClientDiversityChart";
import { ParticipationGauge } from "@/components/network/ParticipationGauge";
import { LiveSlotTicker } from "@/components/network/LiveSlotTicker";
import { LighthouseHighlights } from "@/components/network/LighthouseHighlights";
import { UpdatesFeed } from "@/components/network/UpdatesFeed";
import { getBeaconSnapshot } from "@/lib/beacon";
import { Info } from "lucide-react";

export const revalidate = 30;

export default async function NetworkPulsePage() {
  const snap = await getBeaconSnapshot();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Tab 1 · Network Pulse</Badge>
          <Badge tone="muted">Sigma Prime · Lighthouse</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ethereum consensus, in the language Sigma Prime built it in.
        </h1>
        <p className="max-w-3xl text-sm text-zinc-400">
          Slots, epochs, validator participation, and client diversity — the primitives a Technical
          Account Manager walks a founder through before the first audit conversation. Lighthouse,
          Sigma Prime&rsquo;s Rust consensus client, is highlighted throughout.
        </p>
        <HowToUse>
          Slot and epoch tick forward live (computed from beacon-chain genesis, no API needed).
          Participation and client diversity are sourced from public APIs / snapshots — hover
          the badges to see the source.
        </HowToUse>
      </header>

      <section>
        <LiveSlotTicker
          initialSlot={snap.slot.slot}
          initialEpoch={snap.epoch.epoch}
          finalizedEpoch={snap.epoch.finalizedEpoch}
          activeValidators={snap.epoch.activeValidators}
          apiOk={snap.apiOk}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Validator participation"
            hint="Higher = more validators are attesting on time."
          />
          <ParticipationGauge
            rate={snap.epoch.participationRate}
            history={snap.participationHistory}
            apiOk={snap.apiOk}
          />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Consensus client diversity"
            hint="Why diversity matters: a single-client supermajority is a single-bug catastrophe."
          />
          <ClientDiversityChart />
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader
            title="Lighthouse, in four primitives"
            hint="The vocabulary of every Sigma Prime conversation."
          />
          <LighthouseHighlights />
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader
            title="Ecosystem updates the TAM tracks"
            hint="What's shipping next on the consensus / data-availability roadmap."
          />
          <UpdatesFeed />
        </Card>
      </section>
    </div>
  );
}

function HowToUse({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-[12px] text-zinc-300">
      <Info size={14} className="mt-0.5 shrink-0 text-accent" />
      <span>{children}</span>
    </div>
  );
}
