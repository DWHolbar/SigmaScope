import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/PageHeader";
import { OrgKpis } from "@/components/github/OrgKpis";
import { RepoGrid } from "@/components/github/RepoGrid";
import { LighthouseSpotlight } from "@/components/github/LighthouseSpotlight";
import { getGithubFeed } from "@/lib/github";

export const revalidate = 3600;

export default async function GithubPage() {
  const feed = await getGithubFeed();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tab="Tab 5 · GitHub Intelligence"
        badge="github.com/sigp"
        title="Where Sigma Prime actually ships code."
        description="Real open-source footprint, fetched live from GitHub. Total stars, repo activity, and a deep-dive on Lighthouse: the Rust Ethereum consensus client that is Sigma Prime's flagship product."
        howToUse={
          <>
            Data refreshes hourly via the GitHub REST API. Sort or filter the repo grid using the
            two dropdowns. The Lighthouse spotlight at the bottom carries its own stats, recent
            releases, top contributors, and recent commits, all clickable straight through to
            github.com.
          </>
        }
      />

      <section>
        <OrgKpis feed={feed} />
      </section>

      <section>
        <Card>
          <CardHeader
            title="Public repositories"
            hint="Forks and archived repos hidden. Sort and filter to narrow the list."
          />
          <RepoGrid repos={feed.repos} />
        </Card>
      </section>

      <section>
        <LighthouseSpotlight data={feed.lighthouse} />
      </section>
    </div>
  );
}
