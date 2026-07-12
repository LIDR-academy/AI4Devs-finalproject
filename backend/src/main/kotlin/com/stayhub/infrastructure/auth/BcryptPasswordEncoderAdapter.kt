package com.stayhub.infrastructure.auth

import com.stayhub.domain.auth.PasswordEncoder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class BcryptPasswordEncoderAdapter(
    private val bcrypt: BCryptPasswordEncoder,
) : PasswordEncoder {
    override fun encode(rawPassword: String) = bcrypt.encode(rawPassword)
    override fun matches(rawPassword: String, encodedPassword: String) =
        bcrypt.matches(rawPassword, encodedPassword)
}
