"""
User String Extraction Service

Extracts custom user-defined metadata from Rhino .3dm files.
User strings are key-value pairs attached to documents, layers, and objects
for ISO-19650 compliance and manufacturing traceability.
"""

import structlog
from typing import Optional, Dict

# Conditional import for models
try:
    from models import UserStringCollection
except ModuleNotFoundError:
    from src.agent.models import UserStringCollection

logger = structlog.get_logger()


class UserStringExtractor:
    """
    Service for extracting user strings from Rhino models.
    
    Implements the extraction logic for document-level, layer-level,
    and object-level user strings using rhino3dm API.
    """
    
    def extract(self, model) -> UserStringCollection:
        """
        Extract all user strings from a rhino3dm.File3dm model.
        
        Args:
            model: rhino3dm.File3dm object (already parsed)
            
        Returns:
            UserStringCollection with document/layer/object user strings
        """
        # Handle None model gracefully
        if model is None:
            logger.warning("user_string_extractor.extract.model_is_none")
            return UserStringCollection()
        
        logger.info("user_string_extractor.extract.started")
        
        collection = UserStringCollection()
        
        # 1. Extract document-level user strings
        collection.document = self._extract_document_strings(model)
        
        # 2. Extract layer-level user strings
        collection.layers = self._extract_layer_strings(model)
        
        # 3. Extract object-level user strings
        collection.objects = self._extract_object_strings(model)
        
        logger.info(
            "user_string_extractor.extract.completed",
            document_keys=len(collection.document),
            layer_count=len(collection.layers),
            object_count=len(collection.objects)
        )
        
        return collection
    
    def _extract_document_strings(self, model) -> Dict[str, str]:
        """
        Extract user strings from document.
        
        Args:
            model: rhino3dm.File3dm object
            
        Returns:
            Dict of key-value pairs from document strings
        """
        result = {}
        
        try:
            if hasattr(model, 'Strings') and model.Strings is not None:
                strings = model.Strings
                if hasattr(strings, 'Keys'):
                    for key in strings.Keys:
                        try:
                            result[key] = strings[key]
                        except (KeyError, IndexError, AttributeError) as e:
                            logger.warning(
                                "user_string_extractor.document.key_error",
                                key=key,
                                error=str(e)
                            )
        except Exception as e:
            logger.exception(
                "user_string_extractor.document.extraction_error",
                error=str(e)
            )
        
        return result
    
    def _extract_layer_strings(self, model) -> Dict[str, Dict[str, str]]:
        """
        Extract user strings from all layers.
        
        Args:
            model: rhino3dm.File3dm object
            
        Returns:
            Dict mapping layer_name -> user strings dict
        """
        result = {}
        
        try:
            if hasattr(model, 'Layers') and model.Layers is not None:
                for layer in model.Layers:
                    try:
                        layer_name = layer.Name if hasattr(layer, 'Name') else None
                        if not layer_name:
                            continue
                        
                        # Get user strings for this layer
                        if hasattr(layer, 'GetUserStrings'):
                            user_strings = layer.GetUserStrings()
                            
                            if user_strings is not None and hasattr(user_strings, 'Keys'):
                                layer_dict = {}
                                for key in user_strings.Keys:
                                    try:
                                        layer_dict[key] = user_strings[key]
                                    except (KeyError, IndexError, AttributeError) as e:
                                        logger.warning(
                                            "user_string_extractor.layer.key_error",
                                            layer=layer_name,
                                            key=key,
                                            error=str(e)
                                        )
                                
                                # Only add to result if we got strings
                                if layer_dict:
                                    result[layer_name] = layer_dict
                    
                    except AttributeError as e:
                        logger.warning(
                            "user_string_extractor.layer.attribute_error",
                            error=str(e)
                        )
                        # Continue processing other layers
                        continue
                    
                    except Exception as e:
                        logger.exception(
                            "user_string_extractor.layer.unexpected_error",
                            error=str(e)
                        )
                        # Continue processing other layers
                        continue
        
        except Exception as e:
            logger.exception(
                "user_string_extractor.layers.extraction_error",
                error=str(e)
            )
        
        return result
    
    def _extract_object_strings(self, model) -> Dict[str, Dict[str, str]]:
        """
        Extract user strings from all objects.
        
        Args:
            model: rhino3dm.File3dm object
            
        Returns:
            Dict mapping object_uuid -> user strings dict
        """
        result = {}
        
        try:
            if hasattr(model, 'Objects') and model.Objects is not None:
                for obj in model.Objects:
                    try:
                        # Get object UUID
                        if not hasattr(obj, 'Attributes'):
                            continue
                        
                        attrs = obj.Attributes
                        if not hasattr(attrs, 'Id'):
                            continue
                        
                        obj_uuid = str(attrs.Id)
                        
                        # Get user strings for this object
                        if hasattr(attrs, 'GetUserStrings'):
                            user_strings = attrs.GetUserStrings()
                            
                            if user_strings is not None and hasattr(user_strings, 'Keys'):
                                obj_dict = {}
                                for key in user_strings.Keys:
                                    try:
                                        obj_dict[key] = user_strings[key]
                                    except (KeyError, IndexError, AttributeError) as e:
                                        logger.warning(
                                            "user_string_extractor.object.key_error",
                                            uuid=obj_uuid,
                                            key=key,
                                            error=str(e)
                                        )
                                
                                # Only add to result if we got strings
                                if obj_dict:
                                    result[obj_uuid] = obj_dict
                    
                    except Exception as e:
                        logger.exception(
                            "user_string_extractor.object.unexpected_error",
                            error=str(e)
                        )
                        # Continue processing other objects
                        continue
        
        except Exception as e:
            logger.exception(
                "user_string_extractor.objects.extraction_error",
                error=str(e)
            )
        
        return result

