import { getTranslations } from 'next-intl/server';
import LandingChip from './LandingChip';

export default async function LandingPricing() {
  const t = await getTranslations('Landing');

  const selfFeatures = [
    t('bridgePricingSelfF1'),
    t('bridgePricingSelfF2'),
    t('bridgePricingSelfF3'),
    t('bridgePricingSelfF4'),
    t('bridgePricingSelfF5'),
  ];
  const teamFeatures = [
    t('bridgePricingTeamF1'),
    t('bridgePricingTeamF2'),
    t('bridgePricingTeamF3'),
    t('bridgePricingTeamF4'),
    t('bridgePricingTeamF5'),
  ];

  return (
    <section id="pricing" className="px-14 py-[110px]">
      <div className="max-w-[1100px] mx-auto">
        {/* section header */}
        <div className="flex items-center gap-3 mb-12">
          <span className="font-mono text-[11px] text-dim uppercase tracking-[0.18em]">
            {t('bridgePricingSnum')}
          </span>
          <span className="flex-1 h-px bg-neutral-800" />
        </div>

        <h2
          className="m-0 mb-9 font-sans font-semibold text-neutral-100 leading-[0.98]"
          style={{ fontSize: 44, letterSpacing: '-0.035em' }}
        >
          {t('bridgePricingH2Part1')}{' '}
          <span className="font-serif italic text-accent-strong" style={{ fontSize: 48 }}>
            {t('bridgePricingH2Accent')}
          </span>
        </h2>

        <div className="grid grid-cols-2 gap-0 border border-neutral-800 rounded-lg overflow-hidden">
          {/* Self-hosted */}
          <div className="flex flex-col p-9 border-r border-neutral-800">
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className="font-semibold text-neutral-100"
                style={{ fontSize: 26, letterSpacing: '-0.02em' }}
              >
                {t('bridgePricingSelfTitle')}
              </span>
              <LandingChip color="var(--color-green-400)" mono dot>
                {t('bridgePricingSelfTag')}
              </LandingChip>
            </div>
            <p className="m-0 mb-6 text-dim text-[14.5px]">{t('bridgePricingSelfSub')}</p>

            <div
              className="font-sans font-semibold text-neutral-100 leading-[0.98] mb-3"
              style={{ fontSize: 60, letterSpacing: '-0.035em' }}
            >
              {t('bridgePricingSelfPrice')}
            </div>

            <hr className="border-none border-t border-neutral-800 my-[18px]" />

            <div className="flex flex-col">
              {selfFeatures.map((feat) => (
                <div key={feat} className="flex gap-2.5 items-center text-sm text-neutral-50 py-1.5">
                  <CheckIcon color="var(--color-green-400)" />
                  {feat}
                </div>
              ))}
            </div>

            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-neutral-800 text-[13.5px] text-neutral-50 hover:border-neutral-100 transition-colors duration-150 self-start"
            >
              <GithubIcon />
              {t('bridgePricingSelfCta')}
            </a>
          </div>

          {/* Team */}
          <div
            className="flex flex-col p-9"
            style={{ background: 'linear-gradient(180deg, rgba(68,92,149,0.07), transparent)' }}
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className="font-semibold text-neutral-100"
                style={{ fontSize: 26, letterSpacing: '-0.02em' }}
              >
                {t('bridgePricingTeamTitle')}
              </span>
              <LandingChip color="var(--color-accent-strong)" mono dot>
                {t('bridgePricingTeamTag')}
              </LandingChip>
            </div>
            <p className="m-0 mb-6 text-dim text-[14.5px]">{t('bridgePricingTeamSub')}</p>

            <div
              className="font-sans font-semibold text-neutral-100 leading-[0.98] mb-3"
              style={{ fontSize: 60, letterSpacing: '-0.035em' }}
            >
              {t('bridgePricingTeamPrice')}
              <span className="font-serif italic font-normal" style={{ fontSize: 24 }}>
                {' '}{t('bridgePricingTeamPriceSub')}
              </span>
            </div>

            <hr className="border-none border-t border-neutral-800 my-[18px]" />

            <div className="flex flex-col">
              {teamFeatures.map((feat) => (
                <div key={feat} className="flex gap-2.5 items-center text-sm text-neutral-50 py-1.5">
                  <CheckIcon color="var(--color-accent-strong)" />
                  {feat}
                </div>
              ))}
            </div>

            <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-500 hover:bg-accent-strong text-white text-[13.5px] font-medium transition-colors duration-150 self-start">
              {t('bridgePricingTeamCta')}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M5 12l5 5 9-12" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.4 3.4 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77a5 5 0 0 0-.09-3.77S18.73.65 16 2.48a13 13 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5 5 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.4 3.4 0 0 0 9 18.13V22" />
    </svg>
  );
}
