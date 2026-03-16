package co.com.goldrain.surveyve.concepts.survey.domain.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Data
public class SurveyDTO {
    private UUID id;
    private String title;
    private String description;
    private List<PageDTO> pages;

    public SurveyDTO() {
        this.title = String.format("Encuesta sin título - %s", new Date());
    }

    public void fix() {
    if (pages != null) {
        for (PageDTO page : pages) {
            page.fix();
        }
    }
}

}