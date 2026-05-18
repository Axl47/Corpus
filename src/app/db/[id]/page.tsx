import { getDatabase } from '@/lib/actions/database';
import { getPages } from '@/lib/actions/page';
import { notFound } from 'next/navigation';
import TableView from '@/components/features/TableView';

export default async function DatabasePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const db = await getDatabase(params.id);
  
  if (!db) return notFound();

  const pages = await getPages(params.id);

  return (
    <div className="flex-1 overflow-auto bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">{db.name}</h1>
        <TableView database={db} initialPages={pages} />
      </div>
    </div>
  );
}
