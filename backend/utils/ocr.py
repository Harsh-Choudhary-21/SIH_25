import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import io
import os
import cv2
import numpy as np
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
    
    def preprocess_image(self, image):
        """Preprocess image for better OCR results"""
        try:
            # Convert PIL to OpenCV format
            img_array = np.array(image)
            
            # Convert to grayscale
            if len(img_array.shape) == 3:
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_array
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            
            # Convert back to PIL
            return Image.fromarray(thresh)
        except:
            # Fallback to original image if preprocessing fails
            return image
    
    def extract_text_from_image(self, image_data: bytes) -> str:
        """Extract text from image using OCR with robust Hindi and English support"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB first for better processing
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize image if too small (OCR works better on larger images)
            width, height = image.size
            if width < 1200 or height < 1200:
                scale = max(1200/width, 1200/height)
                new_size = (int(width * scale), int(height * scale))
                image = image.resize(new_size, Image.LANCZOS)
            
            # Apply preprocessing
            processed_image = self.preprocess_image(image)
            
            # Try multiple language combinations with different strategies
            best_text = ""
            strategies = [
                # Strategy 1: Hindi + English combined
                {'lang': 'hin+eng', 'config': r'--oem 3 --psm 6 -c preserve_interword_spaces=1'},
                # Strategy 2: Hindi only with form detection
                {'lang': 'hin', 'config': r'--oem 3 --psm 4 -c preserve_interword_spaces=1'},
                # Strategy 3: English only with form detection
                {'lang': 'eng', 'config': r'--oem 3 --psm 6'},
                # Strategy 4: English with different PSM for mixed content
                {'lang': 'eng', 'config': r'--oem 3 --psm 4'},
                # Strategy 5: Auto language detection
                {'lang': 'eng', 'config': r'--oem 3 --psm 3'},
            ]
            
            for strategy in strategies:
                try:
                    # Try with processed image first
                    text = pytesseract.image_to_string(
                        processed_image, 
                        lang=strategy['lang'], 
                        config=strategy['config']
                    )
                    
                    # If processed image didn't work well, try original
                    if len(text.strip()) < 20:
                        text = pytesseract.image_to_string(
                            image, 
                            lang=strategy['lang'], 
                            config=strategy['config']
                        )
                    
                    # Keep the best result (longest meaningful text)
                    if len(text.strip()) > len(best_text.strip()):
                        best_text = text
                        logger.info(f"OCR success with {strategy['lang']}: {len(text)} characters")
                    
                    # If we got substantial text, we can stop trying
                    if len(text.strip()) > 100:
                        break
                        
                except Exception as e:
                    logger.warning(f"OCR failed for {strategy['lang']}: {str(e)}")
                    continue
            
            # Final fallback: try basic English OCR with minimal config
            if len(best_text.strip()) < 10:
                try:
                    fallback_text = pytesseract.image_to_string(image, lang='eng')
                    if len(fallback_text.strip()) > len(best_text.strip()):
                        best_text = fallback_text
                        logger.info(f"Fallback OCR used: {len(fallback_text)} characters")
                except:
                    pass
            
            result = best_text.strip() if best_text.strip() else "No text could be extracted from image"
            logger.info(f"Final OCR result: {len(result)} characters")
            return result
                
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            return "Error processing image for OCR"
    
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