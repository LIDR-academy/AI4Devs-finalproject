package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hexagonal.meditationbuilder.infrastructure.config.OpenAiProperties;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiTextRequest(
        String model,
        List<Message> messages,
        Double temperature,
        @JsonProperty("max_tokens") Integer maxTokens,
        @JsonProperty("top_p") Double topP,
        @JsonProperty("frequency_penalty") Double frequencyPenalty,
        @JsonProperty("presence_penalty") Double presencePenalty
) {
    /** Holder estático de propiedades **/
    private static OpenAiProperties props;

    /** Inyectado desde Spring una única vez en el arranque */
    public static void setProperties(OpenAiProperties p) {
        props = p;
    }

    /** Mensajes */
    public record Message(String role, String content) {
        public static Message system(String content) { return new Message("system", content); }
        public static Message user(String content) { return new Message("user", content); }
    }

    /** ⬅️ LO QUE QUERÍAS: forGeneration SIN props como argumento */
    public static AiTextRequest forGeneration(String systemPrompt, String userPrompt) {
        if (props == null) {
            throw new IllegalStateException("OpenAiProperties no ha sido inicializado en AiTextRequest");
        }

        return new AiTextRequest(
                props.getText().getModel(),
                List.of(
                        Message.system(systemPrompt),
                        Message.user(userPrompt)
                ),
                props.getText().getTemperature(),
                props.getText().getMaxTokens(),
                props.getText().getTopP(),
                props.getText().getFrequencyPenalty(),
                props.getText().getPresencePenalty()
        );
    }
}