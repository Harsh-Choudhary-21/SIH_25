import re
import logging
from typing import Dict, Any, Optional, List
import spacy
from spacy.matcher import Matcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NLPProcessor:
    def __init__(self):
        try:
            # Try to load the English model
            # Note: You may need to run: python -m spacy download en_core_web_sm
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy English model loaded successfully")
        except OSError:
            logger.warning("spaCy English model not found. Using fallback regex extraction.")
            self.nlp = None
        
        # Initialize matcher for pattern matching
        if self.nlp:
            self.matcher = Matcher(self.nlp.vocab)
            self._setup_patterns()
    
    def _setup_patterns(self):
        """Setup spaCy patterns for entity extraction"""
        if not self.nlp:
            return
        
        # Pattern for names (assuming they follow "Name:" or "Claimant:" format)
        name_pattern = [
            [{"LOWER": {"IN": ["name", "claimant", "applicant"]}}, 
             {"IS_PUNCT": True, "OP": "?"}, 
             {"IS_ALPHA": True, "OP": "+"}]
        ]
        
        # Pattern for villages
        village_pattern = [
            [{"LOWER": {"IN": ["village", "gram", "panchayat"]}}, 
             {"IS_PUNCT": True, "OP": "?"}, 
             {"IS_ALPHA": True, "OP": "+"}]
        ]
        
        # Pattern for area measurements
        area_pattern = [
            [{"LIKE_NUM": True}, 
             {"LOWER": {"IN": ["hectare", "hectares", "acre", "acres", "ha", "sq", "sqm"]}}]
        ]
        
        self.matcher.add("NAME", name_pattern)
        self.matcher.add("VILLAGE", village_pattern)
        self.matcher.add("AREA", area_pattern)
    
    def extract_entities_with_spacy(self, text: str) -> Dict[str, Any]:
        """Extract entities using spaCy NLP - fallback to regex for reliability"""
        # Use regex-based extraction which is more reliable for document processing
        return self.extract_entities_with_regex(text)
    
    def extract_entities_with_regex(self, text: str) -> Dict[str, Any]:
        """Fallback regex-based entity extraction"""
        extracted = {
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
            
            # Extract entities
            if self.nlp:
                extracted = self.extract_entities_with_spacy(cleaned_text)
            else:
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