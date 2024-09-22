package co.com.goldrain.surveyve.concepts.question.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper.AnswerMapper;
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
public class QuestionMapperImpl implements QuestionMapper {

    @Autowired
    private AnswerMapper answerMapper;
    @Autowired
    private OptionAnswerMapper optionAnswerMapper;

    @Override
    public Question toDomain(QuestionEntity questionEntity) {
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
        question.setAnswers( answerMapper.toDomainList( questionEntity.getAnswers() ) );
        question.setOptionAnswers( optionAnswerMapper.toDomainList( questionEntity.getOptionAnswers() ) );

        return question;
    }

    @Override
    public List<Question> toDomainList(List<QuestionEntity> questionEntities) {
        if ( questionEntities == null ) {
            return null;
        }

        List<Question> list = new ArrayList<Question>( questionEntities.size() );
        for ( QuestionEntity questionEntity : questionEntities ) {
            list.add( toDomain( questionEntity ) );
        }

        return list;
    }

    @Override
    public QuestionEntity toEntity(Question question) {
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
        questionEntity.setAnswers( answerMapper.toEntityList( question.getAnswers() ) );
        questionEntity.setOptionAnswers( optionAnswerMapper.toEntityList( question.getOptionAnswers() ) );

        return questionEntity;
    }

    @Override
    public List<QuestionEntity> toEntityList(List<Question> questions) {
        if ( questions == null ) {
            return null;
        }

        List<QuestionEntity> list = new ArrayList<QuestionEntity>( questions.size() );
        for ( Question question : questions ) {
            list.add( toEntity( question ) );
        }

        return list;
    }

    protected SurveyPage surveyPageEntityToSurveyPage(SurveyPageEntity surveyPageEntity) {
        if ( surveyPageEntity == null ) {
            return null;
        }

        SurveyPage surveyPage = new SurveyPage();

        surveyPage.setId( surveyPageEntity.getId() );
        surveyPage.setPageNumber( surveyPageEntity.getPageNumber() );
        surveyPage.setSurvey( surveyEntityToSurvey( surveyPageEntity.getSurvey() ) );
        surveyPage.setQuestions( toDomainList( surveyPageEntity.getQuestions() ) );

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
        respondent.setAnswers( answerMapper.toDomainList( respondentEntity.getAnswers() ) );

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

    protected SurveyPageEntity surveyPageToSurveyPageEntity(SurveyPage surveyPage) {
        if ( surveyPage == null ) {
            return null;
        }

        SurveyPageEntity surveyPageEntity = new SurveyPageEntity();

        surveyPageEntity.setId( surveyPage.getId() );
        surveyPageEntity.setPageNumber( surveyPage.getPageNumber() );
        surveyPageEntity.setSurvey( surveyToSurveyEntity( surveyPage.getSurvey() ) );
        surveyPageEntity.setQuestions( toEntityList( surveyPage.getQuestions() ) );

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
        respondentEntity.setAnswers( answerMapper.toEntityList( respondent.getAnswers() ) );

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
}
