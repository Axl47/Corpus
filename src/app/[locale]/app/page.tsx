import { auth } from '@/auth';
import { getActiveWorkspaceId, getWorkspaceItems } from '@/lib/actions/workspace';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function AppRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const activeWorkspaceId = await getActiveWorkspaceId();

  let hasWorkspace = false;

  if (activeWorkspaceId) {
    hasWorkspace = true;
    const items = await getWorkspaceItems(activeWorkspaceId);

    if (items.length > 0) {
      const first = items[0];
      if (first.type === 'database' && first.databaseId) {
        redirect(`/db/${first.databaseId}`);
      } else {
        redirect(`/page/${first.id}`);
      }
    }
  }

  const t = await getTranslations('Home');

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6 h-full">
      <Image
        src="/logo-square-transparent.png"
        alt="Remnus"
        width={52}
        height={52}
        className="opacity-20"
      />
      <h2 className="text-base font-medium text-neutral-300">{t('welcomeTitle')}</h2>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
        {hasWorkspace ? t('emptyWorkspaceHint') : t('noWorkspaceHint')}
      </p>
    </div>
  );
}
