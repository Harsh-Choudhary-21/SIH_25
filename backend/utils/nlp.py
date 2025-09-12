import re
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NLPProcessor:
    def __init__(self):
        logger.info("NLP processor initialized with regex-based extraction")
    
    def extract_entities_with_regex(self, text: str) -> Dict[str, Any]:
        """Enhanced regex-based entity extraction for Hindi/English forms"""
        extracted: Dict[str, Any] = {
            "claimant_name": None,
            "village": None,
            "area": None,
            "status": None
        }
        
        # Enhanced name extraction patterns for Hindi forms
        name_patterns = [
            # Hindi patterns
            r"[\u0900-\u097F\s]{3,50}",  # Any Devanagari text 3-50 chars
            # English patterns
            r"(?:name|claimant|applicant)[\s:]+([A-Za-z\u0900-\u097F\s]{2,50})",
            r"(?:श्री|श्रीमती|नाम)[\s:]*([\u0900-\u097F\s]{2,50})",
            r"Mr\.?\s+([A-Za-z\s]{2,30})",
            r"Mrs\.?\s+([A-Za-z\s]{2,30})",
            r"([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",  # Capitalized names
            # Form field patterns
            r"1\.?\s*([\u0900-\u097F\s]{3,30})",  # First field often name
            r"Name.*?([\u0900-\u097F\s]{3,30})"
        ]
        
        # Try to find Hindi text first
        hindi_matches = re.findall(r"[\u0900-\u097F\s]{3,50}", text)
        if hindi_matches:
            # Take the first substantial Hindi text as name
            for match in hindi_matches:
                clean_match = match.strip()
                if len(clean_match) > 3 and len(clean_match) < 50:
                    extracted["claimant_name"] = clean_match
                    break
        
        # Fallback to English patterns if no Hindi found
        if not extracted["claimant_name"]:
            for pattern in name_patterns[2:]:  # Skip Hindi patterns
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    extracted["claimant_name"] = match.group(1).strip()
                    break
        
        # Enhanced village extraction patterns
        village_patterns = [
            r"(?:village|gram|panchayat|गांव|ग्राम)[\s:]+([A-Za-z\u0900-\u097F\s]{2,30})",
            r"(?:at|in)\s+village\s+([A-Za-z\u0900-\u097F\s]{2,30})",
            r"5\.?\s*([\u0900-\u097F\s]{2,30})",  # Field 5 is often village
            r"Village.*?([\u0900-\u097F\s]{2,30})"
        ]
        
        for pattern in village_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                village_name = match.group(1).strip()
                if len(village_name) > 1:
                    extracted["village"] = village_name
                    break
        
        # Enhanced area extraction patterns
        area_patterns = [
            r"(\d+(?:\.\d+)?)\s*(?:hectare|hectares|ha|acre|acres|हेक्टेयर)",
            r"area[\s:]+(\d+(?:\.\d+)?)",
            r"(\d+(?:\.\d+)?)\s*(?:sq|sqm|square)",
            r"(?:क्षेत्रफल|एरिया)[\s:]*(\d+(?:\.\d+)?)",
            # Look for any decimal number that could be area
            r"(\d+\.\d+)\s*(?:hectare|ha)?",
            r"([0-9]+\.[0-9]+)"
        ]
        
        for pattern in area_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    area_val = float(match if isinstance(match, str) else match[0])
                    if 0.1 <= area_val <= 100:  # Reasonable area range
                        extracted["area"] = area_val
                        break
                except (ValueError, IndexError):
                    continue
            if extracted["area"]:
                break
        
        # Status extraction
        status_keywords = {
            "granted": ["granted", "approved", "sanctioned", "accepted"],
            "pending": ["pending", "under review", "processing", "submitted"],
            "rejected": ["rejected", "denied", "declined", "cancelled"]
        }
        
        text_lower = text.lower()
        for status, keywords in status_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                extracted["status"] = status
                break
        
        return extracted
    
    def process_text(self, text: str) -> Dict[str, Any]:
        """Main method to process text and extract relevant information"""
        try:
            logger.info(f"Processing text of length: {len(text)} characters")
            
            # Clean the text
            cleaned_text = self._clean_text(text)
            
            # Extract entities using regex
            extracted = self.extract_entities_with_regex(cleaned_text)
            
            # Validate and set defaults
            extracted = self._validate_and_set_defaults(extracted)
            
            logger.info(f"Extracted entities: {extracted}")
            return extracted
        
        except Exception as e:
            logger.error(f"NLP processing failed: {str(e)}")
            raise Exception(f"Failed to process text: {str(e)}")
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.:,-]', '', text)
        return text.strip()
    
    def _validate_and_set_defaults(self, extracted: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extracted data and set reasonable defaults"""
        # Set default status if not found
        if not extracted["status"]:
            extracted["status"] = "pending"
        
        # Set default area if not found or invalid
        if not extracted["area"] or extracted["area"] <= 0:
            extracted["area"] = 1.0  # Default 1 hectare
        
        # Clean up name and village
        if extracted["claimant_name"]:
            extracted["claimant_name"] = extracted["claimant_name"].title().strip()
        else:
            extracted["claimant_name"] = "Unknown Claimant"
        
        if extracted["village"]:
            extracted["village"] = extracted["village"].title().strip()
        else:
            extracted["village"] = "Unknown Village"
        
        return extracted

# Global NLP processor instance
nlp_processor = NLPProcessor()