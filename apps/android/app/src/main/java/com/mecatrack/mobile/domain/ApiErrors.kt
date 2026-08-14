package com.mecatrack.mobile.domain

import com.mecatrack.mobile.data.api.ApiErrorBody
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive

object ApiErrors {
    fun parseBody(raw: String, json: Json): ApiErrorBody? {
        if (raw.isBlank()) {
            return null
        }
        return runCatching { json.decodeFromString(ApiErrorBody.serializer(), raw) }.getOrNull()
    }

    fun messageFrom(body: ApiErrorBody?): String? {
        val element = body?.message ?: return null
        val asString = runCatching { element.jsonPrimitive.contentOrNull }.getOrNull()
        if (!asString.isNullOrBlank()) {
            return asString
        }
        val asArray = runCatching {
            element.jsonArray.joinToString("\n") { it.jsonPrimitive.content }
        }.getOrNull()
        return asArray?.takeIf { it.isNotBlank() }
    }
}
