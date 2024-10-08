package co.com.goldrain.surveyve.concepts.survey.domain;

import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Data
public class Survey {
    private UUID id;
    private String title;
    private String description;
    private String status;
    private Date publicationDate;
    private Date closingDate;
    private String json;

    private List<SurveyPage> pages;
    private List<Respondent> respondents;
}