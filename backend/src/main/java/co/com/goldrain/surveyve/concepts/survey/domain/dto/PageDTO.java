package co.com.goldrain.surveyve.concepts.survey.domain.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PageDTO {
    private UUID id;
    private String name;
    private List<ElementDTO> elements;

    public void fix() {
        if (elements != null) {
            for (ElementDTO element : elements) {
                element.fix();
            }
        }
    }
}
