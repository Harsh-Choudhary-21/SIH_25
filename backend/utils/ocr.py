import pytesseract
from PIL import Image
import io
import os
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OCRProcessor:
    def __init__(self):
        # Configure tesseract path if needed (for Windows/different installations)
        # pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'  # Linux default
        pass
    
    def extract_text_from_image(self, image_data: bytes) -> str:
        """Extract text from image using OCR"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Extract text using pytesseract
            extracted_text = pytesseract.image_to_string(image, lang='eng')
            
            logger.info(f"OCR extracted text length: {len(extracted_text)} characters")
            return extracted_text.strip()
        
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise Exception(f"Failed to extract text from image: {str(e)}")
    
    def extract_text_from_pdf(self, pdf_data: bytes) -> str:
        """Extract text from PDF file"""
        try:
            # For PDF processing, we'll use a simple approach
            # In a full implementation, you might want to use libraries like PyPDF2 or pdfplumber
            # For now, we'll assume PDFs are converted to images first
            
            # This is a placeholder - in real implementation, you'd convert PDF pages to images
            # and then run OCR on each page
            logger.warning("PDF processing not fully implemented - convert to image first")
            return "PDF processing requires additional setup"
        
        except Exception as e:
            logger.error(f"PDF processing failed: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def process_file(self, file_data: bytes, filename: str) -> str:
        """Process file based on its type"""
        file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
        
        if file_extension in ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif']:
            return self.extract_text_from_image(file_data)
        elif file_extension == 'pdf':
            return self.extract_text_from_pdf(file_data)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

# Global OCR processor instance
ocr_processor = OCRProcessor()