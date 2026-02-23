package com.hexagonal.meditationbuilder.application.validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for TextLengthValidator.
 * 
 * Tests validation logic for meditation text length constraints.
 * Max length: 10,000 characters (based on edge cases from BDD).
 */
@DisplayName("TextLengthValidator")
class TextLengthValidatorTest {

    private TextLengthValidator validator;

    @BeforeEach
    void setUp() {
        validator = new TextLengthValidator();
    }

    @Nested
    @DisplayName("validate()")
    class ValidateTests {

        @Test
        @DisplayName("should return valid for text within limit")
        void shouldReturnValidForTextWithinLimit() {
            String text = "A".repeat(100);
            
            ValidationResult result = validator.validate(text);
            
            assertThat(result.isValid()).isTrue();
            assertThat(result.errorMessage()).isEmpty();
        }

        @Test
        @DisplayName("should return valid for text at exact limit")
        void shouldReturnValidForTextAtExactLimit() {
            String text = "A".repeat(10_000);
            
            ValidationResult result = validator.validate(text);
            
            assertThat(result.isValid()).isTrue();
        }

        @Test
        @DisplayName("should return invalid for text exceeding limit")
        void shouldReturnInvalidForTextExceedingLimit() {
            String text = "A".repeat(10_001);
            
            ValidationResult result = validator.validate(text);
            
            assertThat(result.isValid()).isFalse();
            assertThat(result.errorMessage()).isPresent();
            assertThat(result.errorMessage().get()).contains("10000");
        }

        @Test
        @DisplayName("should return valid for empty text")
        void shouldReturnValidForEmptyText() {
            ValidationResult result = validator.validate("");
            
            assertThat(result.isValid()).isTrue();
        }

        @Test
        @DisplayName("should return invalid for null text")
        void shouldReturnInvalidForNullText() {
            ValidationResult result = validator.validate(null);
            
            assertThat(result.isValid()).isFalse();
            assertThat(result.errorMessage()).isPresent();
            assertThat(result.errorMessage().get()).contains("null");
        }

        @Test
        @DisplayName("should handle unicode characters correctly")
        void shouldHandleUnicodeCharactersCorrectly() {
            // Unicode characters should count as their character length, not byte length
            String unicodeText = "🧘".repeat(2500) + "A".repeat(2500);
            
            ValidationResult result = validator.validate(unicodeText);
            
            assertThat(result.isValid()).isTrue();
        }
    }

    @Nested
    @DisplayName("getMaxLength()")
    class GetMaxLengthTests {

        @Test
        @DisplayName("should return 10000 as max length")
        void shouldReturn10000AsMaxLength() {
            assertThat(validator.getMaxLength()).isEqualTo(10_000);
        }
    }
}
