import jsPDF from "jspdf";
import type { ScopingInputs, Proposal } from "./proposal";
import type { Threat } from "./threat-models";

const MARGIN = 56;
const PAGE_W = 595;
const PAGE_H = 842;
const CONTENT_W = PAGE_W - MARGIN * 2;

export function generateProposalPdf(
  inputs: ScopingInputs,
  threats: Threat[],
  proposal: Proposal,
): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  function setFont(size: number, weight: "normal" | "bold" = "normal") {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
  }

  function ensureSpace(needed: number) {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function rule() {
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 14;
  }

  function heading(text: string) {
    ensureSpace(34);
    setFont(8, "bold");
    doc.setTextColor(120);
    doc.text(text.toUpperCase(), MARGIN, y);
    doc.setTextColor(20);
    y += 8;
    doc.setDrawColor(20);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y, MARGIN + 18, y);
    y += 14;
  }

  function body(text: string, opts: { size?: number; gap?: number; color?: number } = {}) {
    const size = opts.size ?? 10;
    const gap = opts.gap ?? 4;
    setFont(size);
    doc.setTextColor(opts.color ?? 40);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    ensureSpace(lines.length * (size + 2) + gap);
    doc.text(lines, MARGIN, y);
    y += lines.length * (size + 2) + gap;
  }

  function kv(key: string, value: string) {
    ensureSpace(16);
    setFont(9, "bold");
    doc.setTextColor(60);
    doc.text(key, MARGIN, y);
    setFont(9);
    doc.setTextColor(20);
    doc.text(value, MARGIN + 120, y);
    y += 14;
  }

  function bullet(text: string, indent = 0) {
    setFont(10);
    doc.setTextColor(40);
    const x = MARGIN + indent;
    const lines = doc.splitTextToSize(text, CONTENT_W - 12 - indent);
    ensureSpace(lines.length * 12 + 2);
    doc.text("•", x, y);
    doc.text(lines, x + 10, y);
    y += lines.length * 12 + 2;
  }

  // Header
  setFont(20, "bold");
  doc.setTextColor(20);
  doc.text("Audit Scoping Proposal", MARGIN, y);
  y += 22;
  setFont(9);
  doc.setTextColor(120);
  doc.text(
    `Generated ${new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}  |  SigmaScope`,
    MARGIN,
    y,
  );
  y += 18;
  rule();

  // Inputs
  heading("Engagement profile");
  kv("Protocol type", inputs.type);
  kv("Primary stack", inputs.stack);
  kv("Codebase size", `${inputs.loc} LOC`);
  kv("Upgradeable", inputs.upgradeable ? "Yes" : "No");
  kv(
    "External integrations",
    inputs.integrations.length ? inputs.integrations.join(", ") : "None declared",
  );
  kv("Urgency", inputs.urgency);
  y += 6;

  // Threat model
  heading("Threat model");
  threats.forEach((t) => {
    setFont(10, "bold");
    doc.setTextColor(20);
    ensureSpace(14);
    doc.text(t.vector, MARGIN, y);
    setFont(8);
    doc.setTextColor(120);
    doc.text(t.category, PAGE_W - MARGIN - doc.getTextWidth(t.category), y);
    y += 12;
    body(t.why, { size: 9, color: 80 });
    y += 2;
  });
  y += 4;

  // Engagement
  heading("Engagement outline");
  kv("Duration", `${proposal.weeksLow} to ${proposal.weeksHigh} weeks`);
  kv("Team size", `${proposal.team.length} reviewers`);
  kv("Team mix", proposal.team.join(", "));
  y += 4;

  // Calculation breakdown
  heading("How the week range is derived");
  setFont(9);
  doc.setTextColor(80);
  body(
    `Base: ${proposal.calculation.base.low} to ${proposal.calculation.base.high} weeks for ${inputs.loc} LOC (${proposal.calculation.base.label}).`,
    { size: 9, color: 80 },
  );
  proposal.calculation.steps.forEach((s) => {
    setFont(9, "bold");
    doc.setTextColor(40);
    ensureSpace(12);
    doc.text(s.label, MARGIN, y);
    setFont(9);
    doc.setTextColor(120);
    doc.text(s.delta, PAGE_W - MARGIN - doc.getTextWidth(s.delta), y);
    y += 11;
    body(s.rationale, { size: 9, color: 100 });
    y += 2;
  });
  y += 6;

  // Deliverables
  heading("Deliverables");
  proposal.deliverables.forEach((d) => bullet(d));
  y += 6;

  // Comparable
  if (proposal.comparable) {
    heading("Comparable prior engagement");
    setFont(11, "bold");
    doc.setTextColor(20);
    ensureSpace(14);
    doc.text(proposal.comparable.client, MARGIN, y);
    y += 14;
    body(proposal.comparable.note, { size: 9, color: 80 });
    y += 4;
  }

  // Caveats
  if (proposal.caveats.length) {
    heading("Caveats");
    proposal.caveats.forEach((c) => bullet(c));
    y += 6;
  }

  // Cost band
  heading("Indicative cost band");
  setFont(9);
  doc.setTextColor(80);
  body(
    `${proposal.weeksLow} to ${proposal.weeksHigh} weeks x ${proposal.calculation.teamSize} reviewers x $${proposal.calculation.weekRate.low.toLocaleString()} to $${proposal.calculation.weekRate.high.toLocaleString()} per engineer-week (published industry range).`,
    { size: 9, color: 80 },
  );
  setFont(13, "bold");
  doc.setTextColor(20);
  ensureSpace(20);
  doc.text(
    `$${proposal.calculation.estTotalCostLow.toLocaleString()} to $${proposal.calculation.estTotalCostHigh.toLocaleString()}`,
    MARGIN,
    y,
  );
  y += 22;

  // Disclaimer
  rule();
  setFont(8);
  doc.setTextColor(140);
  body(
    "Disclaimer. These numbers are an industry-anchored estimate from a public-domain heuristic. They are not Sigma Prime pricing and not a binding quote. The per-engineer-week rate band ($25k to $50k) is derived from publicly published audit-firm pricing (Trail of Bits, ConsenSys Diligence, OpenZeppelin, 2022-2024 disclosures). Real engagements vary with code quality, test coverage, design novelty, and prior team context.",
    { size: 8, color: 140 },
  );
  setFont(8);
  doc.setTextColor(160);
  ensureSpace(12);
  doc.text("Generated by SigmaScope. For TAM portfolio demonstration only.", MARGIN, y);

  return doc.output("blob");
}
