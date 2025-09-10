from fastapi import APIRouter, HTTPException, Path
from typing import List
from models import RecommendationResponse, ErrorResponse
from utils.rules import recommendation_engine
from db import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/recommend", tags=["recommendations"])

@router.post("/{claim_id}", response_model=List[RecommendationResponse])
async def get_recommendations(claim_id: int = Path(..., gt=0, description="ID of the claim to get recommendations for")):
    """Generate scheme recommendations for a specific claim"""
    try:
        # Fetch the claim
        claim = await db.get_claim_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        logger.info(f"Generating recommendations for claim {claim_id}")
        
        # Get available schemes from database (fallback to default schemes)
        try:
            db_schemes = await db.get_schemes()
            logger.info(f"Found {len(db_schemes)} schemes in database")
        except Exception as e:
            logger.warning(f"Could not fetch schemes from database, using defaults: {str(e)}")
            db_schemes = []
        
        # Generate recommendations using the rule engine
        recommendations = recommendation_engine.get_recommendations(claim, db_schemes if db_schemes else None)
        
        if not recommendations:
            logger.info(f"No recommendations found for claim {claim_id}")
            return []
        
        # Save recommendations to database and prepare response
        response_recommendations = []
        
        for rec in recommendations:
            try:
                # Save to database
                recommendation_data = {
                    "claim_id": claim_id,
                    "scheme_id": rec["scheme_id"],
                    "score": rec["score"]
                }
                
                saved_rec = await db.create_recommendation(recommendation_data)
                
                if saved_rec:
                    response_rec = {
                        "id": saved_rec["id"],
                        "claim_id": claim_id,
                        "scheme_id": rec["scheme_id"],
                        "scheme_name": rec["scheme_name"],
                        "score": rec["score"],
                        "created_at": saved_rec["created_at"]
                    }
                    response_recommendations.append(response_rec)
                    logger.info(f"Saved recommendation: {rec['scheme_name']} (score: {rec['score']:.3f})")
                
            except Exception as e:
                logger.error(f"Failed to save recommendation {rec['scheme_name']}: {str(e)}")
                # Continue with other recommendations even if one fails
                continue
        
        logger.info(f"Generated {len(response_recommendations)} recommendations for claim {claim_id}")
        return response_recommendations
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations for claim {claim_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/{claim_id}/history", response_model=List[RecommendationResponse])
async def get_recommendation_history(claim_id: int = Path(..., gt=0, description="ID of the claim")):
    """Get the history of recommendations for a specific claim"""
    try:
        # Check if claim exists
        claim = await db.get_claim_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        # Get recommendation history
        recommendations = await db.get_recommendations_for_claim(claim_id)
        
        # Format response
        response_recommendations = []
        for rec in recommendations:
            scheme_info = rec.get("schemes", {})
            response_rec = {
                "id": rec["id"],
                "claim_id": rec["claim_id"],
                "scheme_id": rec["scheme_id"],
                "scheme_name": scheme_info.get("scheme_name", "Unknown Scheme"),
                "score": rec["score"],
                "created_at": rec["created_at"]
            }
            response_recommendations.append(response_rec)
        
        logger.info(f"Retrieved {len(response_recommendations)} recommendation history items for claim {claim_id}")
        return response_recommendations
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching recommendation history for claim {claim_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch recommendation history: {str(e)}")

@router.get("/health")
async def recommendations_health():
    """Health check for recommendations service"""
    return {"status": "healthy", "service": "recommendations"}