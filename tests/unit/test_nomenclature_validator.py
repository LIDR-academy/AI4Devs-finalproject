r"""
Unit Tests for NomenclatureValidator Service

Tests ISO-19650 layer name validation against regex pattern:
^[A-Z]{2,3}-[A-Z0-9]{3,4}-[A-Z]{1,2}-\d{3}$

Test Coverage:
- Happy Path: Valid layer names
- Edge Cases: Invalid formats, mixed valid/invalid, empty lists
- Security: None inputs, Unicode/special characters
"""

import pytest
from src.agent.services.nomenclature_validator import NomenclatureValidator
from src.agent.models import LayerInfo


# ===== HAPPY PATH TESTS =====

def test_validate_nomenclature_all_valid_layers():
    """
    GIVEN a list of layers with valid ISO-19650 names
    WHEN validate_nomenclature is called
    THEN return empty list (no errors)
    """
    validator = NomenclatureValidator()

    valid_layers = [
        LayerInfo(name="SF-NAV-CO-001", index=0, object_count=10, is_visible=True),
        LayerInfo(name="SFC-NAV1-A-999", index=1, object_count=5, is_visible=True),
        LayerInfo(name="AB-CD12-XY-123", index=2, object_count=20, is_visible=False),
    ]

    errors = validator.validate_nomenclature(valid_layers)

    assert errors == [], f"Expected no errors for valid layers, got {errors}"
    assert isinstance(errors, list), "validate_nomenclature must return a list"


def test_validate_nomenclature_empty_list():
    """
    GIVEN an empty list of layers
    WHEN validate_nomenclature is called
    THEN return empty list (no layers to validate)
    """
    validator = NomenclatureValidator()

    errors = validator.validate_nomenclature([])

    assert errors == [], "Empty layer list should return empty error list"


# ===== EDGE CASE TESTS =====

def test_validate_nomenclature_all_invalid_layers():
    """
    GIVEN a list of layers with invalid names
    WHEN validate_nomenclature is called
    THEN return ValidationErrorItem for each invalid layer
    """
    validator = NomenclatureValidator()

    invalid_layers = [
        LayerInfo(name="bloque_test", index=0, object_count=5, is_visible=True),
        LayerInfo(name="SF_NAV_COL_001", index=1, object_count=3, is_visible=True),  # Underscores
    ]

    errors = validator.validate_nomenclature(invalid_layers)

    assert len(errors) == 2, f"Expected 2 errors, got {len(errors)}"

    # Verify first error
    assert errors[0].category == "nomenclature"
    assert errors[0].target == "bloque_test"
    assert "ISO-19650" in errors[0].message or "pattern" in errors[0].message.lower()
    assert "Expected format" in errors[0].message or "[PREFIX]-[ZONE]-[TYPE]-[ID]" in errors[0].message

    # Verify second error
    assert errors[1].category == "nomenclature"
    assert errors[1].target == "SF_NAV_COL_001"


def test_validate_nomenclature_mixed_valid_invalid():
    """
    GIVEN a list with both valid and invalid layer names
    WHEN validate_nomenclature is called
    THEN return errors ONLY for invalid layers
    """
    validator = NomenclatureValidator()

    mixed_layers = [
        LayerInfo(name="SF-NAV-CO-001", index=0, object_count=10, is_visible=True),  # Valid
        LayerInfo(name="invalid_name", index=1, object_count=5, is_visible=True),     # Invalid
        LayerInfo(name="ABC-DEFG-AB-999", index=2, object_count=8, is_visible=True),  # Valid
        LayerInfo(name="SF-NAV-CO-01", index=3, object_count=3, is_visible=True),    # Invalid (2 digits)
    ]

    errors = validator.validate_nomenclature(mixed_layers)

    assert len(errors) == 2, f"Expected 2 errors for invalid layers, got {len(errors)}"

    # Verify errors are for the invalid layers only
    error_targets = [err.target for err in errors]
    assert "invalid_name" in error_targets
    assert "SF-NAV-CO-01" in error_targets
    assert "SF-NAV-CO-001" not in error_targets
    assert "ABC-DEFG-AB-999" not in error_targets


def test_validate_nomenclature_case_sensitivity():
    """
    GIVEN layers with lowercase letters (should be uppercase per ISO-19650)
    WHEN validate_nomenclature is called
    THEN return errors for all lowercase names
    """
    validator = NomenclatureValidator()

    lowercase_layers = [
        LayerInfo(name="sf-nav-co-001", index=0, object_count=5, is_visible=True),  # All lowercase
        LayerInfo(name="SF-nav-CO-001", index=1, object_count=3, is_visible=True),  # Mixed case
    ]

    errors = validator.validate_nomenclature(lowercase_layers)

    assert len(errors) == 2, "Lowercase letters should fail ISO-19650 validation"
    assert all(err.category == "nomenclature" for err in errors)


