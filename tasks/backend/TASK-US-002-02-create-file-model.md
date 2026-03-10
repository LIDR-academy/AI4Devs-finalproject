# TASK-US-002-02: Create File Model

[Trello Card](https://trello.com/c/gC54Czlo)

## Parent User Story
[US-002: Database Models and Migrations](../../user-stories/backend/US-002-database-models-migrations.md)

## Description
Define the `File` model with ownership, CID uniqueness, metadata fields, and relational mapping to users.

## Priority
🔴 Critical

## Acceptance Criteria
- [x] `File` model exists with required fields
- [x] `cid` is unique and indexed
- [x] `user_id` foreign key points to `users.id`
- [x] Relationship to `User` is configured
- [x] Timestamps/defaults are configured consistently

## Completion Status
- [x] 100% - Completed
