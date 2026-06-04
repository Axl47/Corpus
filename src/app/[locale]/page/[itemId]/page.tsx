import { getStandalonePageByItemId, getSubItems } from '@/lib/actions/workspace';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import StandalonePageEditor from '@/components/features/StandalonePageEditor';

export default async function StandalonePageRoute(
  props: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await props.params;
  const [data, subItems, user] = await Promise.all([
    getStandalonePageByItemId(itemId),
    getSubItems(itemId),
    getCurrentUser(),
  ]);
  if (!data || !data.page) return notFound();

  return (
    <div className="flex-1 overflow-auto bg-neutral-850">
      <StandalonePageEditor
        item={data.item}
        page={data.page}
        subItems={subItems}
        isAdmin={user.role === 'admin'}
      />
    </div>
  );
}
