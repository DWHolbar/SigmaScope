import type { Topic } from "./topics";

export type TemplateId =
  | "tweet"
  | "thread"
  | "linkedin"
  | "newsletter"
  | "pr-pitch"
  | "blog-outline"
  | "faq"
  | "tool-review";

export type Audience = "engineer" | "founder" | "general";
export type Tone = "technical" | "accessible" | "promotional";
export type Length = "short" | "standard" | "long";

export type StudioInput = {
  topic: Topic;
  audience: Audience;
  tone: Tone;
  length: Length;
};

export type Template = {
  id: TemplateId;
  name: string;
  kind: string;
  description: string;
  render: (input: StudioInput) => string;
};

function pickHook(t: Topic, audience: Audience, tone: Tone): string {
  if (audience === "founder")
    return `If your protocol holds user funds, ${t.name} is on the short list of things you need to know about.`;
  if (audience === "engineer")
    return tone === "technical"
      ? `${t.name}, in one paragraph for engineers.`
      : `Here is what ${t.name} actually does, without the marketing varnish.`;
  return `${t.name}: what it is, why it matters, and what to do about it.`;
}

function softenForFounder(s: string): string {
  return s.replace(/no_std/g, "low-resource");
}

const TWEET: Template = {
  id: "tweet",
  name: "Tweet (single)",
  kind: "social-short",
  description: "One post, 240 to 280 chars, hook + claim + CTA.",
  render: ({ topic, tone, audience }) => {
    const claim = audience === "founder" ? topic.facets.whyItMatters : topic.facets.what;
    const hashtags =
      tone === "promotional"
        ? " #Ethereum #Web3Security"
        : tone === "technical"
          ? " #Ethereum"
          : "";
    const base = `${topic.name}: ${truncate(claim, 200)}.${hashtags}`;
    return truncate(base, 278);
  },
};

const THREAD: Template = {
  id: "thread",
  name: "Twitter thread",
  kind: "social-long",
  description: "6 to 10 numbered tweets: hook, body, summary, CTA.",
  render: ({ topic, audience, tone, length }) => {
    const count = length === "short" ? 6 : length === "long" ? 10 : 8;
    const hookLine = pickHook(topic, audience, tone);

    const bodyPool = [
      `What it is: ${topic.facets.what}`,
      `Why it matters: ${topic.facets.whyItMatters}`,
      `What sets it apart: ${(topic.facets.standout ?? "Built and maintained by Sigma Prime.")}`,
      topic.facets.numbers ? `The numbers: ${topic.facets.numbers}` : null,
      topic.facets.risk ? `The risk: ${topic.facets.risk}` : null,
      topic.facets.cta ? `What to do: ${topic.facets.cta}` : null,
      `For TAMs and founders, this is a conversation that starts before the first audit, not after.`,
      `Sigma Prime's track record on ${topic.kind === "tool" ? "Lighthouse and adjacent infra" : "post-mortem-grade analysis"} is the reason this matters in practice.`,
    ].filter(Boolean) as string[];

    const body = bodyPool.slice(0, count - 2);
    const summary = `In short: ${topic.short}`;
    const cta = `If this is on your roadmap, the SigmaScope archive at sigmascope/intel has the history. Reply or DM to dig deeper.`;

    const tweets = [`1/ ${truncate(hookLine, 270)}`];
    body.forEach((line, i) => tweets.push(`${i + 2}/ ${truncate(line, 270)}`));
    tweets.push(`${tweets.length + 1}/ ${truncate(summary, 270)}`);
    tweets.push(`${tweets.length + 1}/ ${truncate(cta, 270)}`);

    return tweets.join("\n\n");
  },
};

const LINKEDIN: Template = {
  id: "linkedin",
  name: "LinkedIn post",
  kind: "social-pro",
  description: "800 to 1500 chars: hook, 3 paragraphs, takeaway, closing question.",
  render: ({ topic, audience, tone }) => {
    const hook = pickHook(topic, audience, tone);
    const p1 = topic.facets.what;
    const p2 = topic.facets.whyItMatters;
    const p3 = (topic.facets.standout ?? "Built and maintained by Sigma Prime.");
    const takeaway = topic.facets.cta ?? `Worth a closer look if this maps to anything on your roadmap.`;
    const close =
      audience === "founder"
        ? `If you're scoping audit work this quarter, what's the one threat model you wish was settled before the kickoff call?`
        : `What's the underrated piece of this you'd add for someone hearing it for the first time?`;

    return [
      hook,
      "",
      p1,
      "",
      p2,
      "",
      p3,
      "",
      `Takeaway: ${takeaway}`,
      "",
      close,
    ].join("\n");
  },
};

