"""
Agent Data Models

Pydantic models for internal agent data structures.
These models represent intermediate processing results during .3dm validation.

NOTE: These are distinct from API schemas in src/backend/schemas.py.
Agent models are internal to worker processes, while backend schemas
define API contracts for client-server communication.
"""

from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class UserStringCollection(BaseModel):
    """
    User strings extracted from a Rhino .3dm file.
    
    Rhino allows attaching custom key-value pairs to documents, layers, and objects.
    These are critical for ISO-19650 compliance and manufacturing traceability.
    
    Attributes:
        document: Document-level user strings (project metadata)
        layers: Dict mapping layer_name -> user strings dict
        objects: Dict mapping object_uuid -> user strings dict
    """
    document: Dict[str, str] = Field(
        default_factory=dict,
        description="Document-level user strings (global metadata)"
    )
    layers: Dict[str, Dict[str, str]] = Field(
        default_factory=dict,
        description="Layer-level user strings keyed by layer name"
    )
    objects: Dict[str, Dict[str, str]] = Field(
        default_factory=dict,
        description="Object-level user strings keyed by object UUID"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "document": {
                    "Project": "SF-Sagrada-Familia",
                    "RevisionDate": "2026-01-15",
                    "BIM_Manager": "Pedro Cortés"
                },
                "layers": {
                    "SF-C12-M-001": {
                        "Workshop": "Granollers",
                        "MaterialType": "UHPC",
                        "ApprovalStatus": "Pending"
                    }
                },
                "objects": {
                    "3f2504e0-4f89-11d3-9a0c-0305e82c3301": {
                        "ISO_Code": "SF-C12-M-001",
                        "Mass": "450kg",
                        "ManufacturingNotes": "Pre-stress required",
                        "QA_Inspector": "Maria Garcia"
                    }
                }
            }
        }
    )


class LayerInfo(BaseModel):
    """
    Metadata extracted from a Rhino layer.
    
    Represents one layer in a .3dm file with its geometric and organizational properties.
    Used during parsing to build the validation report metadata.
    
    Attributes:
        name: Layer name (e.g., "SF-C12-M-001" for nomenclature validation)
        index: Zero-based layer index in the .3dm file
        object_count: Number of geometric objects residing in this layer
        color: Optional ARGB color code (e.g., [255, 128, 0, 255])
        is_visible: Layer visibility state at time of save
    """
    name: str = Field(..., description="Layer name for nomenclature validation")
    index: int = Field(..., ge=0, description="Zero-based layer index")
    object_count: int = Field(0, ge=0, description="Count of objects in layer")
    color: Optional[List[int]] = Field(None, description="ARGB color code [A,R,G,B]")
    is_visible: bool = Field(True, description="Layer visibility state")


class FileProcessingResult(BaseModel):
    """
    Aggregated result from .3dm file parsing and validation.
    
    This model represents the complete output of the rhino_parser_service,
    combining extraction success status with parsed data.
    
    Attributes:
        success: Processing completion status (False if file corrupt/unreadable)
        error_message: Human-readable error if success=False
        layers: List of extracted layer metadata
        file_metadata: Additional rhino3dm file properties (units, tolerances, etc.)
        parsed_at: ISO timestamp of processing completion
    """
    success: bool = Field(..., description="Processing status")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    layers: List[LayerInfo] = Field(default_factory=list, description="Extracted layer data")
    file_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional file properties (units, tolerance, application_version)"
    )
    user_strings: Optional[Dict[str, Any]] = Field(
        None,
        description="Extracted user strings from document/layers/objects (UserStringCollection structure)"
    )
    parsed_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Processing timestamp"
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "success": True,
                "error_message": None,
                "layers": [
                    {
                        "name": "SF-C12-M-001",
                        "index": 0,
                        "object_count": 42,
                        "color": [255, 128, 0, 255],
                        "is_visible": True
                    }
                ],
                "file_metadata": {
                    "units": "Meters",
                    "tolerance": 0.01,
                    "application_version": "7.0"
                },
                "parsed_at": "2026-02-12T19:00:00Z"
            }
        }
    )
