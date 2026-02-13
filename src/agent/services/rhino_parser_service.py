"""
Rhino Parser Service

Handles parsing of .3dm files using rhino3dm library.
Extracts layer information and file metadata.
"""

from pathlib import Path
from typing import Optional
import structlog
from src.agent.models import FileProcessingResult, LayerInfo
from src.agent.services.user_string_extractor import UserStringExtractor

# Import rhino3dm at module level for testability
# Mock in unit tests with: @patch('src.agent.services.rhino_parser_service.rhino3dm')
try:
    import rhino3dm
except ImportError:
    rhino3dm = None  # Will be handled in parse_file()

logger = structlog.get_logger()


class RhinoParserService:
    """
    Service for parsing Rhino .3dm files.
    
    Provides methods to extract layer information and metadata
    from .3dm files using the rhino3dm library.
    """
    
    def parse_file(self, file_path: str) -> FileProcessingResult:
        """
        Parse a .3dm file and extract metadata.
        
        Args:
            file_path: Absolute path to the .3dm file
            
        Returns:
            FileProcessingResult with parsed data or error information
        """
        # Check rhino3dm availability
        if rhino3dm is None:
            logger.error("rhino_parser.rhino3dm_not_installed")
            return FileProcessingResult(
                success=False,
                error_message="rhino3dm library not installed",
                layers=[],
                file_metadata={}
            )
        
        logger.info("rhino_parser.parse_file.started", file_path=file_path)
        
        # Validate file exists
        path = Path(file_path)
        if not path.exists():
            logger.error("rhino_parser.file_not_found", file_path=file_path)
            return FileProcessingResult(
                success=False,
                error_message=f"File not found: {file_path}",
                layers=[],
                file_metadata={}
            )
        
        try:
            # Parse .3dm file with rhino3dm
            model = rhino3dm.File3dm.Read(str(path))
            
            if model is None:
                logger.error("rhino_parser.read_failed", file_path=file_path)
                return FileProcessingResult(
                    success=False,
                    error_message=f"Failed to read .3dm file (corrupt or invalid format)",
                    layers=[],
                    file_metadata={}
                )
            
            # Extract layers
            layers = []
            for idx, layer in enumerate(model.Layers):
                # Count objects in this layer
                object_count = sum(1 for obj in model.Objects if obj.Attributes.LayerIndex == idx)
                
                # Extract color (handle both tuple and object formats)
                color = None
                if hasattr(layer, 'Color') and layer.Color is not None:
                    # rhino3dm Color can be a tuple (R, G, B, A) or an object with attributes
                    if isinstance(layer.Color, tuple):
                        # Tuple format: (R, G, B, A) or (R, G, B)
                        if len(layer.Color) >= 4:
                            color = [layer.Color[3], layer.Color[0], layer.Color[1], layer.Color[2]]  # ARGB
                        elif len(layer.Color) == 3:
                            color = [255, layer.Color[0], layer.Color[1], layer.Color[2]]  # Default alpha=255
                    else:
                        # Object format with attributes
                        color = [
                            getattr(layer.Color, 'A', 255),
                            getattr(layer.Color, 'R', 0),
                            getattr(layer.Color, 'G', 0),
                            getattr(layer.Color, 'B', 0)
                        ]
                
                layer_info = LayerInfo(
                    name=layer.Name,
                    index=idx,
                    object_count=object_count,
                    color=color,
                    is_visible=layer.Visible
                )
                layers.append(layer_info)
            
            # Extract file metadata
            file_metadata = {}
            
            # Units (convert enum to string)
            if hasattr(model.Settings, 'ModelUnitSystem'):
                unit_system = model.Settings.ModelUnitSystem
                # rhino3dm.UnitSystem is an enum, get string representation
                file_metadata['units'] = str(unit_system).split('.')[-1]
            
            # Tolerance
            if hasattr(model.Settings, 'ModelAbsoluteTolerance'):
                file_metadata['tolerance'] = model.Settings.ModelAbsoluteTolerance
            
            # Application version
            if hasattr(model, 'ApplicationName'):
                file_metadata['application_name'] = model.ApplicationName
            if hasattr(model, 'ApplicationVersion'):
                file_metadata['application_version'] = model.ApplicationVersion
            
            # Extract user strings (custom metadata embedded in .3dm file)
            extractor = UserStringExtractor()
            user_strings = extractor.extract(model)
            
            logger.info(
                "rhino_parser.parse_file.success",
                file_path=file_path,
                layer_count=len(layers),
                object_count=len(model.Objects),
                user_strings_extracted=bool(user_strings.document or user_strings.layers or user_strings.objects)
            )
            
            return FileProcessingResult(
                success=True,
                error_message=None,
                layers=layers,
                file_metadata=file_metadata,
                user_strings=user_strings.model_dump()
            )
            
        except Exception as e:
            logger.exception("rhino_parser.parse_file.error", file_path=file_path, error=str(e))
            return FileProcessingResult(
                success=False,
                error_message=f"Error parsing .3dm file: {str(e)}",
                layers=[],
                file_metadata={}
            )
