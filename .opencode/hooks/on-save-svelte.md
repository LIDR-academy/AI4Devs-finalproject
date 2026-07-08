# Hook: on-save-svelte

## Intent

When a `.svelte` file is saved in the frontend, run `svelte-check` to catch TypeScript and template errors immediately, before the dev server's slower feedback loop.

## Trigger

File save in `frontend/src/**/*.svelte`.

## Scope

Frontend only.

## Actions

This hook is implemented in the editor (VS Code task, Vim autocmd, etc.), not as a git hook. The intent is to enable editor integration.

## VS Code setup

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "svelte-check on save",
      "type": "shell",
      "command": "cd frontend && npm run check",
      "problemMatcher": ["$svelte-check"],
      "presentation": { "reveal": "silent" },
      "runOptions": { "runOn": "folderOpen" }
    }
  ]
}
```

And to `.vscode/settings.json`:

```json
{
  "emeraldwalk.runOnSaveTrigger": [
    { "match": ".*\\.svelte$", "cmd": "cd frontend && npm run check -- --watch" }
  ]
}
```

## Vim setup

```vim
autocmd BufWritePost *.svelte !cd frontend && npm run check
```

## Alternative: svelte-check in watch mode

Run `npm run check -- --watch` in a separate terminal during frontend work. Slower than on-save but no editor config needed.

## What it catches

- TypeScript errors in `<script lang="ts">` blocks
- Unused props
- Invalid event handlers
- Missing imports
- Template syntax errors
- Accessibility warnings
