package com.stayhub.domain.common

import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

class PaginationTest {

    // ─── DomainPageRequest ───────────────────────────────────────────────────

    @Test
    fun `DomainPageRequest computes offset correctly`() {
        val req = DomainPageRequest(page = 2, size = 20)
        req.offset shouldBe 40L
    }

    @Test
    fun `DomainPageRequest with page 0 has offset 0`() {
        val req = DomainPageRequest(page = 0, size = 10)
        req.offset shouldBe 0L
    }

    @Test
    fun `DomainPageRequest stores page and size`() {
        val req = DomainPageRequest(page = 3, size = 25)
        req.page shouldBe 3
        req.size shouldBe 25
    }

    // ─── PagedResult ─────────────────────────────────────────────────────────

    @Test
    fun `PagedResult totalPages rounds up correctly`() {
        val result = PagedResult(content = listOf("a", "b", "c"), page = 0, size = 2, totalElements = 5L)
        result.totalPages shouldBe 3
    }

    @Test
    fun `PagedResult totalPages is exact when evenly divisible`() {
        val result = PagedResult(content = listOf("a", "b"), page = 0, size = 2, totalElements = 4L)
        result.totalPages shouldBe 2
    }

    @Test
    fun `PagedResult totalPages is 0 when size is 0`() {
        val result = PagedResult(content = emptyList<String>(), page = 0, size = 0, totalElements = 0L)
        result.totalPages shouldBe 0
    }

    @Test
    fun `PagedResult number alias returns page`() {
        val result = PagedResult(content = emptyList<String>(), page = 3, size = 10, totalElements = 100L)
        result.number shouldBe 3
    }

    @Test
    fun `PagedResult with empty content returns totalElements 0`() {
        val result = PagedResult(content = emptyList<String>(), page = 0, size = 10, totalElements = 0L)
        result.totalElements shouldBe 0L
        result.totalPages shouldBe 0
    }

    @Test
    fun `PagedResult content is accessible`() {
        val items = listOf("x", "y", "z")
        val result = PagedResult(content = items, page = 0, size = 10, totalElements = 3L)
        result.content shouldBe items
    }
}
