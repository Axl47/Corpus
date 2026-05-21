import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { readFileSync } from 'fs';
import { join } from 'path';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const isDev = process.env.NODE_ENV === 'development';
  const messages = isDev
    ? JSON.parse(readFileSync(join(process.cwd(), 'messages', `${locale}.json`), 'utf8'))
    : (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages };
});
