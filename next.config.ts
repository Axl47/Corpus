import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Raise the Next.js proxy body limit for /api/upload (kind=file accepts up to
  // 25 MB attachments). The Notion import route receives only a JSON payload —
  // the ZIP is parsed entirely in the browser and never sent to the server.
  experimental: {
    proxyClientMaxBodySize: '30mb',
  },
};

const intlConfig = withNextIntl(nextConfig);

// Only apply the PWA wrapper in production so Turbopack runs unobstructed in dev.
// withPWA injects webpack plugins even when `disable: true`, which prevents
// Next.js from selecting Turbopack and causes significantly slower recompilation.
export default process.env.NODE_ENV === 'production'
  ? withPWAInit({
      dest: 'public',
      cacheOnFrontEndNav: true,
      reloadOnOnline: true,
      workboxOptions: { disableDevLogs: true },
    })(intlConfig)
  : intlConfig;
