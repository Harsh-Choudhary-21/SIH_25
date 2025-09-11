# Overview

The FRA Atlas WebGIS Backend is an AI-powered Forest Rights Act Atlas with WebGIS Decision Support System built for Smart India Hackathon (SIH12508). The system processes forest rights claims through document upload, extracts information using OCR and NLP, stores geospatial data, and provides intelligent scheme recommendations. It serves as the backend API for a React frontend, managing forest rights claims data and providing decision support through rule-based recommendations.

**Status: ✅ COMPLETE & READY FOR DEMO**
- FastAPI backend fully implemented and running on port 8000
- React frontend running on port 5000 with proper integration
- Full-stack communication working with dynamic API URL resolution  
- All endpoints functional: /upload, /claims, /map, /recommend/{claim_id}
- Demo mode enabled for running without Supabase credentials
- OCR and NLP processing working with pytesseract and optimized NLP
- Interactive API documentation available at /docs
- One-command startup script (./start-local.sh) for easy demonstrations

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Framework
- **FastAPI**: Modern Python web framework chosen for its automatic API documentation, type hints support, and high performance
- **Async/Await Pattern**: Asynchronous programming for handling concurrent requests efficiently
- **Pydantic Models**: Type validation and serialization for request/response data
- **CORS Middleware**: Cross-origin resource sharing for frontend integration

## Data Storage
- **Supabase (PostgreSQL)**: Primary database with PostGIS extension for geospatial data storage
- **AsyncPG**: Asynchronous PostgreSQL driver for database connections
- **Connection Pooling**: Managed database connection pool for performance
- **Demo Mode**: Fallback in-memory storage when Supabase credentials are unavailable

## Document Processing Pipeline
- **OCR Processing**: Pytesseract for text extraction from PDF and image files
- **NLP Processing**: spaCy for natural language processing and entity extraction
- **Multi-format Support**: Handles PDF, JPG, JPEG, PNG, BMP, TIFF, and GIF files
- **File Validation**: Size limits (10MB) and format restrictions

## Geospatial Capabilities
- **PostGIS Integration**: Geographic data storage using PostgreSQL's spatial extension
- **GeoJSON API**: Map data served in GeoJSON format for frontend mapping
- **Polygon Storage**: Claims stored with geographic boundaries (dummy polygons for demo)

## Recommendation System
- **Rule-based Engine**: Uses eligibility criteria matching for scheme recommendations
- **Scoring Algorithm**: Calculates recommendation scores based on area, status, and scheme rules
- **Default Schemes**: Built-in schemes for irrigation support, legal aid, community rights, and livelihood enhancement
- **Database Integration**: Stores and retrieves recommendations for audit trails

## API Architecture
- **RESTful Design**: Standard HTTP methods and status codes
- **Route Organization**: Modular route handlers for upload, claims, map, and recommendations
- **Error Handling**: Comprehensive exception handling with meaningful error messages
- **Logging**: Structured logging for debugging and monitoring

## Data Models
- **Claims**: Core entity with claimant information, area, status, and geospatial data
- **Schemes**: Government schemes with eligibility rules stored as JSON
- **Recommendations**: Linking table between claims and schemes with confidence scores
- **Enum Validation**: Predefined claim statuses (granted, pending, rejected)

# External Dependencies

## Database Services
- **Supabase**: Cloud PostgreSQL database with PostGIS for geospatial data
- **Environment Variables**: SUPABASE_URL and SUPABASE_KEY for authentication

## Document Processing
- **Pytesseract**: OCR engine for text extraction from images and PDFs
- **Pillow (PIL)**: Python imaging library for image processing
- **spaCy**: Natural language processing library with English language model (en_core_web_sm)

## Web Framework
- **FastAPI**: Modern async web framework for Python
- **Uvicorn**: ASGI server for running FastAPI applications
- **Python-multipart**: For handling file uploads

## Database Connectivity
- **AsyncPG**: PostgreSQL adapter for async database operations
- **Connection pooling**: Managed through AsyncPG for performance optimization

## Development Tools
- **Python-dotenv**: Environment variable management
- **HTTPX**: HTTP client library for external API calls
- **Logging**: Built-in Python logging for application monitoring

## Schema Requirements
The system expects a PostgreSQL database with PostGIS extension and the following tables:
- **claims**: Stores forest rights claims with geographic data
- **schemes**: Government schemes with JSON-based eligibility rules  
- **recommendations**: Links claims to applicable schemes with scores

The application gracefully handles missing credentials by operating in demo mode with in-memory data storage.