def test_validate_nomenclature_special_characters():
    """
    GIVEN layers with special characters outside allowed pattern
    WHEN validate_nomenclature is called
    THEN return errors for all layers with invalid characters
    """
    validator = NomenclatureValidator()

    special_char_layers = [
        LayerInfo(name="SF@NAV-CO-001", index=0, object_count=5, is_visible=True),  # @ symbol
        LayerInfo(name="SF-NAV CO-001", index=1, object_count=3, is_visible=True),  # Space instead of dash
        LayerInfo(name="SF-NAV-CO-001!", index=2, object_count=2, is_visible=True), # Exclamation at end
    ]

    errors = validator.validate_nomenclature(special_char_layers)

    assert len(errors) == 3, "Special characters should fail validation"
    assert all(err.category == "nomenclature" for err in errors)


# ===== SECURITY / ERROR HANDLING TESTS =====

def test_validate_nomenclature_none_input():
    """
    GIVEN None as input (defensive programming test)
    WHEN validate_nomenclature is called
    THEN return empty list (handle gracefully) or raise TypeError
    """
    validator = NomenclatureValidator()

    # Option 1: Handle gracefully
    try:
        errors = validator.validate_nomenclature(None)
        assert errors == [], "None input should return empty list (graceful handling)"
    except TypeError:
        # Option 2: Raise TypeError (also acceptable)
        pytest.skip("Implementation raises TypeError for None input (acceptable)")


def test_validate_nomenclature_unicode_emoji():
    """
    GIVEN layers with Unicode characters or emojis
    WHEN validate_nomenclature is called
    THEN return errors for all non-ASCII names
    """
    validator = NomenclatureValidator()

    unicode_layers = [
        LayerInfo(name="SF-NAV-CO-001🔥", index=0, object_count=5, is_visible=True),  # Emoji
        LayerInfo(name="SF-NÃV-CO-001", index=1, object_count=3, is_visible=True),    # Accented char
        LayerInfo(name="层-NAV-CO-001", index=2, object_count=2, is_visible=True),     # Chinese char
    ]

    errors = validator.validate_nomenclature(unicode_layers)

    assert len(errors) == 3, "Unicode/emoji characters should fail validation"
    assert all(err.category == "nomenclature" for err in errors)


# ===== BOUNDARY TESTS =====

def test_validate_nomenclature_regex_boundaries():
    """
    GIVEN layers at the boundaries of the regex pattern
    WHEN validate_nomenclature is called
    THEN correctly validate based on exact pattern constraints
    """
    validator = NomenclatureValidator()

    boundary_layers = [
        # Valid boundaries
        LayerInfo(name="AB-CDE-F-000", index=0, object_count=1, is_visible=True),     # Minimum valid
        LayerInfo(name="ABC-DEFG-XY-999", index=1, object_count=1, is_visible=True),  # Maximum valid

        # Invalid boundaries (outside pattern)
        LayerInfo(name="A-CDE-F-000", index=2, object_count=1, is_visible=True),      # Prefix too short (1 char)
        LayerInfo(name="ABCD-CDE-F-000", index=3, object_count=1, is_visible=True),   # Prefix too long (4 chars)
        LayerInfo(name="AB-CD-F-000", index=4, object_count=1, is_visible=True),      # Zone too short (2 chars)
        LayerInfo(name="AB-CDEFG-F-000", index=5, object_count=1, is_visible=True),   # Zone too long (5 chars)
        LayerInfo(name="AB-CDE-FGH-000", index=6, object_count=1, is_visible=True),   # Type too long (3 chars)
        LayerInfo(name="AB-CDE-F-99", index=7, object_count=1, is_visible=True),      # ID too short (2 digits)
        LayerInfo(name="AB-CDE-F-9999", index=8, object_count=1, is_visible=True),    # ID too long (4 digits)
    ]

    errors = validator.validate_nomenclature(boundary_layers)

    # Should have errors for all 7 invalid boundary cases
    assert len(errors) == 7, f"Expected 7 errors for boundary violations, got {len(errors)}"

    # Verify valid boundaries are NOT in errors
    error_targets = [err.target for err in errors]
    assert "AB-CDE-F-000" not in error_targets, "Minimum valid should not error"
    assert "ABC-DEFG-XY-999" not in error_targets, "Maximum valid should not error"

    # Verify FGH (3 chars) is in errors
    assert "AB-CDE-FGH-000" in error_targets, "Type with 3 chars should error"
