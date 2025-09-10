from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from db import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/map", tags=["map"])

@router.get("/")
async def get_map_data():
    """Get all claims as GeoJSON for map display"""
    try:
        logger.info("Fetching map data as GeoJSON")
        geojson_data = await db.get_map_data()
        
        if not geojson_data:
            # Return empty FeatureCollection if no data
            geojson_data = {
                "type": "FeatureCollection",
                "features": []
            }
        
        logger.info(f"Returning GeoJSON with {len(geojson_data.get('features', []))} features")
        
        # Return as JSON response with proper content type
        return JSONResponse(
            content=geojson_data,
            headers={"Content-Type": "application/geo+json"}
        )
    
    except Exception as e:
        logger.error(f"Error fetching map data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch map data: {str(e)}")

@router.get("/health")
async def map_health():
    """Health check for map service"""
    return {"status": "healthy", "service": "map"}