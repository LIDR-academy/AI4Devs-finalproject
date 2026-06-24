package com.stayhub.presentation.dto.property

data class ReviewsResponse(
    val reviews: List<ReviewItemDto>,
    val pagination: PaginationDto,
    val avg_rating: Double?,
    val total_reviews: Int,
) {
    data class ReviewItemDto(
        val id: String,
        val guest_name: String,
        val guest_avatar_url: String?,
        val rating: Int,
        val comment: String?,
        val created_at: String,
    )

    data class PaginationDto(
        val page: Int,
        val size: Int,
        val total_results: Long,
        val total_pages: Int,
    )
}
