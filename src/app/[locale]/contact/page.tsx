import type { Metadata } from 'next';
import MarketingShell from '@/components/marketing/MarketingShell';
import ContactSection from '@/components/marketing/ContactSection';
import { METADATA_BASE_URL, DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '@/lib/metadata';

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: 'Contact',
  description: 'Get in touch with the Remnus team. Questions about MCP integration, enterprise plans, or self-hosting? We\'re here to help.',
  alternates: { canonical: 'https://remnus.com/contact' },
  openGraph: {
    title: 'Contact | Remnus',
    description: 'Get in touch with the Remnus team. Questions about MCP integration, enterprise plans, or self-hosting? We\'re here to help.',
    url: 'https://remnus.com/contact',
    siteName: 'Remnus',
    images: [DEFAULT_OG_IMAGE],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Remnus',
    description: 'Get in touch with the Remnus team. Questions about MCP integration, enterprise plans, or self-hosting? We\'re here to help.',
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <ContactSection />
    </MarketingShell>
  );
}
