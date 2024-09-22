package co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
import co.com.goldrain.surveyve.concepts.question.infrastructure.mapper.QuestionMapper;
import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity.SurveyPageEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2024-09-22T16:12:48-0500",
    comments = "version: 1.6.1, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.10.1.jar, environment: Java 21 (Microsoft)"
)
@Component
public class SurveyPageMapperImpl implements SurveyPageMapper {

    @Autowired
    private QuestionMapper questionMapper;

    @Override
    public SurveyPage toDomain(SurveyPageEntity surveyPageEntity) {
        if ( surveyPageEntity == null ) {
            return null;
        }

        SurveyPage surveyPage = new SurveyPage();

        surveyPage.setId( surveyPageEntity.getId() );
        surveyPage.setPageNumber( surveyPageEntity.getPageNumber() );
        surveyPage.setSurvey( surveyEntityToSurvey( surveyPageEntity.getSurvey() ) );
        surveyPage.setQuestions( questionMapper.toDomainList( surveyPageEntity.getQuestions() ) );

        return surveyPage;
    }

    @Override
    public List<SurveyPage> toDomainList(List<SurveyPageEntity> surveyPageEntities) {
        if ( surveyPageEntities == null ) {
            return null;
        }

        List<SurveyPage> list = new ArrayList<SurveyPage>( surveyPageEntities.size() );
        for ( SurveyPageEntity surveyPageEntity : surveyPageEntities ) {
            list.add( toDomain( surveyPageEntity ) );
        }

        return list;
    }

    @Override
    public SurveyPageEntity toEntity(SurveyPage surveyPage) {
        if ( surveyPage == null ) {
            return null;
        }

        SurveyPageEntity surveyPageEntity = new SurveyPageEntity();

        surveyPageEntity.setId( surveyPage.getId() );
        surveyPageEntity.setPageNumber( surveyPage.getPageNumber() );
        surveyPageEntity.setSurvey( surveyToSurveyEntity( surveyPage.getSurvey() ) );
        surveyPageEntity.setQuestions( questionMapper.toEntityList( surveyPage.getQuestions() ) );

        return surveyPageEntity;
    }

    @Override
    public List<SurveyPageEntity> toEntityList(List<SurveyPage> surveyPages) {
        if ( surveyPages == null ) {
            return null;
        }

        List<SurveyPageEntity> list = new ArrayList<SurveyPageEntity>( surveyPages.size() );
        for ( SurveyPage surveyPage : surveyPages ) {
            list.add( toEntity( surveyPage ) );
        }

        return list;
    }

    protected OptionAnswer optionAnswerEntityToOptionAnswer(OptionAnswerEntity optionAnswerEntity) {
        if ( optionAnswerEntity == null ) {
            return null;
        }

        OptionAnswer optionAnswer = new OptionAnswer();

        optionAnswer.setId( optionAnswerEntity.getId() );
        optionAnswer.setValue( optionAnswerEntity.getValue() );
        optionAnswer.setCorrect( optionAnswerEntity.isCorrect() );
        optionAnswer.setQuestion( questionMapper.toDomain( optionAnswerEntity.getQuestion() ) );
        optionAnswer.setAnswerOptions( answerOptionEntityListToAnswerOptionList( optionAnswerEntity.getAnswerOptions() ) );

        return optionAnswer;
    }

    protected AnswerOption answerOptionEntityToAnswerOption(AnswerOptionEntity answerOptionEntity) {
        if ( answerOptionEntity == null ) {
            return null;
        }

        AnswerOption answerOption = new AnswerOption();

        answerOption.setId( answerOptionEntity.getId() );
        answerOption.setAnswer( answerEntityToAnswer( answerOptionEntity.getAnswer() ) );
        answerOption.setOptionAnswer( optionAnswerEntityToOptionAnswer( answerOptionEntity.getOptionAnswer() ) );

        return answerOption;
    }

    protected List<AnswerOption> answerOptionEntityListToAnswerOptionList(List<AnswerOptionEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<AnswerOption> list1 = new ArrayList<AnswerOption>( list.size() );
        for ( AnswerOptionEntity answerOptionEntity : list ) {
            list1.add( answerOptionEntityToAnswerOption( answerOptionEntity ) );
        }

        return list1;
    }

    protected Answer answerEntityToAnswer(AnswerEntity answerEntity) {
        if ( answerEntity == null ) {
            return null;
        }

        Answer answer = new Answer();

        answer.setId( answerEntity.getId() );
        answer.setTextValue( answerEntity.getTextValue() );
        answer.setQuestion( questionMapper.toDomain( answerEntity.getQuestion() ) );
        answer.setRespondent( respondentEntityToRespondent( answerEntity.getRespondent() ) );
        answer.setAnswerOptions( answerOptionEntityListToAnswerOptionList( answerEntity.getAnswerOptions() ) );

        return answer;
    }

    protected List<Answer> answerEntityListToAnswerList(List<AnswerEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<Answer> list1 = new ArrayList<Answer>( list.size() );
        for ( AnswerEntity answerEntity : list ) {
            list1.add( answerEntityToAnswer( answerEntity ) );
        }

        return list1;
    }

    protected Respondent respondentEntityToRespondent(RespondentEntity respondentEntity) {
        if ( respondentEntity == null ) {
            return null;
        }

        Respondent respondent = new Respondent();

        respondent.setId( respondentEntity.getId() );
        respondent.setName( respondentEntity.getName() );
        respondent.setEmail( respondentEntity.getEmail() );
        respondent.setPhone( respondentEntity.getPhone() );
        respondent.setSurvey( surveyEntityToSurvey( respondentEntity.getSurvey() ) );
        respondent.setAnswers( answerEntityListToAnswerList( respondentEntity.getAnswers() ) );

        return respondent;
    }

