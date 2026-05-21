import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function LandingFooter() {
  const t = await getTranslations('Landing');
  const year = new Date().getFullYear();

  const cols = [
    {
      head: t('bridgeFooterColProduct'),
      links: [
        { label: t('bridgeFooterProductFeatures'),  href: '#' },
        { label: t('bridgeFooterProductTemplates'), href: '#' },
        { label: t('bridgeFooterProductChangelog'), href: '#' },
        { label: t('bridgeFooterProductRoadmap'),   href: '#' },
      ],
    },
    {
      head: t('bridgeFooterColIntegrations'),
      links: [
        { label: 'Claude',   href: '#' },
        { label: 'Cursor',   href: '#' },
        { label: 'Windsurf', href: '#' },
        { label: 'ChatGPT',  href: '#' },
      ],
    },
    {
      head: t('bridgeFooterColProtocol'),
      links: [
        { label: t('bridgeFooterProtocolMcp'),       href: '#' },
        { label: t('bridgeFooterProtocolTools'),     href: '#' },
        { label: t('bridgeFooterProtocolResources'), href: '#' },
        { label: t('bridgeFooterProtocolSdk'),       href: '#' },
      ],
    },
    {
      head: t('bridgeFooterColCompany'),
      links: [
        { label: t('bridgeFooterCompanyManifesto'), href: '#'        },
        { label: t('bridgeFooterCompanyPricing'),   href: '#pricing' },
        { label: t('bridgeFooterCompanyContact'),   href: '#'        },
        { label: t('bridgeFooterCompanyPrivacy'),   href: '#'        },
      ],
    },
  ];

  return (
    <footer className="px-14 py-16 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto grid gap-16" style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr' }}>
        {/* Left: logo + tagline + copyright */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image src="/logo-square-transparent.png" alt="Remnus" width={22} height={22} />
            <span className="font-semibold text-neutral-100 text-[15px] tracking-[-0.01em]">Remnus</span>
          </Link>
          <p className="text-[13.5px] text-dim leading-[1.55] max-w-55">
            {t('bridgeFooterTagline')}
          </p>
          <span className="font-mono text-[11px] text-dimmer mt-auto">
            {t('bridgeFooterCopyright', { year })}
          </span>
        </div>

        {/* 4 link columns */}
        {cols.map((col) => (
          <div key={col.head} className="flex flex-col gap-3">
            <span className="font-mono text-[11px] text-dim uppercase tracking-[0.12em] mb-1">
              {col.head}
            </span>
            {col.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[13.5px] text-neutral-50 hover:text-neutral-100 transition-colors duration-150"
              >
                {l.label}
              </a>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
