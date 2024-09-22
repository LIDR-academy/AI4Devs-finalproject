package co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.mapper.AnswerOptionMapper;
import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper.RespondentMapper;
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
    date = "2024-09-22T16:12:47-0500",
    comments = "version: 1.6.1, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.10.1.jar, environment: Java 21 (Microsoft)"
)
@Component
public class AnswerMapperImpl implements AnswerMapper {

    @Autowired
    private RespondentMapper respondentMapper;
    @Autowired
    private AnswerOptionMapper answerOptionMapper;

    @Override
    public Answer toDomain(AnswerEntity answerEntity) {
        if ( answerEntity == null ) {
            return null;
        }

        Answer answer = new Answer();

        answer.setId( answerEntity.getId() );
        answer.setTextValue( answerEntity.getTextValue() );
        answer.setQuestion( questionEntityToQuestion( answerEntity.getQuestion() ) );
        answer.setRespondent( respondentMapper.toDomain( answerEntity.getRespondent() ) );
        answer.setAnswerOptions( answerOptionMapper.toDomainList( answerEntity.getAnswerOptions() ) );

        return answer;
    }

    @Override
    public List<Answer> toDomainList(List<AnswerEntity> answerEntities) {
        if ( answerEntities == null ) {
            return null;
        }

        List<Answer> list = new ArrayList<Answer>( answerEntities.size() );
        for ( AnswerEntity answerEntity : answerEntities ) {
            list.add( toDomain( answerEntity ) );
        }

        return list;
    }

    @Override
    public AnswerEntity toEntity(Answer answer) {
        if ( answer == null ) {
            return null;
        }

        AnswerEntity answerEntity = new AnswerEntity();

        answerEntity.setId( answer.getId() );
        answerEntity.setTextValue( answer.getTextValue() );
        answerEntity.setQuestion( questionToQuestionEntity( answer.getQuestion() ) );
        answerEntity.setRespondent( respondentMapper.toEntity( answer.getRespondent() ) );
        answerEntity.setAnswerOptions( answerOptionMapper.toEntityList( answer.getAnswerOptions() ) );

        return answerEntity;
    }

    @Override
    public List<AnswerEntity> toEntityList(List<Answer> answers) {
        if ( answers == null ) {
            return null;
        }

        List<AnswerEntity> list = new ArrayList<AnswerEntity>( answers.size() );
        for ( Answer answer : answers ) {
            list.add( toEntity( answer ) );
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
        survey.setRespondents( respondentMapper.toDomainList( surveyEntity.getRespondents() ) );

        return survey;
    }

    protected OptionAnswer optionAnswerEntityToOptionAnswer(OptionAnswerEntity optionAnswerEntity) {
        if ( optionAnswerEntity == null ) {
            return null;
        }

        OptionAnswer optionAnswer = new OptionAnswer();

        optionAnswer.setId( optionAnswerEntity.getId() );
        optionAnswer.setValue( optionAnswerEntity.getValue() );
        optionAnswer.setCorrect( optionAnswerEntity.isCorrect() );
        optionAnswer.setQuestion( questionEntityToQuestion( optionAnswerEntity.getQuestion() ) );
        optionAnswer.setAnswerOptions( answerOptionMapper.toDomainList( optionAnswerEntity.getAnswerOptions() ) );

        return optionAnswer;
    }

    protected List<OptionAnswer> optionAnswerEntityListToOptionAnswerList(List<OptionAnswerEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<OptionAnswer> list1 = new ArrayList<OptionAnswer>( list.size() );
        for ( OptionAnswerEntity optionAnswerEntity : list ) {
            list1.add( optionAnswerEntityToOptionAnswer( optionAnswerEntity ) );
        }

        return list1;
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
        question.setAnswers( toDomainList( questionEntity.getAnswers() ) );
        question.setOptionAnswers( optionAnswerEntityListToOptionAnswerList( questionEntity.getOptionAnswers() ) );

        return question;
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
        surveyEntity.setRespondents( respondentMapper.toEntityList( survey.getRespondents() ) );

        return surveyEntity;
    }

    protected OptionAnswerEntity optionAnswerToOptionAnswerEntity(OptionAnswer optionAnswer) {
        if ( optionAnswer == null ) {
            return null;
        }

        OptionAnswerEntity optionAnswerEntity = new OptionAnswerEntity();

        optionAnswerEntity.setId( optionAnswer.getId() );
        optionAnswerEntity.setValue( optionAnswer.getValue() );
        optionAnswerEntity.setCorrect( optionAnswer.isCorrect() );
        optionAnswerEntity.setQuestion( questionToQuestionEntity( optionAnswer.getQuestion() ) );
        optionAnswerEntity.setAnswerOptions( answerOptionMapper.toEntityList( optionAnswer.getAnswerOptions() ) );

        return optionAnswerEntity;
    }

    protected List<OptionAnswerEntity> optionAnswerListToOptionAnswerEntityList(List<OptionAnswer> list) {
        if ( list == null ) {
            return null;
        }

        List<OptionAnswerEntity> list1 = new ArrayList<OptionAnswerEntity>( list.size() );
        for ( OptionAnswer optionAnswer : list ) {
            list1.add( optionAnswerToOptionAnswerEntity( optionAnswer ) );
        }

        return list1;
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
        questionEntity.setAnswers( toEntityList( question.getAnswers() ) );
        questionEntity.setOptionAnswers( optionAnswerListToOptionAnswerEntityList( question.getOptionAnswers() ) );

        return questionEntity;
    }
}
