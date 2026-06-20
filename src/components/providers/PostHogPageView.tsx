'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { usePostHog } from 'posthog-js/react';
import { IS_POSTHOG_CONFIGURED } from './PostHogProvider';

interface Props {
  skip?: boolean;
}

function PostHogPageViewContent({ skip }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!IS_POSTHOG_CONFIGURED) return;
    if (skip) return;

    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthog, skip]);

  return null;
}

export default function PostHogPageView({ skip }: Props) {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewContent skip={skip} />
    </Suspense>
  );
}
