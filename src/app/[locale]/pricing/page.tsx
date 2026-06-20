import type { Metadata } from "next";
import MarketingShell from "@/components/marketing/MarketingShell";
import LandingPricing from "@/components/marketing/LandingPricing";
import {
  METADATA_BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_IMAGE,
} from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: "Pricing",
  description:
    "Simple, transparent pricing for Corpus — the MCP-Native workspace for vibe coders. Start free with unlimited pages and databases.",
  alternates: { canonical: "https://corpus.com/pricing" },
  openGraph: {
    title: "Pricing | Corpus",
    description:
      "Simple, transparent pricing for Corpus — the MCP-Native workspace for vibe coders. Start free with unlimited pages and databases.",
    url: "https://corpus.com/pricing",
    siteName: "Corpus",
    images: [DEFAULT_OG_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Corpus",
    description:
      "Simple, transparent pricing for Corpus — the MCP-Native workspace for vibe coders. Start free with unlimited pages and databases.",
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default async function PricingPage() {
  return (
    <MarketingShell>
      <LandingPricing showComparison />
    </MarketingShell>
  );
}
