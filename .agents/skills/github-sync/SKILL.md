---
name: github-sync
description: "Trigger: github, sync, sincronizar, issues, github issues, backlog sync. Sincroniza bidireccionalmente las issues de GitHub con las historias de usuario locales en Markdown usando la CLI gh."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

## Activation Contract

Load this skill when bidirectional synchronization between GitHub Issues and local user story markdown files in `docs/backlog/` is requested. Triggers: `github`, `sync`, `sincronizar`, `issues`, `github issues`, `backlog sync`.

## Hard Rules

- **Source of Truth Linkage:** Every local user story must contain `github_issue_id` and/or `github_url` in its YAML frontmatter. If an issue does not exist on GitHub, create it and update the local frontmatter.
- **GitHub CLI Dependency:** Use only the official GitHub CLI (`gh`) for all remote read and write operations.
- **No Overwrite Data Loss:** When resolving bidirectional updates, merge changes or prompt the user. Do not silently overwrite local changes or GitHub updates without validation.
- **Format Integrity:** Maintain standard Markdown structure and YAML frontmatter properties required by other project skills (e.g. backlog-generator).

## Decision Gates

| Sync Scenario | Detection Method | Action |
|---|---|---|
| Local user story has no `github_issue_id` | Check YAML frontmatter | Create new Issue on GitHub, retrieve ID, and update local file |
| Discrepancy between GitHub state and Local file | Compare last modified timestamps or contents | Perform three-way merge or prompt user for conflict resolution |
| Issue closed on GitHub, active locally | Check GitHub issue status | Prompt user to close story locally or reopen issue |

## Execution Steps

```sudolang
GithubSync {
  Config {
    lang = detect_from_user_input |> default "es"
    backlogDir = "docs/backlog/"
    mappingField = "github_issue_id"
    cliTool = "gh"
  }

  OnActivate {
    // 1. Verify gh CLI tool is installed and authenticated
    VerifyCLIConnection()
    // 2. Discover local user stories in backlogDir
    stories = ScanLocalBacklog()
    // 3. Run sync pipeline
    RunSyncPipeline(stories)
  }

  VerifyCLIConnection() {
    exec("gh auth status")
    catch => stop("GitHub CLI not authenticated. Please run 'gh auth login' first.")
  }

  ScanLocalBacklog() {
    return find_files(backlogDir, filter: "*.md")
  }

  RunSyncPipeline(stories) {
    for story in stories {
      frontmatter = parse_yaml_frontmatter(story)
      
      if (!frontmatter[mappingField]) {
        // Issue does not exist in GitHub yet
        issue = CreateGitHubIssue(frontmatter, story.content)
        UpdateLocalFrontmatter(story, mappingField, issue.id)
      } else {
        // Sync existing issue
        githubIssue = FetchGitHubIssue(frontmatter[mappingField])
        SyncBidirectional(story, githubIssue)
      }
    }
  }

  CreateGitHubIssue(frontmatter, content) {
    title = frontmatter.title |> default("User Story")
    body = content
    labels = frontmatter.labels |> default([])
    
    // Create issue using gh CLI
    response = exec("gh issue create --title $title --body $body --label $labels")
    return response.parsed
  }

  FetchGitHubIssue(id) {
    return exec("gh issue view $id --json number,title,body,state,labels") |> parse_json
  }

  SyncBidirectional(story, githubIssue) {
    // Compare and merge title, body, status, labels
    // Local edits push to GitHub, GitHub edits pull to local
  }
}
```

1. **Environment Verification:** Run `gh auth status` to ensure active GitHub session exists.
2. **Backlog Scan:** Read all user stories from `docs/backlog/` and extract YAML metadata.
3. **Creation Phase:** For stories without `github_issue_id`, create remote GitHub issues and append the returned ID to the story's frontmatter.
4. **Synchronization Phase:** Compare local markdown content/states with GitHub issue states (title, description, status) and apply updates bidirectionally.

## Output Contract

Return:
- List of local stories matched with their GitHub issue counterparts.
- Summary of actions taken (e.g. Issues created, updated local files, updated GitHub issues).
- Error or warning details if authentication or rate limits occur.

## References

- `docs/backlog/` — Local repository user story markdown files.
