package com.hexagonal.meditation.generation.application.validator;

import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("TextLengthEstimator Tests")
class TextLengthEstimatorTest {
    
    private TextLengthEstimator estimator;
    
    @BeforeEach
    void setUp() {
        estimator = new TextLengthEstimator();
    }
    
    @Test
    @DisplayName("Should estimate duration for typical meditation text (150 wpm)")
    void shouldEstimateDurationForTypicalText() {
        // 75 words → 30 seconds at 150 wpm
        String text = generateWords(75);
        
        int duration = estimator.estimateDuration(text);
        
        assertThat(duration).isEqualTo(30);
    }
    
    @Test
    @DisplayName("Should estimate duration for longer text")
    void shouldEstimateDurationForLongerText() {
        // 300 words → 120 seconds (2 minutes) at 150 wpm
        String text = generateWords(300);
        
        int duration = estimator.estimateDuration(text);
        
        assertThat(duration).isEqualTo(120);
    }
    
    @Test
    @DisplayName("Should return 0 for null text")
    void shouldReturnZeroForNullText() {
        int duration = estimator.estimateDuration(null);
        
        assertThat(duration).isEqualTo(0);
    }
    
    @Test
    @DisplayName("Should return 0 for empty text")
    void shouldReturnZeroForEmptyText() {
        int duration = estimator.estimateDuration("");
        
        assertThat(duration).isEqualTo(0);
    }
    
    @Test
    @DisplayName("Should return 0 for blank text")
    void shouldReturnZeroForBlankText() {
        int duration = estimator.estimateDuration("   \n\t   ");
        
        assertThat(duration).isEqualTo(0);
    }
    
    @Test
    @DisplayName("Should return minimum 1 second for very short text")
    void shouldReturnMinimumOneSecond() {
        // 1-2 words would be < 1 second, but we enforce minimum
        String text = "word";
        
        int duration = estimator.estimateDuration(text);
        
        assertThat(duration).isEqualTo(1);
    }
    
    @Test
    @DisplayName("Should handle text with multiple whitespace types")
    void shouldHandleMultipleWhitespaceTypes() {
        String text = "word1  word2\tword3\nword4  word5";
        
        int duration = estimator.estimateDuration(text);
        
        // 5 words → 2 seconds at 150 wpm (5 * 60 / 150 = 2)
        assertThat(duration).isEqualTo(2);
    }
    
    @Test
    @DisplayName("Should validate and accept text with sufficient duration")
    void shouldValidateAndAcceptSufficientText() {
        // 75 words → 30 seconds (exactly at threshold)
        String text = generateWords(75);
        
        int duration = estimator.validateAndEstimate(text);
        
        assertThat(duration).isEqualTo(30);
    }
    
    @Test
    @DisplayName("Should reject null text during validation")
    void shouldRejectNullText() {
        assertThatThrownBy(() -> estimator.validateAndEstimate(null))
            .isInstanceOf(InvalidContentException.class)
            .hasMessageContaining("Text cannot be empty");
    }
    
    @Test
    @DisplayName("Should reject empty text during validation")
    void shouldRejectEmptyText() {
        assertThatThrownBy(() -> estimator.validateAndEstimate(""))
            .isInstanceOf(InvalidContentException.class)
            .hasMessageContaining("Text cannot be empty");
    }
    
    @Test
    @DisplayName("Should reject blank text during validation")
    void shouldRejectBlankText() {
        assertThatThrownBy(() -> estimator.validateAndEstimate("   \n\t   "))
            .isInstanceOf(InvalidContentException.class)
            .hasMessageContaining("Text cannot be empty");
    }
    
    @Test
    @DisplayName("Should reject text that is too short")
    void shouldRejectTooShortText() {
        // 5 words → 2 seconds at 150 wpm (below 5s threshold)
        String text = generateWords(5);
        
        assertThatThrownBy(() -> estimator.validateAndEstimate(text))
            .isInstanceOf(InvalidContentException.class)
            .hasMessageContaining("Text too short")
            .hasMessageContaining("estimated 2 seconds")
            .hasMessageContaining("minimum 5 seconds");
    }
    
    @Test
    @DisplayName("Should include field name in validation errors")
    void shouldIncludeFieldNameInErrors() {
        assertThatThrownBy(() -> estimator.validateAndEstimate(""))
            .isInstanceOf(InvalidContentException.class)
            .extracting("fieldName")
            .isEqualTo("narrationText");
    }

    @Test
    @DisplayName("Should reject text that is too long")
    void shouldRejectTooLongText() {
        // 100 words → 40 seconds (above 30s threshold)
        String text = generateWords(100);
        
        assertThatThrownBy(() -> estimator.validateAndEstimate(text))
            .isInstanceOf(com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException.class)
            .hasMessageContaining("exceed 30 seconds");
    }
    
    /**
     * Helper to generate text with specific word count
     */
    private String generateWords(int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            if (i > 0) {
                sb.append(" ");
            }
            sb.append("word").append(i + 1);
        }
        return sb.toString();
    }
}
