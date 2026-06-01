# Multi-Agent Investigation References

## LangGraph Supervisor Pattern

The supervisor pattern uses an LLM to decide which specialized agent to hand off tasks to based on conversation context. It automatically generates handoff tools for each agent and manages message history.

Key concepts:
- **Hierarchical orchestration**: Supervisor delegates to specialized agents
- **LLM-based routing**: Supervisor decides which agent to invoke based on context
- **Automatic handoff tools**: Each agent gets callable tools for other agents
- **Message history management**: Conversation context maintained across agent handoffs

Reference: https://github.com/langchain-ai/langgraph-supervisor-py

## Parallel Agent Execution with `@task`

The `@task` decorator enables parallel execution of multiple agents:

```python
@task
def generate_paragraph(topic: str) -> str:
    response = model.invoke([
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": f"Write a paragraph about {topic}."}
    ])
    return response.content

# Parallel execution
futures = [generate_paragraph(topic) for topic in topics]
paragraphs = [f.result() for f in futures]
```

Key concepts:
- Tasks run concurrently via futures
- `.result()` blocks until each completes
- State management via `operator.add` reducer for append-only aggregation

Reference: https://docs.langchain.com/oss/python/langgraph/use-functional-api

## Graph API Fan-out/Fan-in Patterns

The Graph API handles parallel processing naturally with START and END nodes:

```python
workflow.add_edge(START, "fetch_news")
workflow.add_edge(START, "fetch_weather")
workflow.add_edge(START, "fetch_stocks")
workflow.add_edge("fetch_news", "combine_data")
workflow.add_edge("fetch_weather", "combine_data")
workflow.add_edge("fetch_stocks", "combine_data")
workflow.add_edge("combine_data", END)
```

Key concepts:
- START node fans out to parallel nodes
- Parallel nodes synchronize at combine node
- END node receives aggregated results

Reference: https://docs.langchain.com/oss/python/langgraph/choosing-apis

## Synthesis and Confidence Ranking

Multi-agent synthesis requires:
1. **Consensus identification**: Where multiple agents agree on root cause
2. **Conflict resolution**: Where agents disagree; resolved by evidence quality
3. **Hypothesis ranking**: By (a) independent confirmation count, (b) evidence quality, (c) blast radius
4. **Confidence assignment**: High/Medium/Low based on evidence strength
5. **Unknown flagging**: What no agent could determine

## Karpathy Autoresearch Loop

The experiment→measure→keep/revert methodology:
1. Apply change to skill
2. Re-metric the skill
3. If improved → commit
4. If regressed → revert
5. Repeat until target score or plateau

Reference: https://github.com/karpathy/autoresearch
