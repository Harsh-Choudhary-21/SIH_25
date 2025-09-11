# FRA Atlas WebGIS - AI-powered Forest Rights Act Decision Support System

> **Smart India Hackathon (SIH) Project SIH12508**  
> Complete local development setup for Forest Rights Act Atlas with WebGIS capabilities and AI-powered recommendations.

## 🎯 Project Overview

An intelligent system that processes Forest Rights Act claims through document upload, extracts information using OCR and NLP, provides geospatial visualization, and generates AI-powered scheme recommendations.

### ✨ Features

- **🤖 AI-Powered Processing**: OCR text extraction + NLP entity recognition
- **📋 Claims Management**: Complete CRUD operations for forest rights claims  
- **🗺️ Interactive Maps**: GeoJSON-based mapping with claim polygons
- **💡 Smart Recommendations**: Rule-based AI recommendations for government schemes
- **🚀 Local-First**: Runs completely offline, no external dependencies
- **📊 Demo Mode**: Pre-loaded with sample data for presentations

### 🏗️ Architecture

```
FRA Atlas WebGIS/
├── backend/          # FastAPI server (Port 8000)
│   ├── main.py       # Application entry point
│   ├── models.py     # Pydantic data models
│   ├── db.py         # Database operations (demo mode)
│   ├── routes/       # API route handlers
│   └── utils/        # OCR, NLP, and business logic
├── frontend/         # React + Vite app (Port 5000)
│   ├── src/          # React components
│   └── public/       # Static assets
└── start-local.sh    # One-command startup
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** 
- **Node.js 18+** and npm
- **Git**

### One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd fra-atlas-webgis

# Run the startup script
./start-local.sh
```

That's it! The script will:
1. Install all dependencies
2. Start both backend and frontend
3. Display access URLs and API endpoints

### Manual Setup (Alternative)

If you prefer manual control:

```bash
# Backend setup
cd backend
pip install -r requirements.txt
python main.py &

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## 🌐 Access URLs

### Local Development
- **Frontend Application**: http://localhost:5000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### Replit Cloud Environment
- **Frontend Application**: `https://5000-<your-repl-slug>.<domain>`
- **Backend API**: `https://8000-<your-repl-slug>.<domain>`
- **API Documentation**: `https://8000-<your-repl-slug>.<domain>/docs`

**Environment Variables** (optional):
- `VITE_BACKEND_URL`: Override API base URL (e.g., `https://8000-abc123.replit.dev`)
- `NODE_ENV=production`: Enable production CORS settings
- `PRODUCTION_ORIGINS`: Comma-separated allowed origins for production

## 🔧 System Requirements

### Software Dependencies

```bash
# Python packages (auto-installed)
fastapi>=0.104.1
uvicorn>=0.24.0
pydantic>=2.5.0
pytesseract>=0.3.10
pillow>=10.1.0
supabase>=2.0.2
asyncpg>=0.29.0

# Node.js packages (auto-installed)
react@^18.3.1
vite@^5.4.2
typescript@^5.5.3
leaflet@^1.9.4
react-leaflet@^4.2.1
tailwindcss@^3.4.1
```

### System Dependencies

For **OCR functionality**, install Tesseract:

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/tesseract-ocr/tesseract
```

## 📚 API Documentation

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload/` | Upload and process documents (PDF/images) |
| `GET` | `/claims/` | List all claims (supports status filtering) |
| `GET` | `/claims/{id}` | Get specific claim details |
| `GET` | `/map/` | Get GeoJSON data for mapping |
| `GET` | `/recommend/{claim_id}` | Get AI recommendations for a claim |
| `GET` | `/health` | System health check |

### Example Usage

```javascript
// Upload a file
const formData = new FormData();
formData.append('file', file);
const response = await fetch('http://localhost:8000/upload/', {
  method: 'POST',
  body: formData
});

// Get claims with filtering
const claims = await fetch('http://localhost:8000/claims/?status=pending');

// Get recommendations
const recs = await fetch('http://localhost:8000/recommend/1');
```

## 🎮 Demo Mode Features

