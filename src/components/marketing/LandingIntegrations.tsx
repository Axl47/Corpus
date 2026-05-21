import { getTranslations } from 'next-intl/server';
import AIMark from './AIMark';

type AIId = 'claude' | 'cursor' | 'windsurf' | 'chatgpt' | 'continue' | 'zed';

const CLIENTS: { id: AIId; name: string; sub: string; descKey: string; status: 'native' | 'beta' }[] = [
  { id: 'claude',   name: 'Claude',   sub: 'Desktop · Sonnet 4.5', descKey: 'bridgeIntClaudeDesc',    status: 'native' },
  { id: 'cursor',   name: 'Cursor',   sub: 'IDE · gpt-5',          descKey: 'bridgeIntCursorDesc',    status: 'native' },
  { id: 'windsurf', name: 'Windsurf', sub: 'IDE · Cascade',        descKey: 'bridgeIntWindsurfDesc',  status: 'native' },
  { id: 'chatgpt',  name: 'ChatGPT',  sub: 'Desktop · 5.0',        descKey: 'bridgeIntChatgptDesc',   status: 'beta'   },
  { id: 'continue', name: 'Continue', sub: 'VS Code · any model',  descKey: 'bridgeIntContinueDesc',  status: 'native' },
  { id: 'zed',      name: 'Zed',      sub: 'Editor · gpt-5',       descKey: 'bridgeIntZedDesc',       status: 'native' },
];

export default async function LandingIntegrations() {
  const t = await getTranslations('Landing');

  return (
    <section id="integrations" className="px-14 py-[110px]">
      <div className="max-w-[1280px] mx-auto">
        {/* section header */}
        <div className="flex items-center gap-3 mb-12">
          <span className="font-mono text-[11px] text-dim uppercase tracking-[0.18em]">
            {t('bridgeIntSnum')}
          </span>
          <span className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* intro */}
        <div className="grid gap-20 mb-16" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <h2
            className="m-0 font-sans font-semibold text-neutral-100 leading-[0.98]"
            style={{ fontSize: 54, letterSpacing: '-0.035em' }}
          >
            {t('bridgeIntH2Part1')}
            <br />
            {t('bridgeIntH2Part2')}{' '}
            <span className="font-serif italic text-accent-strong" style={{ fontSize: 58 }}>
              {t('bridgeIntH2Accent')}
            </span>{' '}
            {t('bridgeIntH2Part3')}
          </h2>
          <p className="m-auto mt-auto text-[16.5px] leading-[1.6] text-neutral-50">
            {t('bridgeIntBody')}
          </p>
        </div>

        {/* 3-column grid of AI client cards */}
        <div className="border border-neutral-800 rounded-lg overflow-hidden grid grid-cols-3">
          {CLIENTS.map((c, i) => (
            <div
              key={c.id}
              className="flex flex-col min-h-[240px] p-8 bg-neutral-950"
              style={{
                borderRight: (i + 1) % 3 !== 0 ? '1px solid var(--color-neutral-800)' : 'none',
                borderBottom: i < 3 ? '1px solid var(--color-neutral-800)' : 'none',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AIMark name={c.id} size={28} />
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-neutral-100 tracking-[-0.015em]">
                    {c.name}
                  </span>
                  <span className="font-mono text-[11px] text-dim tracking-[0.02em]">{c.sub}</span>
                </div>
                <span className="flex-1" />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.08em] px-[7px] py-0.5 rounded-[3px]"
                  style={{
                    color: c.status === 'native' ? 'var(--color-green-400)' : 'var(--color-amber-500)',
                    background: c.status === 'native'
                      ? 'color-mix(in oklab, var(--color-green-400) 14%, transparent)'
                      : 'color-mix(in oklab, var(--color-amber-500) 14%, transparent)',
                  }}
                >
                  {c.status}
                </span>
              </div>
              <p className="m-0 text-sm text-dim leading-[1.6] flex-1">
                {t(c.descKey as Parameters<typeof t>[0])}
              </p>
              <a
                href="#"
                className="mt-[18px] inline-flex items-center gap-1.5 font-mono text-[12px] text-accent-strong"
              >
                {t('bridgeIntSetupLink')}{' '}
                <span aria-hidden className="text-[11px]">→</span>
              </a>
            </div>
          ))}
        </div>

        <p className="mt-[22px] text-[13px] text-dim text-center">
          {t('bridgeIntFootnote').split('@remnus/mcp-sdk')[0]}
          <a href="#" className="font-mono text-accent-strong">@remnus/mcp-sdk</a>
          {t('bridgeIntFootnote').split('@remnus/mcp-sdk')[1]}
        </p>
      </div>
    </section>
  );
}
