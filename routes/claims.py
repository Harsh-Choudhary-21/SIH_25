from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import ClaimResponse, ErrorResponse
from db import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/claims", tags=["claims"])

@router.get("/", response_model=List[ClaimResponse])
async def get_claims(status: Optional[str] = Query(None, description="Filter by status: granted, pending, or rejected")):
    """Get all claims, optionally filtered by status"""
    try:
        if status and status not in ["granted", "pending", "rejected"]:
            raise HTTPException(status_code=400, detail="Status must be one of: granted, pending, rejected")
        
        claims = await db.get_claims(status=status)
        return claims
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching claims: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch claims: {str(e)}")

@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(claim_id: int):
    """Get a specific claim by ID"""
    try:
        claim = await db.get_claim_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        return claim
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching claim {claim_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch claim: {str(e)}")