# Export Templates — Backlog Generator

## Jira CSV Export

Use this format for bulk import into Jira.

```csv
Summary,Issue Type,Description,Priority,Epic Link,Story Points,Labels,Acceptance Criteria
"{story-title}",Story,"{story-description}",{Must→Highest|Should→High|Could→Medium|Won't→Low},{epic-key},{points},"{type}","{AC-text}"
"{subtask-title}",Sub-task,"{subtask-description}",{priority},{parent-story-key},{points},"{category}",""
```

### Field Mapping

| Backlog Field | Jira Field | Transformation |
|---------------|-----------|----------------|
| US-{ep}-{n} | Summary prefix | Prepend ID to title |
| Must/Should/Could/Won't | Priority | Must→Highest, Should→High, Could→Medium, Won't→Low |
| Story type (frontend/backend/...) | Labels | Map directly |
| Size (XS/S/M/L/XL) | Story Points | Use points from estimation table |
| EP-{n} | Epic Link | Map to epic key |
| Given/When/Then ACs | Acceptance Criteria | Concatenate as text |
| Blocking dependency | Blocks/Is blocked by | Link type |

---

## GitHub Projects JSON Export

Use this format for GitHub Issues import via API.

```json
{
  "issues": [
    {
      "title": "US-{ep}-{n}: {story-title}",
      "body": "{story-body-as-markdown}",
      "labels": ["{type}", "{priority}", "{size}"],
      "milestone": "{epic-name}",
      "assignees": []
    }
  ],
  "labels": [
    {"name": "frontend", "color": "1D76DB"},
    {"name": "backend", "color": "0E8A16"},
    {"name": "infra", "color": "D93F0B"},
    {"name": "ux", "color": "7057FF"},
    {"name": "testing", "color": "FBCA04"},
    {"name": "must", "color": "B60205"},
    {"name": "should", "color": "FF9800"},
    {"name": "could", "color": "0075CA"},
    {"name": "wont", "color": "CCCCCC"}
  ]
}
```

### Field Mapping

| Backlog Field | GitHub Field | Transformation |
|---------------|-------------|----------------|
| Epic | Milestone | One milestone per epic |
| Story | Issue | Title prefixed with ID |
| Subtask | Checklist in issue body | Markdown checklist items |
| Priority | Label | must/should/could/wont |
| Type | Label | frontend/backend/infra/ux/testing |
| Size | Label | size:xs / size:s / size:m / size:l / size:xl |
| Dependencies | Issue reference | "Depends on #N" in body |
