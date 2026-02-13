"""
Nomenclature Validation Service

Validates layer names against ISO-19650 naming conventions.
Ensures all block layer names follow the standardized pattern for
construction documentation and BIM compliance.
"""

import re
import structlog
from typing import List

# Conditional imports for agent vs backend context
try:
    from constants import ISO_19650_LAYER_NAME_PATTERN
    from models import LayerInfo
except ModuleNotFoundError:
    from src.agent.constants import ISO_19650_LAYER_NAME_PATTERN
    from src.agent.models import LayerInfo

# Import backend schema for validation errors
try:
    from schemas import ValidationErrorItem
except ModuleNotFoundError:
    from src.backend.schemas import ValidationErrorItem

logger = structlog.get_logger()


class NomenclatureValidator:
    """
    Service for validating layer nomenclature against ISO-19650 standards.
    
    Validates that layer names follow the pattern:
    [PREFIX]-[ZONE/CODE]-[TYPE]-[ID]
    
    Examples:
        - Valid: SF-NAV-COL-001, SFC-NAV1-A-999
        - Invalid: sf-nav-col-001 (lowercase), SF_NAV_COL_001 (underscores)
    """
    
    def __init__(self):
        """Initialize validator with compiled regex pattern."""
        self.pattern = re.compile(ISO_19650_LAYER_NAME_PATTERN)
        logger.info(
            "nomenclature_validator.initialized",
            pattern=ISO_19650_LAYER_NAME_PATTERN
        )
    
    def validate_nomenclature(self, layers: List[LayerInfo]) -> List[ValidationErrorItem]:
        """
        Validate layer names against ISO-19650 pattern.
        
        Args:
            layers: List of LayerInfo objects to validate
            
        Returns:
            List of ValidationErrorItem for layers that fail validation.
            Empty list if all layers are valid.
            
        Examples:
            >>> validator = NomenclatureValidator()
            >>> layers = [LayerInfo(name="SF-NAV-COL-001", index=0)]
            >>> errors = validator.validate_nomenclature(layers)
            >>> len(errors)
            0
            
            >>> bad_layers = [LayerInfo(name="invalid_name", index=0)]
            >>> errors = validator.validate_nomenclature(bad_layers)
            >>> len(errors)
            1
            >>> errors[0].category
            'nomenclature'
        """
        raise NotImplementedError("validate_nomenclature not implemented yet (TDD-RED phase)")
