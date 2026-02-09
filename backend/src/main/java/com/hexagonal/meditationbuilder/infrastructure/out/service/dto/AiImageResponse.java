package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiImageResponse(
        Long created,
        String background,                 // "opaque" | "transparent" | "auto" (según request)
        @JsonProperty("output_format") String outputFormat, // "png" | "jpeg" | "webp"
        String quality,                    // "low"|"medium"|"high"|"auto"
        String size,                       // "1024x1024", ...
        List<ImageData> data,
        Usage usage,                       // métrica de tokens (opcional)
        ErrorInfo error                    // por si llega error en 2xx
) {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static record ImageData(
            String url,
            @JsonProperty("b64_json") String b64Json,
            @JsonProperty("revised_prompt") String revisedPrompt
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static record Usage(
            @JsonProperty("input_tokens") Integer inputTokens,
            @JsonProperty("output_tokens") Integer outputTokens,
            @JsonProperty("total_tokens") Integer totalTokens,
            @JsonProperty("input_tokens_details") InputTokensDetails inputTokensDetails
    ) {
        @JsonInclude(JsonInclude.Include.NON_NULL)
        public static record InputTokensDetails(
                @JsonProperty("image_tokens") Integer imageTokens,
                @JsonProperty("text_tokens") Integer textTokens
        ) {}
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static record ErrorInfo(
            String message,
            String type,
            Integer code
    ) {}
}