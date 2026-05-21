import LandingNav from './LandingNav';
import LandingHero from './LandingHero';
import LandingWhy from './LandingWhy';
import LandingWhatsInside from './LandingWhatsInside';
import LandingIntegrations from './LandingIntegrations';
import LandingSetup from './LandingSetup';
import LandingTools from './LandingTools';
import LandingPricing from './LandingPricing';
import LandingClosing from './LandingClosing';
import LandingFooter from './LandingFooter';

export default function LandingBridgeSwitcher({ appUrl }: { appUrl?: string }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <LandingNav appUrl={appUrl} />
      <main>
        <LandingHero />
        <LandingWhy />
        <LandingWhatsInside />
        <LandingIntegrations />
        <LandingSetup />
        <LandingTools />
        <LandingPricing />
        <LandingClosing />
      </main>
      <LandingFooter />
    </div>
  );
}
