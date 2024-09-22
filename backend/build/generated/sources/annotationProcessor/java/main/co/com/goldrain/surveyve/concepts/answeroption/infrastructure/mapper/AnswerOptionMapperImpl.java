package co.com.goldrain.surveyve.concepts.answeroption.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper.OptionAnswerMapper;
import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
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
public class AnswerOptionMapperImpl implements AnswerOptionMapper {

    @Autowired
    private OptionAnswerMapper optionAnswerMapper;

    @Override
    public AnswerOption toDomain(AnswerOptionEntity answerOptionEntity) {
        if ( answerOptionEntity == null ) {
            return null;
        }

        AnswerOption answerOption = new AnswerOption();

        answerOption.setId( answerOptionEntity.getId() );
        answerOption.setAnswer( answerEntityToAnswer( answerOptionEntity.getAnswer() ) );
        answerOption.setOptionAnswer( optionAnswerMapper.toDomain( answerOptionEntity.getOptionAnswer() ) );

        return answerOption;
    }

    @Override
    public List<AnswerOption> toDomainList(List<AnswerOptionEntity> answerOptionEntities) {
        if ( answerOptionEntities == null ) {
            return null;
        }

        List<AnswerOption> list = new ArrayList<AnswerOption>( answerOptionEntities.size() );
        for ( AnswerOptionEntity answerOptionEntity : answerOptionEntities ) {
            list.add( toDomain( answerOptionEntity ) );
        }

        return list;
    }

    @Override
    public AnswerOptionEntity toEntity(AnswerOption answerOption) {
        if ( answerOption == null ) {
            return null;
        }

        AnswerOptionEntity answerOptionEntity = new AnswerOptionEntity();

        answerOptionEntity.setId( answerOption.getId() );
        answerOptionEntity.setAnswer( answerToAnswerEntity( answerOption.getAnswer() ) );
        answerOptionEntity.setOptionAnswer( optionAnswerMapper.toEntity( answerOption.getOptionAnswer() ) );

        return answerOptionEntity;
    }

    @Override
    public List<AnswerOptionEntity> toEntityList(List<AnswerOption> answerOptions) {
        if ( answerOptions == null ) {
            return null;
        }

        List<AnswerOptionEntity> list = new ArrayList<AnswerOptionEntity>( answerOptions.size() );
        for ( AnswerOption answerOption : answerOptions ) {
            list.add( toEntity( answerOption ) );
        }

        return list;
    }

    protected List<Question> questionEntityListToQuestionList(List<QuestionEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<Question> list1 = new ArrayList<Question>( list.size() );
        for ( QuestionEntity questionEntity : list ) {
            list1.add( questionEntityToQuestion( questionEntity ) );
        }

        return list1;
    }

    protected SurveyPage surveyPageEntityToSurveyPage(SurveyPageEntity surveyPageEntity) {
        if ( surveyPageEntity == null ) {
            return null;
        }

        SurveyPage surveyPage = new SurveyPage();

        surveyPage.setId( surveyPageEntity.getId() );
        surveyPage.setPageNumber( surveyPageEntity.getPageNumber() );
        surveyPage.setSurvey( surveyEntityToSurvey( surveyPageEntity.getSurvey() ) );
        surveyPage.setQuestions( questionEntityListToQuestionList( surveyPageEntity.getQuestions() ) );

        return surveyPage;
    }

    protected List<SurveyPage> surveyPageEntityListToSurveyPageList(List<SurveyPageEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<SurveyPage> list1 = new ArrayList<SurveyPage>( list.size() );
        for ( SurveyPageEntity surveyPageEntity : list ) {
            list1.add( surveyPageEntityToSurveyPage( surveyPageEntity ) );
        }

        return list1;
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
        survey.setPages( surveyPageEntityListToSurveyPageList( surveyEntity.getPages() ) );
        survey.setRespondents( respondentEntityListToRespondentList( surveyEntity.getRespondents() ) );

        return survey;
    }

