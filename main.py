from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
import os
from contextlib import asynccontextmanager

# Import routes
from routes.upload import router as upload_router
from routes.claims import router as claims_router
from routes.map import router as map_router
from routes.recommendations import router as recommendations_router

# Import database
from db import db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting up FastAPI application")
    try:
        await db.init_pool()
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {str(e)}")

    yield

    # Shutdown
    logger.info("Shutting down FastAPI application")
    try:
        await db.close_pool()
        logger.info("Database connection pool closed")
    except Exception as e:
        logger.error(f"Error closing database pool: {str(e)}")


# Create FastAPI app
app = FastAPI(
    title="FRA Atlas WebGIS Backend",
    description=
    "AI-powered Forest Rights Act Atlas with WebGIS Decision Support System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)
app.include_router(claims_router)
app.include_router(map_router)
app.include_router(recommendations_router)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "FRA Atlas WebGIS Backend API",
        "version": "1.0.0",
        "description":
        "AI-powered Forest Rights Act Atlas with WebGIS Decision Support System",
        "endpoints": {
            "upload": "/upload - Upload and process PDF/image files",
            "claims": "/claims - Manage forest rights claims",
            "map": "/map - Get GeoJSON data for mapping",
            "recommendations":
            "/recommend/{claim_id} - Get scheme recommendations",
            "docs": "/docs - Interactive API documentation",
            "redoc": "/redoc - Alternative API documentation"
        },
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.get_claims()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "services": {
            "upload": "healthy",
            "claims": "healthy",
            "map": "healthy",
            "recommendations": "healthy"
        }
    }


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(status_code=404,
                        content={
                            "error": "Not found",
                            "detail": "The requested resource was not found"
                        })


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal server error: {str(exc)}")
    return JSONResponse(status_code=500,
                        content={
                            "error": "Internal server error",
                            "detail": "An unexpected error occurred"
                        })


if __name__ == "__main__":
    # Run the application
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")

    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run("main:app",
                host=host,
                port=port,
                reload=True,
                log_level="info")
