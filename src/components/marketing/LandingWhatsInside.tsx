import { getTranslations } from 'next-intl/server';
import ViewTab from './mini/ViewTab';
import KanbanMini from './mini/KanbanMini';
import TableMini from './mini/TableMini';
import CalendarMini from './mini/CalendarMini';
import MarkdownPageMini from './mini/MarkdownPageMini';

export default async function LandingWhatsInside() {
  const t = await getTranslations('Landing');

  return (
    <section className="px-14 py-[110px]">
      <div className="max-w-[1280px] mx-auto">
        {/* section header */}
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-[11px] text-dim uppercase tracking-[0.18em]">
            {t('bridgeInsideSnum')}
          </span>
          <span className="flex-1 h-px bg-neutral-800" />
          <span className="font-mono text-[11px] text-dim">{t('bridgeInsideCaption')}</span>
        </div>

        {/* intro */}
        <div className="grid gap-20 mb-12" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <h2
            className="m-0 font-sans font-semibold text-neutral-100 leading-[0.98]"
            style={{ fontSize: 50, letterSpacing: '-0.035em' }}
          >
            {t('bridgeInsideH2Part1')}
            <br />
            <span className="font-serif italic text-accent-strong" style={{ fontSize: 54 }}>
              {t('bridgeInsideH2Accent')}
            </span>
            {' '}{t('bridgeInsideH2Part2')}
          </h2>
          <p className="m-auto mt-auto text-base leading-[1.6] text-neutral-50">
            {t('bridgeInsideBody')}
          </p>
        </div>

        {/* workspace frame */}
        <div
          className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
          style={{ boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)' }}
        >
          {/* breadcrumb / view bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-800 bg-neutral-850 text-[13px]">
            <span className="text-dim">{t('bridgeInsideBreadcrumb1')}</span>
            <span className="text-neutral-100">{t('bridgeInsideBreadcrumb2')}</span>
            <span className="flex-1" />
            <span className="text-dim text-[12px]">{t('bridgeInsideViewLabel')}</span>
            <span
              className="text-neutral-100 font-medium text-[12.5px] pb-0.5"
              style={{ borderBottom: '1.5px solid var(--color-accent-strong)' }}
            >
              {t('bridgeInsideTabBoard')}
            </span>
            <span className="text-dim text-[12px]">{t('bridgeInsideTabTable')}</span>
            <span className="text-dim text-[12px]">{t('bridgeInsideTabCalendar')}</span>
          </div>

          {/* three view thumbnails */}
          <div className="grid grid-cols-3 gap-4 p-6 min-h-[320px]">
            <ViewTab active label={t('bridgeInsideTabBoard')} sub={t('bridgeInsideTabBoardSub')}>
              <KanbanMini width={340} />
            </ViewTab>
            <ViewTab label={t('bridgeInsideTabTable')} sub={t('bridgeInsideTabTableSub')}>
              <TableMini width={340} rows={6} />
            </ViewTab>
            <ViewTab label={t('bridgeInsideTabCalendar')} sub={t('bridgeInsideTabCalendarSub')}>
              <CalendarMini width={340} />
            </ViewTab>
          </div>

          {/* footer strip */}
          <div className="flex items-center gap-2.5 flex-wrap px-6 py-3.5 border-t border-neutral-800 bg-neutral-850 text-[12.5px] text-dim">
            <span className="w-[7px] h-[7px] rounded-full shrink-0 bg-accent-strong" />
            <span className="text-neutral-100">{t('bridgeInsideFrameFooter1')}</span>
            <span className="flex-1" />
            <span className="font-mono text-accent-strong">{t('bridgeInsideFrameFooter2')}</span>
          </div>
        </div>

        {/* Pages adjunct */}
        <div className="mt-7 grid gap-8 items-stretch" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
          {/* page mini */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-[10px] overflow-hidden flex items-center justify-center p-[18px]">
            <MarkdownPageMini width={520} />
          </div>

          {/* pages copy */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-[10px] flex flex-col px-7 py-7">
            <span className="font-mono text-[11px] text-accent-strong uppercase tracking-[0.12em]">
              {t('bridgeInsidePagesKicker')}
            </span>
            <h3
              className="mt-3 mb-3 font-semibold text-neutral-100 leading-[1.1]"
              style={{ fontSize: 26, letterSpacing: '-0.02em' }}
            >
              {t('bridgeInsidePagesH3')}
            </h3>
            <p className="m-0 text-sm text-dim leading-[1.6] flex-1">
              {t('bridgeInsidePagesBody')}
            </p>
            <div className="mt-[18px] flex items-center gap-2 flex-wrap">
              {['remnus://pages/<id>', 'page.update_content'].map((chip) => (
                <span
                  key={chip}
                  className="font-mono text-[11.5px] text-accent-strong bg-neutral-850 px-2 py-0.5 rounded border border-neutral-800"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* dual-control callout */}
        <div
          className="mt-7 flex items-center gap-4 flex-wrap px-[22px] py-4 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-neutral-50"
          style={{ borderLeft: '3px solid var(--color-blue-500)' }}
        >
          <span className="text-base text-neutral-100 font-medium">{t('bridgeInsideCallout1')}</span>
          <span className="text-dim">{t('bridgeInsideCallout2')}</span>
        </div>
      </div>
    </section>
  );
}
