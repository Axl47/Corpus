export type RealtimeScope = 'sidebar' | 'database' | 'page';

export interface RealtimeEvent {
  scope: RealtimeScope;
  workspaceId: string;
  /** databaseId for 'database' scope, itemId for 'page' scope */
  resourceId?: string;
  /** userId of the mutating user, or 'mcp:<tokenPrefix>' for MCP tool calls */
  actorId: string;
}
