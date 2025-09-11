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
        """Fallback regex-based entity extraction"""
        extracted: Dict[str, Any] = {
            "claimant_name": None,
            "village": None,
            "area": None,
            "status": None
        }
        
        # Name extraction patterns
        name_patterns = [
            r"(?:name|claimant|applicant)[\s:]+([A-Za-z\s]{2,50})",
            r"Mr\.?\s+([A-Za-z\s]{2,30})",
            r"Mrs\.?\s+([A-Za-z\s]{2,30})",
            r"([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)"  # Capitalized names
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match and not extracted["claimant_name"]:
                extracted["claimant_name"] = match.group(1).strip()
                break
        
        # Village extraction patterns
        village_patterns = [
            r"(?:village|gram|panchayat)[\s:]+([A-Za-z\s]{2,30})",
            r"(?:at|in)\s+village\s+([A-Za-z\s]{2,30})",
        ]
        
        for pattern in village_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match and not extracted["village"]:
                extracted["village"] = match.group(1).strip()
                break
        
        # Area extraction patterns
        area_patterns = [
            r"(\d+(?:\.\d+)?)\s*(?:hectare|hectares|ha|acre|acres)",
            r"area[\s:]+(\d+(?:\.\d+)?)",
            r"(\d+(?:\.\d+)?)\s*(?:sq|sqm|square)"
        ]
        
        for pattern in area_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match and not extracted["area"]:
                try:
                    extracted["area"] = float(match.group(1))
                    break
                except ValueError:
                    continue
        
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