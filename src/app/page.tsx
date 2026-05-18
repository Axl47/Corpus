import { createDatabase } from '@/lib/actions/database';
import { redirect } from 'next/navigation';

export default function HomePage() {
  async function handleCreate(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    if (!name) return;
    const id = await createDatabase(name);
    redirect(`/db/${id}`);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 text-white">Welcome to Notion Clone</h1>
        <p className="text-neutral-400 mb-6">Create a new database to get started.</p>
        
        <form action={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">Database Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required
              placeholder="e.g. Task Tracker" 
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <button type="submit" className="w-full bg-white text-black font-medium py-2 rounded-lg hover:bg-neutral-200 transition-colors">
            Create Database
          </button>
        </form>
      </div>
    </div>
  );
}
