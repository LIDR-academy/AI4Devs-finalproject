package com.stayhub.domain.common

/** Domain-owned replacement for Spring Data's Page<T>. No framework imports. */
data class PagedResult<T>(
    val content: List<T>,
    val page: Int,        // 0-based, matching Spring convention internally
    val size: Int,
    val totalElements: Long,
) {
    val totalPages: Int get() = if (size == 0) 0 else ((totalElements + size - 1) / size).toInt()
    val number: Int get() = page   // alias kept for call-site compatibility
}

/** Domain-owned replacement for Spring Data's Pageable/PageRequest. No framework imports. */
data class DomainPageRequest(
    val page: Int,   // 0-based
    val size: Int,
) {
    val offset: Long get() = page.toLong() * size
}