    protected List<Respondent> respondentEntityListToRespondentList(List<RespondentEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<Respondent> list1 = new ArrayList<Respondent>( list.size() );
        for ( RespondentEntity respondentEntity : list ) {
            list1.add( respondentEntityToRespondent( respondentEntity ) );
        }

        return list1;
    }

    protected Survey surveyEntityToSurvey(SurveyEntity surveyEntity) {
        if ( surveyEntity == null ) {
            return null;
        }

        Survey survey = new Survey();

        survey.setId( surveyEntity.getId() );
        survey.setTitle( surveyEntity.getTitle() );
        survey.setDescription( surveyEntity.getDescription() );
        survey.setTemplateId( surveyEntity.getTemplateId() );
        survey.setStatus( surveyEntity.getStatus() );
        survey.setPublicationDate( surveyEntity.getPublicationDate() );
        survey.setClosingDate( surveyEntity.getClosingDate() );
        survey.setPages( toDomainList( surveyEntity.getPages() ) );
        survey.setRespondents( respondentEntityListToRespondentList( surveyEntity.getRespondents() ) );

        return survey;
    }

    protected OptionAnswerEntity optionAnswerToOptionAnswerEntity(OptionAnswer optionAnswer) {
        if ( optionAnswer == null ) {
            return null;
        }

        OptionAnswerEntity optionAnswerEntity = new OptionAnswerEntity();

        optionAnswerEntity.setId( optionAnswer.getId() );
        optionAnswerEntity.setValue( optionAnswer.getValue() );
        optionAnswerEntity.setCorrect( optionAnswer.isCorrect() );
        optionAnswerEntity.setQuestion( questionMapper.toEntity( optionAnswer.getQuestion() ) );
        optionAnswerEntity.setAnswerOptions( answerOptionListToAnswerOptionEntityList( optionAnswer.getAnswerOptions() ) );

        return optionAnswerEntity;
    }

    protected AnswerOptionEntity answerOptionToAnswerOptionEntity(AnswerOption answerOption) {
        if ( answerOption == null ) {
            return null;
        }

        AnswerOptionEntity answerOptionEntity = new AnswerOptionEntity();

        answerOptionEntity.setId( answerOption.getId() );
        answerOptionEntity.setAnswer( answerToAnswerEntity( answerOption.getAnswer() ) );
        answerOptionEntity.setOptionAnswer( optionAnswerToOptionAnswerEntity( answerOption.getOptionAnswer() ) );

        return answerOptionEntity;
    }

    protected List<AnswerOptionEntity> answerOptionListToAnswerOptionEntityList(List<AnswerOption> list) {
        if ( list == null ) {
            return null;
        }

        List<AnswerOptionEntity> list1 = new ArrayList<AnswerOptionEntity>( list.size() );
        for ( AnswerOption answerOption : list ) {
            list1.add( answerOptionToAnswerOptionEntity( answerOption ) );
        }

        return list1;
    }

    protected AnswerEntity answerToAnswerEntity(Answer answer) {
        if ( answer == null ) {
            return null;
        }

        AnswerEntity answerEntity = new AnswerEntity();

        answerEntity.setId( answer.getId() );
        answerEntity.setTextValue( answer.getTextValue() );
        answerEntity.setQuestion( questionMapper.toEntity( answer.getQuestion() ) );
        answerEntity.setRespondent( respondentToRespondentEntity( answer.getRespondent() ) );
        answerEntity.setAnswerOptions( answerOptionListToAnswerOptionEntityList( answer.getAnswerOptions() ) );

        return answerEntity;
    }

    protected List<AnswerEntity> answerListToAnswerEntityList(List<Answer> list) {
        if ( list == null ) {
            return null;
        }

        List<AnswerEntity> list1 = new ArrayList<AnswerEntity>( list.size() );
        for ( Answer answer : list ) {
            list1.add( answerToAnswerEntity( answer ) );
        }

        return list1;
    }

    protected RespondentEntity respondentToRespondentEntity(Respondent respondent) {
        if ( respondent == null ) {
            return null;
        }

        RespondentEntity respondentEntity = new RespondentEntity();

        respondentEntity.setId( respondent.getId() );
        respondentEntity.setName( respondent.getName() );
        respondentEntity.setEmail( respondent.getEmail() );
        respondentEntity.setPhone( respondent.getPhone() );
        respondentEntity.setSurvey( surveyToSurveyEntity( respondent.getSurvey() ) );
        respondentEntity.setAnswers( answerListToAnswerEntityList( respondent.getAnswers() ) );

        return respondentEntity;
    }

    protected List<RespondentEntity> respondentListToRespondentEntityList(List<Respondent> list) {
        if ( list == null ) {
            return null;
        }

        List<RespondentEntity> list1 = new ArrayList<RespondentEntity>( list.size() );
        for ( Respondent respondent : list ) {
            list1.add( respondentToRespondentEntity( respondent ) );
        }

        return list1;
    }

    protected SurveyEntity surveyToSurveyEntity(Survey survey) {
        if ( survey == null ) {
            return null;
        }

        SurveyEntity surveyEntity = new SurveyEntity();

        surveyEntity.setId( survey.getId() );
        surveyEntity.setTitle( survey.getTitle() );
        surveyEntity.setDescription( survey.getDescription() );
        surveyEntity.setTemplateId( survey.getTemplateId() );
        surveyEntity.setStatus( survey.getStatus() );
        surveyEntity.setPublicationDate( survey.getPublicationDate() );
        surveyEntity.setClosingDate( survey.getClosingDate() );
        surveyEntity.setPages( toEntityList( survey.getPages() ) );
        surveyEntity.setRespondents( respondentListToRespondentEntityList( survey.getRespondents() ) );

        return surveyEntity;
    }
}
