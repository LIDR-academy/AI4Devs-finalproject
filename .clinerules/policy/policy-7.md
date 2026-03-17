---
trigger: always_on
---

## 5.4 Test Implementation Guidelines

1.  **Test File Location**:
    *   **Unit Tests**: Located in `test/unit/` mirroring the source directory structure.
    *   **Integration Tests**: Located in `test/integration/` (or `test/<module>/` e.g., `test/server/` as per existing conventions if more appropriate), reflecting the module or subsystem being tested.
2.  **Test Naming**: Test files and descriptions should be named clearly and descriptively.