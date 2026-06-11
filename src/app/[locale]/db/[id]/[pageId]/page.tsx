import { getPage } from '@/lib/actions/page';
import { getDatabase } from '@/lib/actions/database';
import { getSubItems } from '@/lib/actions/workspace';
import { getCurrentUser } from '@/lib/auth/session';
import PageEditor from '@/components/features/PageEditor';
import NotFoundRedirect from '@/components/features/NotFoundRedirect';

export default async function PageDetail(props: { params: Promise<{ id: string, pageId: string }> }) {
  const params = await props.params;
  const [db, page, subItems, user] = await Promise.all([
    getDatabase(params.id),
    getPage(params.pageId),
    getSubItems(params.pageId),
    getCurrentUser(),
  ]);

  if (!db || !page) return <NotFoundRedirect />;

  return (
    <div className="flex-1 overflow-auto bg-neutral-850">
      <PageEditor database={db} initialPage={page} subItems={subItems} isAdmin={user.role === 'admin'} />
    </div>
  );
}
