package com.stayhub.domain.auth

/**
 * Port: persistence contract for [User] entities.
 *
 * Implemented by the infrastructure layer (UserRepositoryAdapter).
 * Pure interface — no framework imports.
 */
interface UserRepository {
    suspend fun findByEmail(email: String): User?
    suspend fun save(user: User): User
}