    protected Question questionEntityToQuestion(QuestionEntity questionEntity) {
        if ( questionEntity == null ) {
            return null;
        }

        Question question = new Question();

        question.setId( questionEntity.getId() );
        question.setStatement( questionEntity.getStatement() );
        question.setType( questionEntity.getType() );
        question.setTemplateId( questionEntity.getTemplateId() );
        question.setSurvey( surveyEntityToSurvey( questionEntity.getSurvey() ) );
        question.setSurveyPage( surveyPageEntityToSurveyPage( questionEntity.getSurveyPage() ) );
        question.setAnswers( answerEntityListToAnswerList( questionEntity.getAnswers() ) );
        question.setOptionAnswers( optionAnswerMapper.toDomainList( questionEntity.getOptionAnswers() ) );

        return question;
    }

    protected Answer answerEntityToAnswer(AnswerEntity answerEntity) {
        if ( answerEntity == null ) {
            return null;
        }

        Answer answer = new Answer();

        answer.setId( answerEntity.getId() );
        answer.setTextValue( answerEntity.getTextValue() );
        answer.setQuestion( questionEntityToQuestion( answerEntity.getQuestion() ) );
        answer.setRespondent( respondentEntityToRespondent( answerEntity.getRespondent() ) );
        answer.setAnswerOptions( toDomainList( answerEntity.getAnswerOptions() ) );

        return answer;
    }

    protected List<QuestionEntity> questionListToQuestionEntityList(List<Question> list) {
        if ( list == null ) {
            return null;
        }

        List<QuestionEntity> list1 = new ArrayList<QuestionEntity>( list.size() );
        for ( Question question : list ) {
            list1.add( questionToQuestionEntity( question ) );
        }

        return list1;
    }

    protected SurveyPageEntity surveyPageToSurveyPageEntity(SurveyPage surveyPage) {
        if ( surveyPage == null ) {
            return null;
        }

        SurveyPageEntity surveyPageEntity = new SurveyPageEntity();

        surveyPageEntity.setId( surveyPage.getId() );
        surveyPageEntity.setPageNumber( surveyPage.getPageNumber() );
        surveyPageEntity.setSurvey( surveyToSurveyEntity( surveyPage.getSurvey() ) );
        surveyPageEntity.setQuestions( questionListToQuestionEntityList( surveyPage.getQuestions() ) );

        return surveyPageEntity;
    }

    protected List<SurveyPageEntity> surveyPageListToSurveyPageEntityList(List<SurveyPage> list) {
        if ( list == null ) {
            return null;
        }

        List<SurveyPageEntity> list1 = new ArrayList<SurveyPageEntity>( list.size() );
        for ( SurveyPage surveyPage : list ) {
            list1.add( surveyPageToSurveyPageEntity( surveyPage ) );
        }

        return list1;
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
        surveyEntity.setPages( surveyPageListToSurveyPageEntityList( survey.getPages() ) );
        surveyEntity.setRespondents( respondentListToRespondentEntityList( survey.getRespondents() ) );

        return surveyEntity;
    }

    protected QuestionEntity questionToQuestionEntity(Question question) {
        if ( question == null ) {
            return null;
        }

        QuestionEntity questionEntity = new QuestionEntity();

        questionEntity.setId( question.getId() );
        questionEntity.setStatement( question.getStatement() );
        questionEntity.setType( question.getType() );
        questionEntity.setTemplateId( question.getTemplateId() );
        questionEntity.setSurvey( surveyToSurveyEntity( question.getSurvey() ) );
        questionEntity.setSurveyPage( surveyPageToSurveyPageEntity( question.getSurveyPage() ) );
        questionEntity.setAnswers( answerListToAnswerEntityList( question.getAnswers() ) );
        questionEntity.setOptionAnswers( optionAnswerMapper.toEntityList( question.getOptionAnswers() ) );

        return questionEntity;
    }

    protected AnswerEntity answerToAnswerEntity(Answer answer) {
        if ( answer == null ) {
            return null;
        }

        AnswerEntity answerEntity = new AnswerEntity();

        answerEntity.setId( answer.getId() );
        answerEntity.setTextValue( answer.getTextValue() );
        answerEntity.setQuestion( questionToQuestionEntity( answer.getQuestion() ) );
        answerEntity.setRespondent( respondentToRespondentEntity( answer.getRespondent() ) );
        answerEntity.setAnswerOptions( toEntityList( answer.getAnswerOptions() ) );

        return answerEntity;
    }
}
