import { Card, CardHeader } from "@/components/ui/Card";
import { ClientDiversityChart } from "@/components/network/ClientDiversityChart";
import { ParticipationGauge } from "@/components/network/ParticipationGauge";
import { LiveSlotTicker } from "@/components/network/LiveSlotTicker";
import { LighthouseHighlights } from "@/components/network/LighthouseHighlights";
import { UpdatesFeed } from "@/components/network/UpdatesFeed";
import { PageHeader } from "@/components/PageHeader";
import { getBeaconSnapshot } from "@/lib/beacon";

export const revalidate = 30;

export default async function NetworkPulsePage() {
  const snap = await getBeaconSnapshot();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tab="Tab 1 · Network Pulse"
        badge="Sigma Prime · Lighthouse"
        title="Ethereum consensus, in the language Sigma Prime built it in."
        description="Slots, epochs, validator participation, and client diversity, the primitives a Technical Account Manager walks a founder through before the first audit conversation. Lighthouse, Sigma Prime's Rust consensus client, is highlighted throughout."
        howToUse="Slot and epoch tick forward live (computed from beacon-chain genesis, no API needed). Participation and client diversity are sourced from public APIs and snapshots; the badges below the stats label the source."
      />

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
            hint="Higher means more validators are attesting on time."
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
            hint="What's shipping next on the consensus and data-availability roadmap."
          />
          <UpdatesFeed />
        </Card>
      </section>
    </div>
  );
}
