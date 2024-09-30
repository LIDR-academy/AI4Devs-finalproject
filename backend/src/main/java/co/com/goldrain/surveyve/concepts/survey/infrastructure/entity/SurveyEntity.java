package co.com.goldrain.surveyve.concepts.survey.infrastructure.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "SURVEY")
@Getter
@Setter
public class SurveyEntity {
    @Id
    private UUID id;

    private String title;
    private String description;
    private String status;
    private Date publicationDate;
    private Date closingDate;
    @Column(length = 10000)
    private String json;
}