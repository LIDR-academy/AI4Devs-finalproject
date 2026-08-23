# Data Model Sync Skill

**Trigger**: When `backend/prisma/schema.prisma` or the ER diagram in `docs/system-architecture.md` is modified, or when a new spec involves entity changes.

**Why**: The Prisma schema and the Mermaid ER diagram in system-architecture.md are both source-of-truth representations of the data model. They drift easily because they are maintained separately.

## Instructions

Compare the Prisma schema with the Mermaid ER diagram and report any differences:

1. **Entities**: Every Prisma model should appear as an entity in the ER diagram and vice versa.
2. **Relations**: Every relation in Prisma (`@relation`, foreign keys) should have a corresponding relationship line in the ER diagram.
3. **Fields**: Key fields (PKs, UKs, FKs, enums) should match between both representations.
4. **Enums**: Prisma enums should appear in the ER diagram if they constrain model fields.

## Output

Report any mismatches found. If none, confirm alignment. Do not modify either file automatically.