import { getTranslations } from 'next-intl/server';

const CODES = [
  'https://remnus.com/register',
  'Workspace Settings → API / MCP Tokens → New token',
  '{"type":"http","url":"https://remnus.com/api/mcp"}',
];

export default async function LandingSetup() {
  const t = await getTranslations('Landing');

  const steps = [
    { num: '01', titleKey: 'bridgeSetup1Title', bodyKey: 'bridgeSetup1Body', code: CODES[0] },
    { num: '02', titleKey: 'bridgeSetup2Title', bodyKey: 'bridgeSetup2Body', code: CODES[1] },
    { num: '03', titleKey: 'bridgeSetup3Title', bodyKey: 'bridgeSetup3Body', code: CODES[2] },
  ] as const;

  return (
    <section className="px-14 py-[110px]">
      <div className="max-w-[1280px] mx-auto">
        {/* section header */}
        <div className="flex items-center gap-3 mb-14">
          <span className="font-mono text-[11px] text-dim uppercase tracking-[0.18em]">
            {t('bridgeSetupSnum')}
          </span>
          <span className="flex-1 h-px bg-neutral-800" />
          <span className="font-mono text-[11px] text-dim">{t('bridgeSetupCaption')}</span>
        </div>

        <h2
          className="m-0 mb-14 font-sans font-semibold text-neutral-100 leading-[0.98]"
          style={{ fontSize: 48, letterSpacing: '-0.035em' }}
        >
          {t('bridgeSetupH2Part1')}{' '}
          <span className="font-serif italic text-accent-strong" style={{ fontSize: 52 }}>
            {t('bridgeSetupH2Accent')}
          </span>{' '}
          {t('bridgeSetupH2Part2')}
        </h2>

        <div className="grid grid-cols-3 gap-0 border border-neutral-800 rounded-lg overflow-hidden">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="flex flex-col p-8 bg-neutral-950"
              style={{ borderLeft: i ? '1px solid var(--color-neutral-800)' : 'none' }}
            >
              <div className="flex items-center gap-3.5 mb-[18px]">
                <span
                  className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 inline-flex items-center justify-center font-mono text-[13px] text-accent-strong font-semibold"
                >
                  {s.num}
                </span>
                <span className="font-mono text-[11px] text-dim uppercase tracking-[0.1em]">
                  {t('bridgeSetupStep')}
                </span>
              </div>
              <h3
                className="m-0 mb-3 font-semibold text-neutral-100"
                style={{ fontSize: 22, letterSpacing: '-0.015em' }}
              >
                {t(s.titleKey)}
              </h3>
              <p className="m-0 text-sm text-dim leading-[1.6] flex-1">
                {t(s.bodyKey)}
              </p>
              <div
                className="mt-5 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded font-mono text-xs text-accent-strong whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {s.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
