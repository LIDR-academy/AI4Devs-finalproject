# Autonomous Agent Collaboration Contract & Shared Board API

This reference document defines the protocol for subagents operating autonomously under a shared task board.

## 1. Agent Handshake & Status Checks

At initialization (`OnStart`), the autonomous agent must check its assigned tasks from the Engram shared board:

```sudolang
function OnStart(agent) {
  mem_search("tech-lead/{project}/board") => load(board)
  my_tasks = board.tasks.filter(t => t.skill == agent.name)
  
  forEach(task in my_tasks) {
    if (all_done(task.dependsOn)) {
      update_status(task.id, "ready")
    } else {
      update_status(task.id, "waiting")
    }
  }
}
```

---

## 2. Real-Time Status Updates

As agents execute their task packages, they are required to publish status updates to ensure downstream agents can coordinate:

- **Start Execution:**
  ```javascript
  board.update(taskId, { status: "in_progress", started_at: Date.now() });
  mem_save(board, { topic: "tech-lead/{project}/board", capture_prompt: false });
  ```
- **Task Completed:**
  ```javascript
  board.update(taskId, { status: "verified", completed_at: Date.now(), result: resultPath });
  mem_save(board, { topic: "tech-lead/{project}/board", capture_prompt: false });
  // Notify blocking dependencies
  ```
- **Execution Blocked (Error Escapes):**
  ```javascript
  board.update(taskId, { status: "blocked", error: reason });
  mem_save(board, { topic: "tech-lead/{project}/board", capture_prompt: false });
  ```

---

## 3. Dependency Polling Loop

For tasks in `waiting` state, the agent runs a localized pre-execution check:

```sudolang
function WaitForDependencies(task) {
  while (task.status == "waiting") {
    check_board_status(task.dependsOn)
    if (all_done(task.dependsOn)) {
      task.status = "ready"
      break
    }
    if (any_blocked(task.dependsOn)) {
      task.status = "blocked"
      task.error = "Parent dependency blocked"
      break
    }
    sleep(10000) // 10s wait before retry
  }
}
```
