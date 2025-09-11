# 🐳 Docker Deployment Guide

## Quick Start (Recommended)

### Option 1: Docker Compose (Easiest)
```bash
# Clone the repository
git clone <your-repo-url>
cd SIH_25

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:8000
# API: http://localhost:8000/docs
```

### Option 2: Docker Build & Run
```bash
# Build the image
docker build -t fra-atlas .

# Run the container
docker run -d -p 8000:8000 --name fra-atlas fra-atlas

# Access the application
# Frontend: http://localhost:8000
# API: http://localhost:8000/docs
```

## 📋 Prerequisites

- **Docker**: Install from [docker.com](https://www.docker.com/get-started)
- **Docker Compose**: Usually included with Docker Desktop

## 🚀 Features

- ✅ **Single Container**: Frontend + Backend combined
- ✅ **OCR Support**: Tesseract included for document processing
- ✅ **Demo Mode**: Works without database setup
- ✅ **Health Checks**: Built-in monitoring
- ✅ **Production Ready**: Optimized build

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```bash
# Optional: Database connection
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
DATABASE_URL=your_database_url

# Optional: Production settings
NODE_ENV=production
PRODUCTION_ORIGINS=https://yourdomain.com
```

### Custom Port
```bash
# Run on different port
docker run -d -p 3000:8000 --name fra-atlas fra-atlas
# Access at http://localhost:3000
```

## 📁 Volume Mounting

### Persistent Uploads
```bash
docker run -d -p 8000:8000 \
  -v $(pwd)/uploads:/app/uploads \
  --name fra-atlas fra-atlas
```

### With Environment File
```bash
docker run -d -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  --name fra-atlas fra-atlas
```

## 🔍 Monitoring

### Check Container Status
```bash
# View running containers
docker ps

# Check logs
docker logs fra-atlas

# Follow logs in real-time
docker logs -f fra-atlas
```

### Health Check
```bash
# Manual health check
curl http://localhost:8000/health

# Container health status
docker inspect fra-atlas | grep Health -A 10
```

## 🛠️ Development

### Development with Hot Reload
```bash
# For development, mount source code
docker run -d -p 8000:8000 \
  -v $(pwd)/backend:/app \
  -v $(pwd)/frontend/dist:/app/static \
  --name fra-atlas-dev fra-atlas
```

### Build Arguments
```bash
# Custom Python version
docker build --build-arg PYTHON_VERSION=3.10 -t fra-atlas .
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 8000
netstat -tulpn | grep 8000
# Kill the process or use different port
docker run -d -p 8001:8000 --name fra-atlas fra-atlas
```

**Container Won't Start**
```bash
# Check logs for errors
docker logs fra-atlas

# Run interactively for debugging
docker run -it --rm fra-atlas /bin/bash
```

**OCR Not Working**
```bash
# Verify Tesseract installation
docker exec fra-atlas tesseract --version
```

### Reset Everything
```bash
# Stop and remove container
docker stop fra-atlas
docker rm fra-atlas

# Remove image (optional)
docker rmi fra-atlas

# Clean up volumes (optional)
docker volume prune
```

## 📊 Performance

### Resource Usage
- **RAM**: ~200MB (demo mode)
- **CPU**: Minimal (spikes during OCR processing)
- **Storage**: ~500MB (image + dependencies)

### Optimization
```bash
# Multi-stage build reduces image size
# Production build excludes dev dependencies
# Static files served efficiently by FastAPI
```

## 🔒 Security

### Production Deployment
```bash
# Use specific tag instead of latest
docker build -t fra-atlas:v1.0.0 .

# Run with limited privileges
docker run -d -p 8000:8000 \
  --user 1000:1000 \
  --read-only \
  --tmpfs /tmp \
  fra-atlas:v1.0.0
```

### Network Security
```bash
# Create custom network
docker network create fra-network

# Run with custom network
docker run -d --network fra-network \
  --name fra-atlas fra-atlas
```

## 🚀 Deployment Options

### Cloud Platforms

**AWS ECS/Fargate**
```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag fra-atlas:latest <account>.dkr.ecr.<region>.amazonaws.com/fra-atlas:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/fra-atlas:latest
```

**Google Cloud Run**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/fra-atlas
gcloud run deploy --image gcr.io/PROJECT-ID/fra-atlas --platform managed
```

**Azure Container Instances**
```bash
# Deploy to Azure
az container create --resource-group myResourceGroup \
  --name fra-atlas --image fra-atlas:latest \
  --ports 8000 --dns-name-label fra-atlas-demo
```

## 📝 Notes

- The container runs in **demo mode** by default (no database required)
- Frontend is built and served from the same container
- OCR processing works out of the box with Tesseract
- Health checks ensure container reliability
- Logs are available via `docker logs`

## 🎯 Smart India Hackathon Ready!

This Docker setup is perfect for:
- ✅ **Judge Demonstrations**: One command deployment
- ✅ **Team Development**: Consistent environment
- ✅ **Production Deployment**: Cloud-ready container
- ✅ **Offline Demos**: No external dependencies required

**Start presenting**: `docker-compose up -d` and go! 🚀