from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from models import UploadResponse, ErrorResponse, ClaimResponse
from utils.ocr import ocr_processor
from utils.nlp import nlp_processor
from db import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and process PDF/image file to extract claim information"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        file_extension = '.' + file.filename.lower().split('.')[-1] if '.' in file.filename else ''
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file data
        file_data = await file.read()
        
        # Check file size
        if len(file_data) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size: 10MB")
        
        logger.info(f"Processing uploaded file: {file.filename} ({len(file_data)} bytes)")
        
        # Extract text using OCR
        try:
            extracted_text = ocr_processor.process_file(file_data, file.filename)
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            return UploadResponse(
                success=False,
                message=f"Failed to extract text from file: {str(e)}",
                extracted_data={"raw_text": "OCR failed"}
            )
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            return UploadResponse(
                success=False,
                message="No meaningful text found in the uploaded file",
                extracted_data={"raw_text": extracted_text}
            )
        
        # Process text with NLP to extract structured data
        try:
            extracted_data = nlp_processor.process_text(extracted_text)
        except Exception as e:
            logger.error(f"NLP processing failed: {str(e)}")
            return UploadResponse(
                success=False,
                message=f"Failed to process extracted text: {str(e)}",
                extracted_data={"raw_text": extracted_text}
            )
        
        # Validate extracted data
        required_fields = ["claimant_name", "village", "area", "status"]
        if not all(extracted_data.get(field) for field in required_fields):
            missing_fields = [field for field in required_fields if not extracted_data.get(field)]
            logger.warning(f"Missing required fields: {missing_fields}")
            
            return UploadResponse(
                success=False,
                message=f"Could not extract all required information. Missing: {', '.join(missing_fields)}",
                extracted_data={
                    "raw_text": extracted_text,
                    "extracted": extracted_data,
                    "missing_fields": missing_fields
                }
            )
        
        # Create claim in database
        try:
            claim_data = {
                "claimant_name": extracted_data["claimant_name"],
                "village": extracted_data["village"],
                "area": float(extracted_data["area"]),
                "status": extracted_data["status"]
            }
            
            created_claim = await db.create_claim(claim_data)
            
            if not created_claim:
                raise Exception("Failed to create claim in database")
            
            logger.info(f"Successfully created claim with ID: {created_claim.get('id')}")
            
            return UploadResponse(
                success=True,
                message="File processed successfully and claim created",
                claim=ClaimResponse(**created_claim),
                extracted_data={
                    "raw_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
                    "extracted": extracted_data
                }
            )
        
        except Exception as e:
            logger.error(f"Database operation failed: {str(e)}")
            return UploadResponse(
                success=False,
                message=f"Failed to save claim to database: {str(e)}",
                extracted_data={
                    "raw_text": extracted_text,
                    "extracted": extracted_data
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def upload_health():
    """Health check for upload service"""
    return {"status": "healthy", "service": "upload"}