# Project Brief

## Executive Summary
This project authorizes the creation of a **Memory Bank** (Shared State) for the Google Antigravity environment. The goal is to ensure that multiple Gemini agents can collaborate asynchronously on the `ai4devs` codebase without context loss or conflicts.

## Key Objectives
1.  **Centralize Context**: All agents read from a single source of truth.
2.  **Enforce Protocol**: Mandatory reading of context before execution.
3.  **Atomic Updates**: Agents update the state after work to keep it "fresh".
