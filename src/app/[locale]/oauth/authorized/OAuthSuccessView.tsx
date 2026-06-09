'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Props {
  to: string;
  successTitle: string;
  successMessage: string;
  successClose: string;
}

export function OAuthSuccessView({ to, successTitle, successMessage, successClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.replace(to);
    }, 1200);
    return () => clearTimeout(timer);
  }, [to]);

  return (
    <div className="w-full max-w-sm text-center">
      <Link href="/" className="inline-flex flex-col items-center hover:opacity-80 transition-opacity mb-8">
        <img
          src="/logo-square-dark.png"
          alt="Remnus"
          className="w-14 h-14 object-contain rounded-xl shadow-lg"
        />
      </Link>

      <div className="w-14 h-14 bg-green-400/15 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="#7fc36d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-white font-semibold text-lg mb-2">{successTitle}</h1>
      <p className="text-neutral-400 text-sm mb-4">{successMessage}</p>
      <p className="text-neutral-600 text-xs">{successClose}</p>
    </div>
  );
}
