"""
Integration tests package for Canvas API (GET /api/parts).

This package organizes tests by quality attribute:
- test_functional_core.py: Basic CRUD & Happy Paths (6 tests)
- test_filters_validation.py: Dynamic filtering logic (5 tests)  
- test_rls_policies.py: Row Level Security enforcement (4 tests)
- test_performance_scalability.py: Response time, payload size, stress (4 tests)
- test_index_usage.py: Query plans, optimization validation (4 tests)

Total: 23 integration tests for GET /api/parts endpoint.

Reorganized from: tests/integration/test_parts_api.py (T-0501-BACK)
Enhanced in: T-0510-TEST-BACK (2026-02-23)
"""
