import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MarketingShell from '@/components/marketing/MarketingShell';
import { KeyRound, Bot, ShieldCheck, ListChecks, FileText, Mail } from 'lucide-react';
import { METADATA_BASE_URL, DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '@/lib/metadata';

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: 'Security & Authentication',
  description: 'How Remnus authenticates users and AI agents — Google/GitHub OAuth, MCP Personal Access Tokens, OAuth 2.1 + PKCE, token scopes, and responsible disclosure.',
  alternates: { canonical: 'https://remnus.com/security' },
  openGraph: {
    title: 'Security & Authentication | Remnus',
    description: 'How Remnus authenticates users and AI agents — OAuth, MCP tokens, PKCE, audit logs, and responsible disclosure.',
    url: 'https://remnus.com/security',
    siteName: 'Remnus',
    images: [DEFAULT_OG_IMAGE],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Security & Authentication | Remnus',
    description: 'How Remnus authenticates users and AI agents — OAuth, MCP tokens, PKCE, audit logs, and responsible disclosure.',
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default async function SecurityPage() {
  const t = await getTranslations('Security');

  const sections = [
    {
      icon: KeyRound,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      title: t('loginTitle'),
      body: t('loginBody'),
      badge: 'Google · GitHub',
    },
    {
      icon: Bot,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      title: t('patTitle'),
      body: t('patBody'),
      badge: 'rmns_…',
    },
    {
      icon: ShieldCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      title: t('oauthTitle'),
      body: t('oauthBody'),
      badge: 'RFC 9728 · PKCE S256',
    },
    {
      icon: ListChecks,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      title: t('scopesTitle'),
      body: t('scopesBody'),
      badge: 'read · write',
    },
    {
      icon: FileText,
      color: 'text-neutral-400',
      bg: 'bg-neutral-700/30',
      title: t('auditTitle'),
      body: t('auditBody'),
      badge: null,
    },
    {
      icon: Mail,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      title: t('disclosureTitle'),
      body: t('disclosureBody'),
      badge: null,
    },
  ];

  return (
    <MarketingShell>
      <section className="px-4 sm:px-8 lg:px-14 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-blue-400 border border-blue-500/20 bg-blue-500/5 px-3 py-1 rounded-full mb-6">
              <ShieldCheck size={11} />
              Security
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-100 mb-4 tracking-tight">
              {t('title')}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mb-8">
              {t('lastUpdated')}
            </p>
            <p className="text-neutral-300 text-[14.5px] leading-relaxed max-w-2xl mx-auto">
              {t('intro')}
            </p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-5">
            {sections.map(({ icon: Icon, color, bg, title, body, badge }) => (
              <div
                key={title}
                className="p-6 sm:p-8 border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700/80 transition-colors duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-9 w-9 items-center justify-center shrink-0 ${bg} ${color} mt-0.5`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h2 className="text-base font-semibold text-neutral-100">{title}</h2>
                      {badge && (
                        <span className="font-mono text-[10px] text-neutral-500 border border-neutral-700 px-2 py-0.5">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-300 text-[13.5px] leading-[1.7]">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Token flow diagram */}
          <div className="mt-12 border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8">
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-6">OAuth 2.1 + PKCE flow</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 text-[12px] font-mono text-neutral-400 overflow-x-auto">
              {[
                'Claude Desktop',
                '/oauth/authorize',
                'Browser Login',
                '/api/oauth/token',
                '/api/mcp',
              ].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="border border-neutral-700 bg-neutral-800/60 px-3 py-1.5 whitespace-nowrap text-neutral-300">
                    {step}
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-neutral-600 hidden sm:block">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
