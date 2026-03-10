"""Unit tests for async behavior handling in backend code paths."""

from __future__ import annotations

import asyncio
import unittest


async def _async_sum(a: int, b: int) -> int:
    await asyncio.sleep(0)
    return a + b


class TestAsyncBehavior(unittest.IsolatedAsyncioTestCase):
    """Ensure async tests are supported by the suite runner."""

    async def test_async_helper_runs(self) -> None:
        """IsolatedAsyncioTestCase should execute async code correctly."""
        total = await _async_sum(20, 22)
        self.assertEqual(total, 42)
