package com.stayhub.domain.property

import java.util.UUID

data class Host(
    val id: UUID,
    val firstName: String,
    val lastName: String,
    val avatarUrl: String?,
    val isVerified: Boolean,
)
