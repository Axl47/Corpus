'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { acceptInvite } from '@/lib/actions/invites';

// Auto-accepts the invite for an already-logged-in user, then sends them to the app.
export default function InviteAcceptClient({ token }: { token: string }) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = false;
    acceptInvite(token)
      .then((r) => {
        if (done) return;
        if (r.ok) { router.push('/app'); router.refresh(); }
        else setError(r.error ?? t('inviteErrorGeneric'));
      })
      .catch(() => setError(t('inviteErrorGeneric')));
    return () => { done = true; };
  }, [token, router, t]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-400">
      <Loader2 size={16} className="animate-spin" /> {t('inviteAccepting')}
    </div>
  );
}
