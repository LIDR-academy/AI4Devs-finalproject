# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-11-02-01-activity-audit-system/spec.md

## Schema Changes

### New Table: `activity`

Create a new table to store audit trail of user activities across the system.

#### SQL Definition

```sql
CREATE TABLE activity (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    entity_id INTEGER,

    -- Indexes for query performance
    INDEX idx_activity_timestamp (timestamp DESC),
    INDEX idx_activity_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_activity_entity_id (entity_id)
);
```

#### SQLAlchemy Model

Location: `backend/app/models/activity.py`

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Activity(Base):
    """
    Activity model for audit trail and recent activity tracking.

    This model logs all significant user actions in the system for:
    - Audit trail and compliance
    - Recent activity dashboard display
    - Usage analytics and debugging
    """

    __tablename__ = "activity"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Timestamp
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # User Reference (nullable for system activities)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Activity Metadata
    activity_type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)

    # Entity Reference (optional, for linking to specific records)
    entity_id = Column(Integer, nullable=True, index=True)

    # Relationships
    user = relationship("User", backref="activities")

    def __repr__(self) -> str:
        return (
            f"<Activity(id={self.id}, type='{self.activity_type}', "
            f"user_id={self.user_id}, timestamp='{self.timestamp}')>"
        )
```

#### Column Specifications

| Column          | Type                     | Constraints                                            | Description                                                            |
| --------------- | ------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `id`            | INTEGER                  | PRIMARY KEY, AUTO INCREMENT                            | Unique activity identifier                                             |
| `timestamp`     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW(), INDEXED                       | When the activity occurred (UTC)                                       |
| `user_id`       | INTEGER                  | FK to users(id), ON DELETE SET NULL, NULLABLE, INDEXED | User who performed the action (null for system activities)             |
| `activity_type` | VARCHAR(50)              | NOT NULL, INDEXED                                      | Type of activity (enum-like value)                                     |
| `description`   | TEXT                     | NOT NULL                                               | Human-readable description of the activity                             |
| `entity_id`     | INTEGER                  | NULLABLE, INDEXED                                      | Reference to related entity (template_version.id, comparison.id, etc.) |

### Activity Types

The following activity types will be tracked:

| Activity Type         | Description                     | Entity Reference      |
| --------------------- | ------------------------------- | --------------------- |
| `LOGIN`               | User logged in                  | `user.id`             |
| `NEW_USER`            | New user registered             | `user.id`             |
| `TEMPLATE_ANALYSIS`   | PDF analyzed (temporary)        | `null`                |
| `TEMPLATE_SAVED`      | Template ingested               | `template_version.id` |
| `VERSION_SAVED`       | New version created             | `template_version.id` |
| `COMPARISON_ANALYSIS` | Comparison analyzed (temporary) | `null`                |
| `COMPARISON_SAVED`    | Comparison saved                | `comparison.id`       |

### Indexes

The following indexes will be created for query optimization:

1. **`idx_activity_timestamp`** - B-tree index on `timestamp DESC`

   - Purpose: Fast retrieval of recent activities
   - Used by: `GET /api/v1/activity/recent` endpoint

2. **`idx_activity_user_id`** - B-tree index on `user_id`

   - Purpose: Filter activities by user
   - Used by: Future user-specific activity queries

3. **`idx_activity_type`** - B-tree index on `activity_type`

   - Purpose: Filter by activity type (e.g., exclude LOGIN)
   - Used by: `GET /api/v1/activity/recent` endpoint

4. **`idx_activity_entity_id`** - B-tree index on `entity_id`
   - Purpose: Find activities related to specific entities
   - Used by: Future entity-specific activity queries

### Foreign Key Constraints

#### `user_id` → `users.id`

- **Relationship**: Many-to-One (many activities belong to one user)
- **ON DELETE**: SET NULL (preserve activity record even if user is deleted)
- **Rationale**: Maintain audit trail integrity even after user deletion

### Alembic Migration

Create migration file: `backend/alembic/versions/YYYYMMDD_HHMMSS_add_activity_table.py`

#### Migration Operations

**Upgrade:**

```python
def upgrade() -> None:
    # Create activity table
    op.create_table(
        'activity',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('activity_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('idx_activity_timestamp', 'activity', [sa.text('timestamp DESC')], unique=False)
    op.create_index('idx_activity_user_id', 'activity', ['user_id'], unique=False)
    op.create_index('idx_activity_type', 'activity', ['activity_type'], unique=False)
    op.create_index('idx_activity_entity_id', 'activity', ['entity_id'], unique=False)
```

**Downgrade:**

```python
def downgrade() -> None:
    # Drop indexes first
    op.drop_index('idx_activity_entity_id', table_name='activity')
    op.drop_index('idx_activity_type', table_name='activity')
    op.drop_index('idx_activity_user_id', table_name='activity')
    op.drop_index('idx_activity_timestamp', table_name='activity')

    # Drop table
    op.drop_table('activity')
```

### User Model Updates

Update `backend/app/models/user.py` to include the backref relationship:

```python
# Add to User model relationships section:
# Note: The backref is automatically created by Activity model's relationship
# No changes needed in User model - backref "activities" will be available
```

### Data Integrity Rules

1. **Timestamp Immutability**: Activity timestamps should never be updated after creation
2. **Soft User Deletion**: Use `ON DELETE SET NULL` to preserve activity history
3. **Description Consistency**: Use standardized description templates for each activity type
4. **Entity Reference Integrity**: `entity_id` must reference valid records when not null

### Performance Considerations

1. **Index Selection**: Composite index on (timestamp DESC, activity_type) for filtered recent queries
2. **Partitioning (Future)**: Consider table partitioning by timestamp for large datasets
3. **Archival Strategy (Future)**: Implement archival for activities older than 6-12 months
4. **Query Limits**: Always use LIMIT in queries to prevent full table scans

### Migration Execution Plan

1. **Pre-Migration Checklist:**

   - Backup database
   - Review migration SQL
   - Test migration on development database
   - Verify User model has no conflicting relationships

2. **Execute Migration:**

   ```bash
   cd backend
   alembic revision --autogenerate -m "add_activity_table"
   # Review generated migration file
   alembic upgrade head
   ```

3. **Post-Migration Verification:**

   ```sql
   -- Verify table exists
   SELECT table_name FROM information_schema.tables
   WHERE table_name = 'activity';

   -- Verify indexes
   SELECT indexname FROM pg_indexes
   WHERE tablename = 'activity';

   -- Verify foreign key
   SELECT constraint_name FROM information_schema.table_constraints
   WHERE table_name = 'activity' AND constraint_type = 'FOREIGN KEY';

   -- Test insert
   INSERT INTO activity (user_id, activity_type, description, entity_id)
   VALUES (1, 'TEST', 'Test activity', NULL);

   -- Clean up test
   DELETE FROM activity WHERE activity_type = 'TEST';
   ```

4. **Rollback Plan:**
   ```bash
   # If issues arise, rollback the migration
   alembic downgrade -1
   ```

### Rationale

#### Why Separate Activity Table?

1. **Separation of Concerns**: Activity logging is orthogonal to core business entities
2. **Performance**: Doesn't bloat existing tables with audit columns
3. **Flexibility**: Easy to query, filter, and archive activity data independently
4. **Extensibility**: Simple to add new activity types without schema changes

#### Why ON DELETE SET NULL for user_id?

Preserving activity records even after user deletion maintains a complete audit trail, which is critical for compliance and debugging. The `user_email` or `user_full_name` can be denormalized in the description for historical reference.

#### Why TEXT for description?

Allows flexible, human-readable descriptions without length constraints. Descriptions can include template names, version numbers, user emails, and other contextual information.

#### Why Nullable entity_id?

Not all activities reference a specific entity (e.g., temporary analyses don't create persisted records). Nullable `entity_id` supports both transient and persistent operations.
