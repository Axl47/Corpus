'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

interface Props {
  user: {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export default function PostHogIdentify({ user }: Props) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    if (user) {
      if (user.role === 'admin') {
        posthog.opt_out_capturing();
        return;
      } else {
        if (posthog.has_opted_out_capturing()) {
          posthog.opt_in_capturing();
        }
      }

      // Identify user in PostHog and attach role & name properties
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role, // 'demo' | 'user' | 'admin'
      });
    } else {
      // Clear identity on sign out
      posthog.reset();
      if (posthog.has_opted_out_capturing()) {
        posthog.opt_in_capturing();
      }
    }
  }, [user, posthog]);

  return null;
}
