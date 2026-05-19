import { db } from '@/db';
import { workspaces, workspaceItems, standalonePages, databases, pages, workspaceMembers } from '@/db/schema';

export async function createSeedWorkspace(userId: string) {
  // 1. Create a workspace
  const workspaceId = crypto.randomUUID();
  await db.insert(workspaces).values({
    id: workspaceId,
    name: 'Personal Workspace',
    sortOrder: 0,
  });

  // 2. Add the user as owner
  await db.insert(workspaceMembers).values({
    id: crypto.randomUUID(),
    workspaceId,
    userId,
    role: 'owner',
  });

  // 3. Create a "Getting Started" Standalone Page
  const pageItemId = crypto.randomUUID();
  const pageId = crypto.randomUUID();
  await db.insert(workspaceItems).values({
    id: pageItemId,
    workspaceId,
    type: 'page',
    title: '👋 Welcome to Remna',
    sortOrder: 0,
    icon: '👋',
    iconColor: 'default',
  });

  await db.insert(standalonePages).values({
    id: pageId,
    itemId: pageItemId,
    content: `## Welcome to your new workspace! 🚀

Remna is a Notion-like application built around a **workspace** model. You can create standalone pages and fully customizable databases side-by-side.

### Quick Tips:
1. **Sidebar Navigation**: Use the sidebar to switch between workspaces, open pages, or create new ones using templates.
2. **Interactive Databases**: Below you'll find a **Tasks** database. Databases support Table, Kanban, and Calendar views!
3. **Slash Commands**: In any page editor or description, press \`/\` to open the command menu for headers, lists, code blocks, and more.
4. **Custom Icons**: Click the page/database icons in the sidebar or at the top of the editors to select emojis or Lucide icons with custom theme colors.
5. **Reorderable Sidebar**: You can now **drag and drop** both your Workspaces and Sidebar Items to organize them exactly how you like!

Have fun organizing your ideas! 💡
`,
  });

  // 4. Create an example "Tasks" Database
  const dbItemId = crypto.randomUUID();
  const dbId = crypto.randomUUID();
  
  // Define schema for Tasks database
  const schema = [
    { id: 'title', name: 'Title', type: 'text' as const },
    {
      id: 'status',
      name: 'Status',
      type: 'select' as const,
      options: [
        { value: 'To Do', color: 'blue' as const },
        { value: 'In Progress', color: 'yellow' as const },
        { value: 'Done', color: 'green' as const },
      ],
    },
    {
      id: 'priority',
      name: 'Priority',
      type: 'select' as const,
      options: [
        { value: 'Low', color: 'green' as const },
        { value: 'Medium', color: 'yellow' as const },
        { value: 'High', color: 'red' as const },
      ],
    },
    { id: 'dueDate', name: 'Due Date', type: 'date' as const, dateFormat: 'default' as const },
  ];

  const views = [
    {
      id: 'v1',
      name: 'Kanban Board',
      config: {
        type: 'kanban' as const,
        groupByCol: 'status',
        groupOrder: ['To Do', 'In Progress', 'Done'],
        filters: [],
        sorts: [],
        openBehavior: 'center' as const,
        cardProperties: ['priority', 'dueDate'],
        showPropertyLabels: true,
        propertyTextClamp: 'truncate' as const,
        cardColorCol: 'priority',
        groupColBg: true,
      },
    },
    {
      id: 'v2',
      name: 'Table View',
      config: {
        type: 'table' as const,
        columnOrder: ['title', 'status', 'priority', 'dueDate'],
        hiddenColumns: [],
        filters: [],
        sorts: [],
        openBehavior: 'center' as const,
      },
    },
  ];

  await db.insert(workspaceItems).values({
    id: dbItemId,
    workspaceId,
    type: 'database',
    title: '✅ Tasks',
    sortOrder: 1, // Second item
    icon: '✅',
    iconColor: 'default',
  });

  await db.insert(databases).values({
    id: dbId,
    name: '✅ Tasks',
    itemId: dbItemId,
    schema,
    views,
  });

  // Seed some initial task pages
  const seedRows = [
    { title: 'Learn how to use Remna', properties: { status: 'In Progress', priority: 'High', dueDate: new Date().toISOString().split('T')[0] } },
    { title: 'Create a new database from a template', properties: { status: 'To Do', priority: 'Medium', dueDate: '' } },
    { title: 'Set up my profile and avatar', properties: { status: 'Done', priority: 'Low', dueDate: '' } },
  ];

  for (let i = 0; i < seedRows.length; i++) {
    const row = seedRows[i];
    await db.insert(pages).values({
      id: crypto.randomUUID(),
      databaseId: dbId,
      title: row.title,
      content: `This is a sample page for task: **${row.title}**. You can write markdown content here, add bullet lists, tables, and images!`,
      properties: row.properties,
      sortOrder: i,
    });
  }
}
