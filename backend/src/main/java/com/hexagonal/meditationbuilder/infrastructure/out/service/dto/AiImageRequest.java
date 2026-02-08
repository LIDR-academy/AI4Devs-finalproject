package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiImageRequest(
        String model,
        String prompt,
        Integer n,
        String size,
        String quality,
        @JsonProperty("response_format") String responseFormat
) {}