const NEWSLETTER: Template = {
  id: "newsletter",
  name: "Newsletter blurb",
  kind: "long-form",
  description: "200 to 300 words, founder-facing, 'this week in' framing.",
  render: ({ topic, audience, length }) => {
    const paras = [
      `This week, the Web3 security conversation keeps coming back to ${topic.name}. Here's the founder-friendly version.`,
      audience === "engineer" ? topic.facets.what : softenForFounder(topic.facets.what),
      `Why this is on every TAM's desk: ${topic.facets.whyItMatters}`,
      topic.facets.standout
        ? `What sets it apart: ${(topic.facets.standout ?? "Built and maintained by Sigma Prime.")}`
        : "",
      topic.facets.numbers ? `The numbers: ${topic.facets.numbers}` : "",
      topic.facets.cta
        ? `If this is on your roadmap, ${topic.facets.cta.toLowerCase()}`
        : `If this is on your roadmap, the SigmaScope archive has the receipts.`,
    ].filter(Boolean);

    const trimTo = length === "short" ? 4 : length === "long" ? 7 : 5;
    return paras.slice(0, trimTo).join("\n\n");
  },
};

const PR_PITCH: Template = {
  id: "pr-pitch",
  name: "PR / article pitch",
  kind: "long-form",
  description: "Press-pitch format: headline, dateline, lede, 3 body paragraphs, boilerplate.",
  render: ({ topic }) => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return [
      `HEADLINE`,
      `Sigma Prime's TAM team weighs in on ${topic.name}`,
      "",
      `DATELINE`,
      `Sydney, ${today}`,
      "",
      `LEDE`,
      `${topic.facets.whyItMatters}`,
      "",
      `BODY`,
      `${topic.facets.what}`,
      "",
      `${(topic.facets.standout ?? "Built and maintained by Sigma Prime.")}`,
      "",
      `${topic.facets.cta ?? `Sigma Prime's TAM practice is built around making sure conversations like this one start before the engagement, not after.`}`,
      "",
      `ABOUT SIGMA PRIME`,
      `Sigma Prime is an Australian information-security firm building Lighthouse, the Rust Ethereum consensus client, and delivering audit and advisory work to leading Web3 protocols including Chainlink, Dapper Labs, and others.`,
      "",
      `CONTACT`,
      `tam@sigmaprime.io`,
    ].join("\n");
  },
};

const BLOG_OUTLINE: Template = {
  id: "blog-outline",
  name: "Blog post outline",
  kind: "long-form",
  description: "Title, sub-title, 5 to 7 section headings each with bullet sub-points.",
  render: ({ topic, audience }) => {
    const subtitle =
      audience === "founder"
        ? "A founder's guide, in plain language."
        : audience === "engineer"
          ? "A working engineer's notes."
          : "What it is, why it matters, what to do.";

    const sections: { heading: string; bullets: string[] }[] = [
      {
        heading: "1. The setup",
        bullets: [
          `Why ${topic.name} is suddenly on every TAM's desk`,
          "The numbers that opened this conversation",
          "Who in the audience this matters to first",
        ],
      },
      {
        heading: "2. What it actually is",
        bullets: [
          topic.facets.what,
          "How it differs from what came before",
          "The one analogy that makes it click",
        ],
      },
      {
        heading: "3. Why it matters",
        bullets: [
          topic.facets.whyItMatters,
          "The risk if you ignore it",
          topic.facets.numbers ?? "What the historical data shows",
        ],
      },
      {
        heading: "4. The Sigma Prime angle",
        bullets: [
          (topic.facets.standout ?? "Built and maintained by Sigma Prime."),
          "Where this shows up in scoping conversations",
          "What we look for in the threat model",
        ],
      },
      {
        heading: "5. What to do",
        bullets: [
          topic.facets.cta ?? "Three concrete next steps",
          "How to know you're on the right track",
          "Who to talk to next",
        ],
      },
      {
        heading: "6. Closing",
        bullets: [
          "One-sentence takeaway",
          "Link to the SigmaScope archive entry",
          "Soft CTA: scoping conversation",
        ],
      },
    ];

    return [
      `Title: ${topic.name}: what it is, why it matters now`,
      `Subtitle: ${subtitle}`,
      "",
      ...sections.flatMap((s) => [
        s.heading,
        ...s.bullets.map((b) => `  - ${b}`),
        "",
      ]),
    ].join("\n");
  },
};

