import { auth } from '@/auth';
import { getActiveWorkspaceId, getWorkspaceItems } from '@/lib/actions/workspace';
import LandingBridgeSwitcher from '@/components/marketing/LandingBridgeSwitcher';

export default async function HomePage() {
  const session = await auth();

  let appUrl: string | undefined;

  if (session?.user) {
    const workspaceId = await getActiveWorkspaceId();
    if (workspaceId) {
      const items = await getWorkspaceItems(workspaceId);
      if (items.length > 0) {
        const first = items[0];
        appUrl = first.type === 'database' ? `/db/${first.id}` : `/page/${first.id}`;
      }
    }
  }

  return <LandingBridgeSwitcher appUrl={appUrl} />;
}
