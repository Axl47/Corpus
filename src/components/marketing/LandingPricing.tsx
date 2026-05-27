import { getTranslations } from 'next-intl/server';
import LandingChip from './LandingChip';

export default async function LandingPricing() {
  const t = await getTranslations('Landing');

  const startupFeatures = [
    t('bridgePricingStartupF1'),
    t('bridgePricingStartupF2'),
    t('bridgePricingStartupF3'),
    t('bridgePricingStartupF4'),
    t('bridgePricingStartupF5'),
  ];
  const proFeatures = [
    t('bridgePricingProF1'),
    t('bridgePricingProF2'),
    t('bridgePricingProF3'),
    t('bridgePricingProF4'),
    t('bridgePricingProF5'),
  ];
  const freeFeatures = [
    t('bridgePricingFreeF1'),
    t('bridgePricingFreeF2'),
    t('bridgePricingFreeF3'),
    t('bridgePricingFreeF4'),
    t('bridgePricingFreeF5'),
  ];
  const ossFeatures = [
    t('bridgePricingSelfF1'),
    t('bridgePricingSelfF3'),
    t('bridgePricingSelfF5'),
  ];

  return (
    <section id="pricing" className="px-4 sm:px-8 lg:px-14 py-16 lg:py-27.5">

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-10 lg:mb-12">
          <span className="font-mono text-[11px] text-dim uppercase tracking-[0.18em]">
            {t('bridgePricingSnum')}
          </span>
          <span className="flex-1 h-px bg-neutral-800" />
        </div>

        <h2
          className="m-0 font-sans font-semibold text-neutral-100 leading-[0.98] text-[30px] sm:text-[36px] lg:text-[44px]"
          style={{ letterSpacing: '-0.035em' }}
        >
          {t('bridgePricingH2Part1')}{' '}
          <span className="font-serif italic text-accent-strong text-[34px] sm:text-[40px] lg:text-[48px]">
            {t('bridgePricingH2Accent')}
          </span>
        </h2>
      </div>

      {/* Paid plan cards — 2 columns */}
      <div className="max-w-275 mx-auto mt-10 lg:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 items-start">

          {/* ── Startup — featured ── */}
          <div
            className="flex flex-col p-6 lg:p-8 rounded-xl border sm:-mt-3 sm:pb-10"
            style={{
              background: 'linear-gradient(160deg, rgba(68,92,149,0.14) 0%, rgba(28,30,38,1) 55%)',
              borderColor: 'rgba(68,92,149,0.5)',
              boxShadow: '0 0 0 1px rgba(68,92,149,0.15) inset, 0 24px 56px -16px rgba(68,92,149,0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-neutral-100 text-[20px] lg:text-[22px]" style={{ letterSpacing: '-0.018em' }}>
                {t('bridgePricingStartupTitle')}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                style={{ background: 'var(--color-blue-500)' }}
              >
                {t('bridgePricingStartupTag')}
              </span>
            </div>

            <p className="m-0 mb-6 text-dim text-[13px] leading-[1.6]">{t('bridgePricingStartupSub')}</p>

            <div className="mb-2 flex items-center gap-2.5">
              <span className="font-mono text-[12px] text-dim line-through">{t('bridgePricingStartupOriginalPrice')}</span>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded"
                style={{ color: 'var(--color-amber-500)', background: 'rgba(204,125,69,0.13)' }}
              >
                {t('bridgePricingStartupDiscountLabel')}
              </span>
            </div>
            <div className="mb-6 flex items-end gap-2">
              <span
                className="font-sans font-bold text-neutral-100 text-[48px] lg:text-[56px]"
                style={{ letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                {t('bridgePricingStartupPrice')}
              </span>
              <span className="font-mono text-[12px] text-dim mb-1.5">{t('bridgePricingStartupPriceSub')}</span>
            </div>

            <div className="h-px mb-5" style={{ background: 'rgba(68,92,149,0.35)' }} />

            <ul className="flex flex-col gap-2.5 flex-1 mb-6">
              {startupFeatures.map((feat) => (
                <li key={feat} className="flex gap-2.5 items-start text-[13.5px] text-neutral-100">
                  <CheckIcon color="var(--color-blue-500)" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-[13.5px] font-semibold text-white transition-colors duration-150"
              style={{ background: 'var(--color-blue-500)' }}
            >
              {t('bridgePricingStartupCta')}
              <span aria-hidden>→</span>
            </button>
          </div>

          {/* ── Professional ── */}
          <div
            className="flex flex-col p-6 lg:p-8 rounded-xl border border-neutral-800"
            style={{ background: 'linear-gradient(160deg, rgba(68,92,149,0.06) 0%, transparent 50%)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-neutral-100 text-[20px] lg:text-[22px]" style={{ letterSpacing: '-0.018em' }}>
                {t('bridgePricingProTitle')}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  color: 'var(--color-accent-strong)',
                  border: '1px solid rgba(68,92,149,0.45)',
                  background: 'rgba(68,92,149,0.1)',
                }}
              >
                {t('bridgePricingProTag')}
              </span>
            </div>

            <p className="m-0 mb-6 text-dim text-[13px] leading-[1.6]">{t('bridgePricingProSub')}</p>

            <div className="mb-6 flex items-end gap-2">
              <span
                className="font-sans font-bold text-neutral-100 text-[48px] lg:text-[56px]"
                style={{ letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                {t('bridgePricingProPrice')}
              </span>
              <span className="font-mono text-[12px] text-dim mb-1.5">{t('bridgePricingProPriceSub')}</span>
            </div>

            <div className="h-px bg-neutral-800 mb-5" />

            <ul className="flex flex-col gap-2.5 flex-1 mb-6">
              {proFeatures.map((feat) => (
                <li key={feat} className="flex gap-2.5 items-start text-[13.5px] text-neutral-50">
                  <CheckIcon color="var(--color-accent-strong)" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-neutral-700 text-[13.5px] font-medium text-neutral-100 hover:border-neutral-500 transition-colors duration-150"
            >
              {t('bridgePricingProCta')}
              <span aria-hidden>→</span>
            </button>
          </div>

        </div>

        {/* ── Free + Open Source horizontal box ── */}
        <div className="mt-4 lg:mt-5 rounded-xl border border-neutral-800 overflow-hidden">

          {/* Free hosted tier */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8 p-6 lg:p-8 bg-neutral-900">
            {/* Title + price */}
            <div className="shrink-0 min-w-[120px]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-semibold text-neutral-100 text-[20px] lg:text-[22px]" style={{ letterSpacing: '-0.018em' }}>
                  {t('bridgePricingFreeTitle')}
                </span>
                <LandingChip color="var(--color-green-400)" mono dot>
                  {t('bridgePricingFreeTag')}
                </LandingChip>
              </div>
              <span
                className="font-sans font-bold text-neutral-100 text-[40px] lg:text-[48px]"
                style={{ letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                {t('bridgePricingFreePrice')}
              </span>
            </div>

            {/* Vertical divider (desktop) */}
            <div className="hidden lg:block w-px self-stretch bg-neutral-800 shrink-0" />
            {/* Horizontal divider (mobile) */}
            <div className="lg:hidden h-px bg-neutral-800" />

            {/* Features */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2.5 flex-1">
              {freeFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-1.5 text-[13px] text-neutral-50">
                  <CheckIcon color="var(--color-green-400)" />
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="shrink-0">
              <button
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors duration-150"
                style={{ background: 'var(--color-green-400)', color: '#1d1f23' }}
              >
                {t('bridgePricingFreeCta')}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-800" />

          {/* Open Source row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 px-6 lg:px-8 py-4 lg:py-5 bg-neutral-850">
            {/* Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <GithubIcon size={16} />
              <span className="font-semibold text-neutral-100 text-[14px]">{t('bridgePricingSelfTitle')}</span>
            </div>

            {/* Subtitle */}
            <p className="m-0 text-[12.5px] text-dim shrink-0">{t('bridgePricingSelfSub')}</p>

            {/* OSS feature highlights */}
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 flex-1">
              {ossFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-1.5 text-[12px] text-dim">
                  <CheckIcon color="var(--color-neutral-50)" />
                  {feat}
                </li>
              ))}
            </ul>

            {/* GitHub link */}
            <a
              href="https://github.com/Ranork/remnus-app"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-[13px] text-neutral-50 hover:border-neutral-500 hover:text-neutral-100 transition-colors duration-150"
            >
              <GithubIcon size={13} />
              {t('bridgePricingSelfCta')}
              <span aria-hidden className="text-dim text-[11px]">↗</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M5 12l5 5 9-12" />
    </svg>
  );
}

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.4 3.4 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77a5 5 0 0 0-.09-3.77S18.73.65 16 2.48a13 13 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5 5 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.4 3.4 0 0 0 9 18.13V22" />
    </svg>
  );
}
