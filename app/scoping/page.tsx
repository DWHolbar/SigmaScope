import { PageHeader } from "@/components/PageHeader";
import { ScopingForm } from "@/components/scoping/ScopingForm";

export default function ScopingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tab="Tab 3 · Audit Scoping Simulator"
        badge="Client conversation tool"
        title="The first conversation, simulated."
        description="What a TAM does on day one: take a founder's rough description, map it to the right threat model, and propose an engagement they can actually defend internally. This tool runs the same flow against a small library of templates and Sigma Prime's real prior clients."
        howToUse={
          <>
            Click through all five inputs on the left (protocol, stack, codebase size, upgradeable,
            timeline). The threat model and engagement outline render on the right (or below on
            mobile) the moment the last input is set. Hit{" "}
            <span className="mono text-accent">PDF</span> to export a professional one-pager.
          </>
        }
      />
      <ScopingForm />
    </div>
  );
}
