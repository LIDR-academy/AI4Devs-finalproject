package co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
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
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2024-09-22T16:12:48-0500",
    comments = "version: 1.6.1, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.10.1.jar, environment: Java 21 (Microsoft)"
)
@Component
public class RespondentMapperImpl implements RespondentMapper {

    @Override
    public Respondent toDomain(RespondentEntity respondentEntity) {
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

    @Override
    public List<Respondent> toDomainList(List<RespondentEntity> respondentEntities) {
        if ( respondentEntities == null ) {
            return null;
        }

        List<Respondent> list = new ArrayList<Respondent>( respondentEntities.size() );
        for ( RespondentEntity respondentEntity : respondentEntities ) {
            list.add( toDomain( respondentEntity ) );
        }

        return list;
    }

    @Override
    public RespondentEntity toEntity(Respondent respondent) {
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

    @Override
    public List<RespondentEntity> toEntityList(List<Respondent> respondents) {
        if ( respondents == null ) {
            return null;
        }

        List<RespondentEntity> list = new ArrayList<RespondentEntity>( respondents.size() );
        for ( Respondent respondent : respondents ) {
            list.add( toEntity( respondent ) );
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
        optionAnswer.setQuestion( questionEntityToQuestion( optionAnswerEntity.getQuestion() ) );
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
        answer.setQuestion( questionEntityToQuestion( answerEntity.getQuestion() ) );
        answer.setRespondent( toDomain( answerEntity.getRespondent() ) );
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
        question.setAnswers( answerEntityListToAnswerList( questionEntity.getAnswers() ) );
        question.setOptionAnswers( optionAnswerEntityListToOptionAnswerList( questionEntity.getOptionAnswers() ) );

        return question;
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
        survey.setRespondents( toDomainList( surveyEntity.getRespondents() ) );

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
        optionAnswerEntity.setQuestion( questionToQuestionEntity( optionAnswer.getQuestion() ) );
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
        answerEntity.setQuestion( questionToQuestionEntity( answer.getQuestion() ) );
        answerEntity.setRespondent( toEntity( answer.getRespondent() ) );
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
        questionEntity.setAnswers( answerListToAnswerEntityList( question.getAnswers() ) );
        questionEntity.setOptionAnswers( optionAnswerListToOptionAnswerEntityList( question.getOptionAnswers() ) );

        return questionEntity;
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
        surveyEntity.setRespondents( toEntityList( survey.getRespondents() ) );

        return surveyEntity;
    }
}
