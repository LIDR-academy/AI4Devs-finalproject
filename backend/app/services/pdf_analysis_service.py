"""
PDF Analysis Service for SEPE Templates Comparator.

This service provides comprehensive PDF analysis functionality including:
- AcroForm field extraction using PyPDF2
- Text extraction and proximity detection using pdfplumber  
- Field ordering preservation based on document position
- Support for multiple field types (text, radiobutton, checkbox, listbox)
- Comprehensive error handling for various PDF processing scenarios
"""
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import math
import re

import PyPDF2
import pdfplumber
from PyPDF2.errors import PdfReadError


logger = logging.getLogger(__name__)


class PDFProcessingError(Exception):
    """Base exception for PDF processing errors."""
    pass


class InvalidPDFError(PDFProcessingError):
    """Raised when PDF file is invalid or corrupted."""
    pass


class NoFormFieldsError(PDFProcessingError):
    """Raised when PDF contains no AcroForm fields."""
    pass


@dataclass
class TemplateFieldData:
    """Data structure for PDF form field analysis results."""
    
    field_id: str
    type: str
    near_text: str
    value_options: Optional[List[str]] = None


class PDFAnalysisService:
    """Service for analyzing PDF templates and extracting form field structure."""
    
    def __init__(self):
        """Initialize the PDF analysis service."""
        self.logger = logging.getLogger(__name__)
    
    def analyze_pdf(self, pdf_path: Path) -> List[TemplateFieldData]:
        """
        Analyze a PDF file and extract AcroForm field structure.
        
        Args:
            pdf_path: Path to the PDF file to analyze
            
        Returns:
            List of TemplateFieldData objects in document order
            
        Raises:
            FileNotFoundError: If PDF file doesn't exist
            InvalidPDFError: If file is not a valid PDF
            NoFormFieldsError: If PDF contains no form fields
            PDFProcessingError: If processing fails
        """
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        try:
            # Extract form fields and text elements
            form_fields = self._extract_form_fields(pdf_path)
            text_elements = self._extract_text_elements(pdf_path)
            
            if not form_fields:
                raise NoFormFieldsError("No AcroForm fields found in PDF")
            
            # Sort fields by document position
            sorted_fields = self._sort_fields_by_position(form_fields)
            
            # Process each field to create TemplateFieldData
            result = []
            for index, field in enumerate(sorted_fields):
                field_data = self._process_field(field, text_elements, index)
                result.append(field_data)
            
            self.logger.info(f"Successfully analyzed PDF: {len(result)} fields found")
            return result
            
        except (PdfReadError, Exception) as e:
            if isinstance(e, (NoFormFieldsError, FileNotFoundError)):
                raise
            
            self.logger.error(f"PDF processing failed: {str(e)}")
            if "not a valid PDF" in str(e).lower() or "invalid PDF" in str(e).lower():
                raise InvalidPDFError(f"Invalid PDF file: {str(e)}")
            raise PDFProcessingError(f"Failed to process PDF: {str(e)}")
    
    def get_page_count(self, pdf_path: Path) -> int:
        """
        Get the number of pages in a PDF document.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Number of pages in the PDF
            
        Raises:
            PDFProcessingError: If unable to read the PDF
        """
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                return len(pdf_reader.pages)
        except Exception as e:
            self.logger.error(f"Failed to get page count: {str(e)}")
            # Return 1 as fallback to avoid breaking the response
            return 1
    
    def _extract_form_fields(self, pdf_path: Path) -> List[Dict[str, Any]]:
        """
        Extract form fields from PDF using PyPDF2.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            List of form field dictionaries with metadata
        """
        fields = []
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Get form fields from the PDF
                if pdf_reader.get_form_text_fields() is None:
                    return fields
                
                # Extract fields from each page
                for page_num, page in enumerate(pdf_reader.pages):
                    # Get annotations (form fields) from the page
                    if '/Annots' in page:
                        annotations = page['/Annots']
                        
                        for annotation_ref in annotations:
                            try:
                                annotation = annotation_ref.get_object()
                                
                                # Check if it's a form field
                                if '/Subtype' in annotation and annotation['/Subtype'] == '/Widget':
                                    field_data = self._extract_field_metadata(annotation, page_num)
                                    if field_data:
                                        fields.append(field_data)
                                        
                            except Exception as e:
                                self.logger.warning(f"Failed to process annotation: {str(e)}")
                                continue
                
                # Fallback: try to get fields from form dictionary
                if not fields and hasattr(pdf_reader, 'get_fields'):
                    try:
                        form_fields = pdf_reader.get_fields()
                        if form_fields:
                            for field_name, field_obj in form_fields.items():
                                field_data = self._extract_field_from_object(field_name, field_obj, 0)
                                if field_data:
                                    fields.append(field_data)
                    except Exception as e:
                        self.logger.warning(f"Fallback field extraction failed: {str(e)}")
                
        except Exception as e:
            raise PDFProcessingError(f"Failed to extract form fields: {str(e)}")
        
        return fields
    
    def _extract_field_metadata(self, annotation: Dict, page_num: int) -> Optional[Dict[str, Any]]:
        """Extract metadata from a form field annotation."""
        try:
            field_data = {
                'page': page_num,
                'field_name': annotation.get('/T', '').strip() if annotation.get('/T') else None,
                'field_type': annotation.get('/FT', ''),
                'rect': annotation.get('/Rect', [0, 0, 0, 0])
            }
            
            # Extract options for choice fields
            if '/Opt' in annotation:
                options = annotation['/Opt']
                if isinstance(options, list):
                    field_data['options'] = [str(opt) for opt in options]
            
            # Extract button field options
            if field_data['field_type'] == '/Btn' and '/AP' in annotation:
                # Try to extract button options from appearance dictionary
                ap_dict = annotation['/AP']
                if '/N' in ap_dict and isinstance(ap_dict['/N'], dict):
                    field_data['options'] = list(ap_dict['/N'].keys())
            
            return field_data
            
        except Exception as e:
            self.logger.warning(f"Failed to extract field metadata: {str(e)}")
            return None
    
    def _extract_field_from_object(self, field_name: str, field_obj: Any, page_num: int) -> Optional[Dict[str, Any]]:
        """Extract field data from PyPDF2 field object (fallback method)."""
        try:
            field_data = {
                'page': page_num,
                'field_name': field_name,
                'field_type': '/Tx',  # Default to text field
                'rect': [0, 0, 100, 20]  # Default rect
            }
            
            # Try to determine field type from field object
            if hasattr(field_obj, 'get'):
                field_type = field_obj.get('/FT', '/Tx')
                field_data['field_type'] = field_type
                
                # Extract rectangle if available
                if '/Rect' in field_obj:
                    field_data['rect'] = field_obj['/Rect']
            
            return field_data
            
        except Exception as e:
            self.logger.warning(f"Failed to extract field from object: {str(e)}")
            return None
    
    def _extract_text_elements(self, pdf_path: Path) -> List[Dict[str, Any]]:
        """
        Extract text elements from PDF using pdfplumber.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            List of text element dictionaries with position data
        """
        text_elements = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    # First try extract_words
                    words = page.extract_words()
                    
                    # Check if coordinates are valid (not all zeros)
                    valid_words = [w for w in words if w.get('y0', 0) != 0.0 or w.get('y1', 0) != 0.0]
                    
                    if valid_words:
                        # Use word extraction if coordinates are valid
                        for word in valid_words:
                            text_element = {
                                'text': word.get('text', ''),
                                'x0': word.get('x0', 0),
                                'y0': word.get('y0', 0), 
                                'x1': word.get('x1', 0),
                                'y1': word.get('y1', 0),
                                'page': page_num
                            }
                            text_elements.append(text_element)
                    else:
                        # Fallback: use character extraction and group into words
                        chars = page.chars
                        if chars:
                            # Group characters into words
                            current_word = ""
                            word_bbox = None
                            
                            for char in chars:
                                char_text = char.get('text', '')
                                x0, y0, x1, y1 = char.get('x0', 0), char.get('y0', 0), char.get('x1', 0), char.get('y1', 0)
                                
                                if char_text.isspace() or char_text == '':
                                    # End of word
                                    if current_word.strip() and word_bbox:
                                        text_elements.append({
                                            'text': current_word.strip(),
                                            'x0': float(word_bbox[0]),
                                            'y0': float(word_bbox[1]),
                                            'x1': float(word_bbox[2]),
                                            'y1': float(word_bbox[3]),
                                            'page': page_num
                                        })
                                    current_word = ""
                                    word_bbox = None
                                else:
                                    # Continue building word
                                    current_word += char_text
                                    if word_bbox is None:
                                        word_bbox = [x0, y0, x1, y1]
                                    else:
                                        # Expand bounding box
                                        word_bbox[0] = min(word_bbox[0], x0)
                                        word_bbox[1] = min(word_bbox[1], y0)
                                        word_bbox[2] = max(word_bbox[2], x1)
                                        word_bbox[3] = max(word_bbox[3], y1)
                            
                            # Don't forget the last word
                            if current_word.strip() and word_bbox:
                                text_elements.append({
                                    'text': current_word.strip(),
                                    'x0': float(word_bbox[0]),
                                    'y0': float(word_bbox[1]),
                                    'x1': float(word_bbox[2]),
                                    'y1': float(word_bbox[3]),
                                    'page': page_num
                                })
                        
        except Exception as e:
            self.logger.warning(f"Failed to extract text elements: {str(e)}")
            # Continue without text elements - fields will have empty near_text
        
        return text_elements
    
    def _sort_fields_by_position(self, fields: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sort fields by document position (page, then top-to-bottom, left-to-right).
        
        Args:
            fields: List of field dictionaries
            
        Returns:
            Sorted list of fields
        """
        def sort_key(field):
            page = field.get('page', 0)
            rect = field.get('rect', [0, 0, 0, 0])
            
            # Convert PDF coordinates (bottom-left origin) to top-left origin
            # Higher y values in PDF are lower on the page visually
            y_pos = float(-rect[1]) if len(rect) >= 2 else 0  # Negative for top-to-bottom sorting
            x_pos = float(rect[0]) if len(rect) >= 1 else 0
            
            return (page, y_pos, x_pos)
        
        return sorted(fields, key=sort_key)
    
    def _process_field(self, field: Dict[str, Any], text_elements: List[Dict[str, Any]], index: int) -> TemplateFieldData:
        """
        Process a single field to create TemplateFieldData.
        
        Args:
            field: Field dictionary from PDF extraction
            text_elements: List of text elements for proximity detection
            index: Field index for ID generation fallback
            
        Returns:
            TemplateFieldData instance
        """
        field_id = self._extract_field_id(field, index)
        field_type = self._get_field_type(field)
        near_text = self._find_nearest_text(field.get('rect', [0, 0, 0, 0]), text_elements, field.get('page', 0))
        value_options = self._extract_option_values(field)
        
        return TemplateFieldData(
            field_id=field_id,
            type=field_type,
            near_text=near_text,
            value_options=value_options
        )
    
    def _extract_field_id(self, field: Dict[str, Any], index: int = 0) -> str:
        """
        Extract or generate field ID.
        
        Args:
            field: Field dictionary
            index: Field index for fallback ID generation
            
        Returns:
            Field ID string
        """
        field_name = field.get('field_name', '')
        
        if field_name:
           # Patrón flexible: Letra (a-z), seguida de uno o más dígitos (\d+), 
           # y luego cero o más letras o dígitos (opcionales para sufijos como VIK).
           # Usamos re.IGNORECASE para que detecte A, B, C...
            cleaned_name = field_name.strip('/')
            
            # Extract meaningful part from complex field names
            # Examples: "form1[0].#subform[0].A0101[0]" -> "A0101"
            match = re.search(r'([a-z]\d+[a-z0-9]*)', cleaned_name, re.IGNORECASE)
            if match:
                return match.group(1).upper()
            
            # If no pattern match, use the cleaned name
            if cleaned_name:
                return cleaned_name
        
        # Fallback: generate field ID based on position
        page = field.get('page', 0)
        return f"field_{page}_{index:03d}"
    
    def _get_field_type(self, field: Dict[str, Any]) -> str:
        """
        Determine field type from PDF field data.
        
        Args:
            field: Field dictionary
            
        Returns:
            Field type string (text, radiobutton, checkbox, listbox)
        """
        field_type = field.get('field_type', '/Tx')
        options = field.get('options', [])
        
        if field_type == '/Tx':
            return 'text'
        elif field_type == '/Btn':
            # Button fields can be radio buttons or checkboxes
            # If there are options, assume radio button
            if options:
                return 'radiobutton'
            return 'checkbox'
        elif field_type == '/Ch':
            # Choice fields are listboxes/dropdowns
            return 'listbox'
        else:
            # Default to text for unknown types
            return 'text'
    
    def _find_nearest_text(self, field_rect: List[float], text_elements: List[Dict[str, Any]], page: int) -> str:
        """
        Find text to the left of a form field by finding the closest word to the left,
        then the next closest word to the left of that word, up to 5 words maximum.
        
        Args:
            field_rect: Field rectangle [x1, y1, x2, y2]
            text_elements: List of text elements
            page: Page number
            
        Returns:
            Text phrase with words ordered from left to right
        """
        if not text_elements or len(field_rect) < 4:
            return ""
        
        # Calculate field left edge
        field_left_x = float(field_rect[0])
        field_center_y = float((field_rect[1] + field_rect[3]) / 2)
        
        # Filter text elements on the same page and to the left of the field
        left_text_elements = []
        for elem in text_elements:
            if elem.get('page', 0) == page:
                elem_right_x = float(elem.get('x1', 0))
                elem_center_y = float((elem.get('y0', 0) + elem.get('y1', 0)) / 2)
                
                # Only consider elements to the left of the field and on similar Y level
                if (elem_right_x < field_left_x and 
                    abs(elem_center_y - field_center_y) <= 20):  # Within 20 pixels vertically
                    left_text_elements.append(elem)
        
        if not left_text_elements:
            return ""
        
        # Find up to 5 words starting from the closest to the field
        found_words = []
        current_search_x = field_left_x
        
        for _ in range(5):  # Maximum 5 words
            closest_word = None
            closest_distance = float('inf')
            
            # Find the closest word to the left of current_search_x
            for elem in left_text_elements:
                elem_right_x = float(elem.get('x1', 0))
                elem_center_y = float((elem.get('y0', 0) + elem.get('y1', 0)) / 2)
                
                # Only consider elements to the left of current search position
                if elem_right_x < current_search_x:
                    # Calculate distance (prioritize horizontal distance)
                    horizontal_distance = current_search_x - elem_right_x
                    vertical_distance = abs(elem_center_y - field_center_y)
                    
                    # Weight horizontal distance more heavily
                    total_distance = horizontal_distance + (vertical_distance * 2)
                    
                    if total_distance < closest_distance:
                        closest_distance = total_distance
                        closest_word = elem
            
            # If we found a word, add it and continue searching to its left
            if closest_word:
                word_text = closest_word.get('text', '').strip()
                if word_text and word_text not in found_words:  # Avoid duplicates
                    found_words.append({
                        'text': word_text,
                        'x': float(closest_word.get('x0', 0))
                    })
                    # Update search position to the left of this word
                    current_search_x = float(closest_word.get('x0', 0))
                else:
                    break  # Stop if we found an empty or duplicate word
            else:
                break  # No more words to the left
        
        if not found_words:
            return ""
        
        # Sort words by X coordinate (left to right) and join them
        found_words.sort(key=lambda w: w['x'])
        result = ' '.join(word['text'] for word in found_words)
        
        return result
    
 
    
    def _find_nearby_text_elements(self, text_elements: List[Dict[str, Any]], field_x: float, field_y: float) -> List[Dict[str, Any]]:
        """
        Find text elements that are reasonably close to the field.
        
        Args:
            text_elements: List of text elements to search
            field_x: Field center X coordinate
            field_y: Field center Y coordinate
            
        Returns:
            List of nearby text elements
        """
        nearby_elements = []
        max_distance = 150  # Maximum distance to consider "nearby"
        
        for elem in text_elements:
            elem_center_x = float((elem.get('x0', 0) + elem.get('x1', 0)) / 2)
            elem_center_y = float((elem.get('y0', 0) + elem.get('y1', 0)) / 2)
            
            distance = self._calculate_distance(
                (field_x, field_y),
                (elem_center_x, elem_center_y)
            )
            
            if distance <= max_distance:
                nearby_elements.append(elem)
        
        return nearby_elements
    
    def _create_meaningful_phrases(self, text_elements: List[Dict[str, Any]], field_x: float, field_y: float) -> List[tuple]:
        """
        Create meaningful phrases from nearby text elements.
        
        Args:
            text_elements: List of nearby text elements
            field_x: Field center X coordinate
            field_y: Field center Y coordinate
            
        Returns:
            List of tuples (phrase_text, distance) sorted by relevance
        """
        if not text_elements:
            return []
        
        # Group elements by proximity to form phrases
        phrases = []
        
        # Try to find continuous text phrases first
        lines = self._group_elements_by_line(text_elements)
        
        for line_elements in lines:
            if not line_elements:
                continue
            
            # Create phrase from this line
            phrase_text = self._create_phrase_text(line_elements)
            
            if not phrase_text.strip():
                continue
            
            # Calculate distance from field to phrase
            line_center_x = sum(float((elem.get('x0', 0) + elem.get('x1', 0)) / 2) for elem in line_elements) / len(line_elements)
            line_center_y = sum(float((elem.get('y0', 0) + elem.get('y1', 0)) / 2) for elem in line_elements) / len(line_elements)
            
            distance = self._calculate_distance((field_x, field_y), (line_center_x, line_center_y))
            
            # Score the phrase based on distance and meaningfulness
            score = self._score_phrase_meaningfulness(phrase_text, distance)
            
            phrases.append((phrase_text, score))
        
        # Sort by score (higher is better)
        phrases.sort(key=lambda x: x[1], reverse=True)
        
        # Filter to get phrases with 2-5 words
        good_phrases = []
        for phrase_text, score in phrases:
            word_count = len(phrase_text.split())
            if 2 <= word_count <= 5:
                good_phrases.append((phrase_text, score))
        
        # If no good phrases, try to combine single words
        if not good_phrases:
            single_word_phrases = [(text, score) for text, score in phrases if len(text.split()) == 1]
            if len(single_word_phrases) >= 2:
                # Combine the two best single words
                combined_text = f"{single_word_phrases[0][0]} {single_word_phrases[1][0]}"
                combined_score = (single_word_phrases[0][1] + single_word_phrases[1][1]) / 2
                good_phrases.append((combined_text, combined_score))
        
        return good_phrases
    
    def _score_phrase_meaningfulness(self, phrase_text: str, distance: float) -> float:
        """
        Score a phrase based on its meaningfulness and distance from field.
        
        Args:
            phrase_text: The phrase text to score
            distance: Distance from the field
            
        Returns:
            Score (higher is better)
        """
        if not phrase_text.strip():
            return 0.0
        
        score = 100.0  # Base score
        
        # Penalize by distance (closer is better)
        distance_penalty = distance / 10.0
        score -= distance_penalty
        
        # Bonus for meaningful Spanish words
        meaningful_words = [
            'hasta', 'máximo', 'mínimo', 'que', 'suponen', 'con', 'por', 'día',
            'sin', 'las', 'los', 'de', 'en', 'persona', 'trabajador', 'horas',
            'tiempo', 'complementarias', 'ordinarias', 'total', 'parcial'
        ]
        
        text_lower = phrase_text.lower()
        meaningful_word_count = sum(1 for word in meaningful_words if word in text_lower)
        score += meaningful_word_count * 10
        
        # Bonus for ideal word count (2-5 words)
        word_count = len(phrase_text.split())
        if 2 <= word_count <= 5:
            score += 20
        elif word_count == 1:
            score -= 10  # Penalize single words
        
        # Bonus for descriptive patterns
        if 'hasta' in text_lower and ('máximo' in text_lower or 'mínimo' in text_lower):
            score += 30  # "hasta un máximo de" type phrases
        
        if 'que suponen' in text_lower:
            score += 25
        
        return max(0.0, score)
    
    def _group_text_into_phrases(self, text_elements: List[Dict[str, Any]], field_x: float, field_y: float) -> List[tuple]:
        """
        Group nearby text elements into meaningful phrases of 2-5 words.
        
        Args:
            text_elements: List of text elements
            field_x: Field center X coordinate
            field_y: Field center Y coordinate
            
        Returns:
            List of tuples (phrase_text, phrase_center_coordinates)
        """
        if not text_elements:
            return []
        
        # First, try to find text elements that form coherent lines/phrases
        # Group by similar Y coordinates (same line) first
        lines = self._group_elements_by_line(text_elements)
        
        # Create phrases from each line, prioritizing those closest to the field
        phrases = []
        
        for line_elements in lines:
            if not line_elements:
                continue
            
            # Calculate line center for distance calculation
            line_center_x = sum(float((elem.get('x0', 0) + elem.get('x1', 0)) / 2) for elem in line_elements) / len(line_elements)
            line_center_y = sum(float((elem.get('y0', 0) + elem.get('y1', 0)) / 2) for elem in line_elements) / len(line_elements)
            
            # Calculate distance from field to this line
            line_distance = self._calculate_distance((field_x, field_y), (line_center_x, line_center_y))
            
            # Create phrase from this line
            phrase_text = self._create_phrase_text(line_elements)
            
            if phrase_text.strip():
                phrases.append((phrase_text, (line_center_x, line_center_y), line_distance))
        
        # Sort phrases by distance to field (closest first)
        phrases.sort(key=lambda x: x[2])
        
        # Filter and prioritize phrases with 2-5 words
        filtered_phrases = []
        
        for phrase_text, phrase_center, distance in phrases:
            word_count = len(phrase_text.split())
            
            # Prioritize phrases with 2-5 words
            if 2 <= word_count <= 5:
                filtered_phrases.append((phrase_text, phrase_center))
            elif word_count == 1 and len(filtered_phrases) < 3:
                # Keep some single words as backup, but try to combine them
                filtered_phrases.append((phrase_text, phrase_center))
        
        # If we have single words, try to combine adjacent ones
        if len(filtered_phrases) >= 2:
            combined_phrases = []
            for i in range(len(filtered_phrases)):
                phrase_text, phrase_center = filtered_phrases[i]
                word_count = len(phrase_text.split())
                
                if word_count >= 2:
                    # Keep multi-word phrases as-is
                    combined_phrases.append((phrase_text, phrase_center))
                elif i + 1 < len(filtered_phrases):
                    # Try to combine with next phrase
                    next_phrase_text, next_phrase_center = filtered_phrases[i + 1]
                    combined_text = f"{phrase_text} {next_phrase_text}"
                    combined_words = len(combined_text.split())
                    
                    if 2 <= combined_words <= 5:
                        # Good combination
                        combined_center = (
                            (phrase_center[0] + next_phrase_center[0]) / 2,
                            (phrase_center[1] + next_phrase_center[1]) / 2
                        )
                        combined_phrases.append((combined_text, combined_center))
                        # Skip the next phrase since we combined it
                        continue
                    else:
                        combined_phrases.append((phrase_text, phrase_center))
                else:
                    combined_phrases.append((phrase_text, phrase_center))
            
            return combined_phrases
        
        return [(phrase_text, phrase_center) for phrase_text, phrase_center, _ in phrases[:5]]
    
    def _group_elements_by_line(self, text_elements: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """
        Group text elements that appear to be on the same line.
        
        Args:
            text_elements: List of text elements
            
        Returns:
            List of lists, where each inner list contains elements from the same line
        """
        if not text_elements:
            return []
        
        # Sort elements by Y coordinate (top to bottom)
        sorted_elements = sorted(text_elements, key=lambda elem: -elem.get('y0', 0))
        
        lines = []
        current_line = []
        current_y = None
        
        for elem in sorted_elements:
            elem_y = elem.get('y0', 0)
            
            # If this is the first element or it's on the same line (within 5 pixels)
            if current_y is None or abs(elem_y - current_y) <= 5:
                current_line.append(elem)
                current_y = elem_y
            else:
                # Start a new line
                if current_line:
                    lines.append(sorted(current_line, key=lambda e: e.get('x0', 0)))  # Sort by X within line
                current_line = [elem]
                current_y = elem_y
        
        # Add the last line
        if current_line:
            lines.append(sorted(current_line, key=lambda e: e.get('x0', 0)))
        
        return lines
    
    def _create_phrase_text(self, text_elements: List[Dict[str, Any]]) -> str:
        """
        Create a phrase text from multiple text elements.
        
        Args:
            text_elements: List of text elements to combine
            
        Returns:
            Combined phrase text
        """
        if not text_elements:
            return ""
        
        # Sort elements by position (left to right, top to bottom)
        sorted_elements = sorted(text_elements, key=lambda elem: (
            -elem.get('y0', 0),  # Top to bottom (negative for descending)
            elem.get('x0', 0)    # Left to right
        ))
        
        # Extract text and clean it
        words = []
        for elem in sorted_elements:
            text = elem.get('text', '').strip()
            if text and text not in words:  # Avoid duplicates
                words.append(text)
        
        # Join words and clean up the result
        phrase = ' '.join(words)
        
        # Clean up common issues
        phrase = phrase.replace('  ', ' ')  # Remove double spaces
        phrase = phrase.strip()
        
        # Limit to reasonable length
        if len(phrase) > 100:
            words = phrase.split()[:5]  # Limit to 5 words max
            phrase = ' '.join(words)
        
        return phrase
    
    def _calculate_distance(self, point1: Tuple[float, float], point2: Tuple[float, float]) -> float:
        """
        Calculate Euclidean distance between two points.
        
        Args:
            point1: First point (x, y)
            point2: Second point (x, y)
            
        Returns:
            Distance as float
        """
        return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def _extract_option_values(self, field: Dict[str, Any]) -> Optional[List[str]]:
        """
        Extract option values for selection fields.
        
        Args:
            field: Field dictionary
            
        Returns:
            List of option strings or None for non-selection fields
        """
        field_type = self._get_field_type(field)
        
        # Only selection fields have options
        if field_type not in ['radiobutton', 'checkbox', 'listbox']:
            return None
        
        options = field.get('options', [])
        if options:
            return [str(option) for option in options]
        
        # For button fields without explicit options, try common patterns
        if field_type in ['radiobutton', 'checkbox']:
            # Common radio button options
            return ['Sí', 'No']
        
        return None
