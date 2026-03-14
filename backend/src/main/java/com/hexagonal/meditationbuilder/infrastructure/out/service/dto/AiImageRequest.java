package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiImageRequest(
        String model,
        String prompt,
        Integer n,
        String size,
        String quality,                 // GPT Image: low|medium|high|auto ; DALL·E 3: standard|hd ; DALL·E 2: standard
        // Para GPT Image
        @JsonProperty("output_format") String outputFormat,   // "png" | "jpeg" | "webp"
        String background,                                     // "transparent" | "opaque" | "auto"
        // Para DALL·E (legacy)
        @JsonProperty("response_format") String responseFormat // "url" | "b64_json"
) {}