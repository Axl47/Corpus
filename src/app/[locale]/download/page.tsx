import type { Metadata } from "next";
import MarketingShell from "@/components/marketing/MarketingShell";
import DownloadView from "@/components/marketing/DownloadView";
import {
  METADATA_BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_IMAGE,
} from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: "Download",
  description:
    "Download Corpus for Windows, macOS, or Linux. The MCP-Native workspace for vibe coders — now as a native desktop app powered by Tauri.",
  alternates: { canonical: "https://corpus.com/download" },
  openGraph: {
    title: "Download | Corpus",
    description:
      "Download Corpus for Windows, macOS, or Linux. The MCP-Native workspace for vibe coders — now as a native desktop app powered by Tauri.",
    url: "https://corpus.com/download",
    siteName: "Corpus",
    images: [DEFAULT_OG_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Download | Corpus",
    description:
      "Download Corpus for Windows, macOS, or Linux. The MCP-Native workspace for vibe coders — now as a native desktop app powered by Tauri.",
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function DownloadPage() {
  return (
    <MarketingShell>
      <DownloadView />
    </MarketingShell>
  );
}