const FAQ: Template = {
  id: "faq",
  name: "Technical FAQ",
  kind: "reference",
  description: "6 to 10 question-and-answer pairs about the tool, repo, or topic.",
  render: ({ topic, length }) => {
    const qa: { q: string; a: string }[] = [
      { q: `What is ${topic.name}?`, a: topic.facets.what },
      {
        q: `Why does it matter for an Ethereum or Web3 team?`,
        a: topic.facets.whyItMatters,
      },
      {
        q: `What sets it apart from alternatives?`,
        a: (topic.facets.standout ?? "Built and maintained by Sigma Prime."),
      },
      topic.facets.numbers
        ? { q: `What are the numbers?`, a: topic.facets.numbers }
        : null,
      topic.facets.risk
        ? { q: `What's the risk if it goes wrong?`, a: topic.facets.risk }
        : null,
      {
        q: `How does Sigma Prime engage with this?`,
        a: `Sigma Prime maintains direct involvement, either by building the tool (Lighthouse, discv5, ssz_rs) or by treating it as a first-class topic in scoping conversations and threat-model documents.`,
      },
      topic.facets.cta
        ? { q: `What should I do next?`, a: topic.facets.cta }
        : null,
      {
        q: `Where can I learn more?`,
        a: `Start with github.com/sigp and sigmaprime.io. The SigmaScope archive at /intel has post-mortem-grade entries on related incidents.`,
      },
      {
        q: `Who should I talk to?`,
        a: `The Sigma Prime TAM team is the right first contact: tam@sigmaprime.io.`,
      },
    ].filter(Boolean) as { q: string; a: string }[];

    const count = length === "short" ? 6 : length === "long" ? 10 : 8;
    return qa
      .slice(0, count)
      .map((p) => `Q: ${p.q}\nA: ${p.a}`)
      .join("\n\n");
  },
};

const TOOL_REVIEW: Template = {
  id: "tool-review",
  name: "Tool review",
  kind: "reference",
  description: "Overview, standout features, friction points, competitive landscape, verdict.",
  render: ({ topic }) => {
    return [
      `# ${topic.name}: a review`,
      "",
      `## Overview`,
      topic.facets.what,
      "",
      `## Standout features`,
      `- ${(topic.facets.standout ?? "Built and maintained by Sigma Prime.")}`,
      topic.facets.numbers ? `- ${topic.facets.numbers}` : "",
      "",
      `## Friction points`,
      `- Audit and operational maturity matter at least as much as the code quality.`,
      `- Documentation depth varies; for production deployments, expect to read the source.`,
      topic.facets.risk ? `- ${topic.facets.risk}` : "",
      "",
      `## Competitive landscape`,
      topic.kind === "tool"
        ? `Other Ethereum-adjacent implementations exist; client diversity is the design goal. ${topic.name} sits among Prysm, Teku, Nimbus, and Lodestar in the consensus-client landscape, each with its own optimisation profile.`
        : `Other firms work in this space (Trail of Bits, ConsenSys Diligence, OpenZeppelin). Sigma Prime's differentiation is the deep involvement with Lighthouse and Ethereum consensus research.`,
      "",
      `## Verdict`,
      topic.facets.cta ?? `Worth knowing about, worth choosing in the right context, worth a scoping conversation if it intersects your roadmap.`,
    ]
      .filter((s) => s !== "")
      .join("\n");
  },
};

export const TEMPLATES: Template[] = [
  TWEET,
  THREAD,
  LINKEDIN,
  NEWSLETTER,
  PR_PITCH,
  BLOG_OUTLINE,
  FAQ,
  TOOL_REVIEW,
];

export const TEMPLATE_BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}
