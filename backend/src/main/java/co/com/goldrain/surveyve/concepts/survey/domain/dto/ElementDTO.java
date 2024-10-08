package co.com.goldrain.surveyve.concepts.survey.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ElementDTO {
    public static final String TEXT = "text";
    public static final String COMMENT = "comment";
    public static final String RATING = "rating";
    public static final String DROPDOWN = "dropdown";

    public static final String COLOR = "color";
    public static final String DATE = "date";
    public static final String DATETIME_LOCAL = "datetime-local";
    public static final String EMAIL = "email";
    public static final String MONTH = "month";
    public static final String NUMBER = "number";
    public static final String PASSWORD = "password";
    public static final String RANGE = "range";
    public static final String TEL = "tel";
    public static final String TIME = "time";
    public static final String URL = "url";
    public static final String WEEK = "week";

    private UUID id;
    //text, comment, rating, dropdown
    private String type;
    private String name;
    private String title;
    @JsonProperty("isRequired")
    private boolean required;
    private boolean visible;
    private boolean readOnly;
    private String autocomplete;
    // Text
    // [color, date, datetime-local, email, month, number, password, range, tel, text, time, url, week]
    private String inputType;
    // Text -> range, date, datetime-local, month, number, time, week
    private String min;
    private String max;
    // Text -> range - number
    private Double step;
    // Text -> email, password, tel, text, url
    // Comment
    private String placeholder;
    // Rating
    private Integer rateCount;
    private Integer rateMax;
    private List<?> rateValues;
    // stars, smileys
    private String rateType;
    // Dropdown
    private List<?> choices;

    public ElementDTO(){
        required = false;
        visible = true;
        readOnly = false;
    }


    public void fix() {
        // La propiedad inputType solo se mantendrá si type es igual a "text"
        if (!TEXT.equals(this.type)) {
            this.inputType = null;
        }

        // La propiedad min solo se mantendrá si type es igual a "text" y la propiedad inputType es igual a alguna de estas
        if (!TEXT.equals(this.type) || this.inputType == null || !List.of(DATE, DATETIME_LOCAL, MONTH, NUMBER, RANGE, TIME, WEEK).contains(this.inputType)) {
            this.min = null;
        }

        // La propiedad max solo se mantendrá si type es igual a "text" y la propiedad inputType es igual a alguna de estas
        if (!TEXT.equals(this.type) || this.inputType == null || !List.of(DATE, DATETIME_LOCAL, MONTH, NUMBER, RANGE, TIME, WEEK).contains(this.inputType)) {
            this.max = null;
        }

        // La propiedad step solo se mantendrá si type es igual a "text" y la propiedad inputType es igual a alguna de estas
        if (!TEXT.equals(this.type) || this.inputType == null || !List.of(RANGE, NUMBER).contains(this.inputType)) {
            this.step = null;
        }

        // La propiedad placeholder solo se mantendrá si type es igual a "text" y la propiedad inputType es igual a alguna de estas: "email", "password", "tel", "text", "url". También si type es igual a "comment"
        if (!TEXT.equals(this.type) || this.inputType == null || !List.of(EMAIL, PASSWORD, TEL, TEXT, URL).contains(this.inputType)) {
            if (!COMMENT.equals(this.type)) {
                this.placeholder = null;
            }
        }

        if(COMMENT.equals(this.type)){
            this.autocomplete = null;
        }

        // Las propiedades rateCount, rateMax, rateType y rateValues solo se mantendrán si type es igual a "rating"
        if (!RATING.equals(this.type)) {
            this.rateCount = null;
            this.rateMax = null;
            this.rateType = null;
            this.rateValues = null;
        }

        // La propiedad choices solo se mantendrá si type es igual a "dropdown"
        if (!DROPDOWN.equals(this.type)) {
            this.choices = null;
        }
    }
}
