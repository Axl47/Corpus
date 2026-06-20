# Resources

MCP resources provide structured, addressable data that clients can subscribe to or read on demand. Corpus exposes four resource templates.

---

## corpus://workspace/{id}/schema

Get the full JSON schema of a workspace — all databases with their column definitions.

**URI** — `corpus://workspace/{workspaceId}/schema`

**Mime type** — `application/json`

**Returns**

```json
{
  "workspaceId": "abc123",
  "databases": [
    {
      "id": "db456",
      "title": "Work Plan",
      "schema": [
        { "id": "title", "name": "Title", "type": "text" },
        { "id": "col_abc123", "name": "Status", "type": "select", "options": [
          { "value": "Backlog", "color": "default" },
          { "value": "Done", "color": "green" }
        ]}
      ]
    }
  ]
}
```

---

## corpus://page/{id}

Get the markdown content and properties of any page or database row.

**URI** — `corpus://page/{pageId}`

**Mime type** — `text/markdown`

**List** — `resources/list` returns the 20 most recently updated pages in the workspace. All other pages are accessible directly by their ID.

**Returns** — markdown with properties listed under a `## Properties` heading, followed by the page content.

---

## corpus://database/{id}/schema

Get the column schema of a specific database.

**URI** — `corpus://database/{databaseId}/schema`

**Mime type** — `application/json`

**List** — `resources/list` returns one entry per database in the workspace.

**Returns**

```json
{
  "schema": [
    { "id": "title", "name": "Title", "type": "text" },
    { "id": "col_abc123", "name": "Status", "type": "select", "options": [...] }
  ]
}
```

---

## corpus://audit-log/recent

Get the 50 most recent audit log entries for the current MCP token.

**URI** — `corpus://audit-log/recent`

**Mime type** — `application/json`

**Returns** — array of activity records with `tool`, `status`, `targetType`, `targetId`, and `createdAt`.
