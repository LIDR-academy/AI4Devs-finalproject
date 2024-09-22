package co.com.goldrain.surveyve.concepts.survey.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity.SurveyPageEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "SURVEY")
@Getter
@Setter
public class SurveyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String title;
    private String description;
    private int templateId;
    private String status;
    private Date publicationDate;
    private Date closingDate;

    @OneToMany(mappedBy = "survey", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SurveyPageEntity> pages;

    @OneToMany(mappedBy = "survey", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RespondentEntity> respondents;
}