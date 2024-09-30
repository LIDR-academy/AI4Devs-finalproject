package co.com.goldrain.surveyve.shared.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class JsonUtils {

    private static final ObjectMapper mapper;

    static {
        mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }

    public static String toJson(Object object) {
        try {
            return mapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("Error converting object to JSON", e);
            return "{}";
        }
    }

    public static <T> T parse(String object, Class<T> clazz) {
        try {
            return mapper.readValue(object, clazz);
        } catch (JsonProcessingException e) {
            log.error("Error converting object to JSON", e);
            return null;
        }
    }

}