The system runs in **Demo Mode** by default (no database setup required):

### Sample Data Included
- ✅ **Pre-loaded Claims**: Realistic forest rights claims
- ✅ **Government Schemes**: Irrigation, Legal Aid, Community Rights, Livelihood schemes
- ✅ **Geospatial Data**: Sample polygon boundaries
- ✅ **AI Recommendations**: Rule-based matching system

### Supported File Types
- **Documents**: `.pdf`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff`, `.gif`
- **Size Limit**: 10MB per file

## 🏛️ Production Setup (Optional)

To connect to a real Supabase database:

1. **Create `.env` file in backend/**:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

2. **Database Schema** (PostgreSQL with PostGIS):
```sql
-- Claims table
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    claimant_name TEXT NOT NULL,
    village TEXT NOT NULL,
    area NUMERIC(10,2) CHECK (area >= 0),
    status TEXT CHECK (status IN ('granted', 'pending', 'rejected')),
    geom GEOGRAPHY(POLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schemes and recommendations tables
-- (See backend/models.py for complete schema)
```

## 🛠️ Development

### Project Structure

```
backend/
├── routes/
│   ├── upload.py         # File processing endpoint
│   ├── claims.py         # Claims management
│   ├── map.py           # Geospatial data
│   └── recommendations.py # AI recommendations
├── utils/
│   ├── ocr.py           # OCR processing (Tesseract)
│   ├── nlp.py           # NLP entity extraction
│   └── rules.py         # Recommendation engine
├── main.py              # FastAPI application
├── models.py            # Pydantic schemas
└── db.py               # Database operations

frontend/
├── src/
│   ├── components/      # React components
│   ├── utils/api.ts     # API client
│   └── types/           # TypeScript types
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

### Making Changes

```bash
# Backend changes (auto-reload enabled)
cd backend
# Edit files - server restarts automatically

# Frontend changes (hot-reload enabled) 
cd frontend
# Edit files - browser updates automatically
```

## 🎯 Smart India Hackathon Demo

### Presentation Points

1. **🤖 AI Processing**: Upload a document → See OCR + NLP extraction in real-time
2. **📊 Data Management**: View claims table with filtering and search
3. **🗺️ Geospatial Visualization**: Interactive map with claim boundaries
4. **💡 Intelligent Recommendations**: AI suggests relevant government schemes
5. **⚡ Performance**: Fast, offline-capable, runs on any laptop

### Sample Demo Flow

1. **Start Application**: `./start-local.sh`
2. **Upload Document**: Use the drag-and-drop interface
3. **View Extraction**: See parsed claimant name, village, area, status
4. **Check Claims Table**: Filter by status, search, sort
5. **Explore Map**: Click polygons to see claim details
6. **Get Recommendations**: View AI-suggested schemes with confidence scores

## 🔒 Security & Privacy

- **Local-First**: No data leaves your machine in demo mode
- **File Validation**: Strict file type and size limits
- **Input Sanitization**: All user inputs are validated and sanitized
- **CORS Security**: Configured for local development only

## ❓ Troubleshooting

### Common Issues

**Port Conflicts**:
```bash
# Check what's using ports 5000/8000
lsof -i :5000
lsof -i :8000

# Kill processes if needed
kill -9 <PID>
```

**OCR Not Working**:
```bash
# Install Tesseract OCR
sudo apt-get install tesseract-ocr  # Linux
brew install tesseract             # macOS
```

**Module Not Found Errors**:
```bash
# Reinstall dependencies
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

**Frontend Won't Start**:
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🏆 Awards & Recognition

Built for **Smart India Hackathon 2024 - Problem Statement SIH12508**

**Team**: [Your Team Name]  
**Theme**: Smart Automation  
**Category**: Software Edition

---

## 🚀 Ready for Demo!

Your FRA Atlas WebGIS system is configured for:
- ✅ **Offline demonstrations**
- ✅ **Judge evaluation** 
- ✅ **Team presentations**
- ✅ **Local development**

**Start presenting**: `./start-local.sh` and go! 🎯