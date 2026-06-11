import { PageHeader } from "@/components/PageHeader";
import { StudioForm } from "@/components/studio/StudioForm";

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tab="Tab 6 · Content Studio"
        badge="Eight templates, fifteen topics"
        title="The other half of the TAM job: producing the words."
        description="A TAM doesn't just close audits. They write the tweets that announce them, the LinkedIn posts that explain them, the newsletters that contextualise them, and the FAQs founders quote back at engineering. This tab is that workflow, made interactive."
        howToUse={
          <>
            Pick a template, pick a topic from Sigma Prime's actual orbit (Lighthouse, hacks like
            Bybit, EIPs like 7702, TAM workflows), pick an audience and tone, and a first draft
            renders on the right. Edit in place; export as{" "}
            <span className="mono text-accent">.txt</span>,{" "}
            <span className="mono text-accent">.md</span>, or{" "}
            <span className="mono text-accent">.pdf</span>; or copy to clipboard. Drafts are
            deterministic, not LLM-generated; they're a polished starting point, not the
            finished article.
          </>
        }
      />
      <StudioForm />
    </div>
  );
}
