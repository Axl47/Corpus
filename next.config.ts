import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Raise the Next.js proxy body limit for file uploads (/api/upload accepts up
  // to 25 MB attachments). NOTE: on Vercel the platform still caps serverless
  // function request bodies at ~4.5 MB regardless of this setting — large Notion
  // imports avoid that by parsing the ZIP in the browser and never uploading it.
  experimental: {
    proxyClientMaxBodySize: '30mb',
  },
};

export default withPWA(withNextIntl(nextConfig));
