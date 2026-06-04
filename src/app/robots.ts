import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/contact', '/download', '/privacy', '/share/'],
        disallow: ['/app', '/db/', '/page/', '/admin/', '/api/', '/login', '/client-login', '/tauri-app'],
      },
    ],
    sitemap: 'https://remnus.com/sitemap.xml',
  };
}
