# 🐳 Docker & AWS ECS Deployment Guide

## Files Created

Your NestJS worker microservice now has the following Docker-related files:

- **`Dockerfile`** - Multi-stage optimized Docker image
- **`.dockerignore`** - Optimized build context  
- **`docker-compose.yml`** - Updated with worker app
- **Health endpoint** - Added `/health` endpoint for container health checks

## 🏗️ Docker Build & Test

### Local Testing
```bash
# Build the image
docker build -t email-worker:latest .

# Run with docker-compose (includes Redis)
docker-compose up -d

# Test the application
curl http://localhost:3000/health
curl http://localhost:3000/queue/status
curl http://localhost:3000/email/stats
```

### Health Check
The container includes a health check endpoint at `/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T...",
  "service": "NestJS Email Worker",
  "version": "0.0.1"
}
```

## ☁️ AWS ECS Deployment

### 1. GitHub Actions Workflow
Your existing `.github/workflows/build-and-push-ecr.yml` will now work! It will:
- ✅ Build the Docker image using the new Dockerfile
- ✅ Push to AWS ECR repository `email-worker`
- ✅ Tag with `latest` for main branch pushes

### 2. ECS Task Definition Requirements

Create an ECS task definition with these key settings:

#### Container Configuration
```json
{
  "name": "email-worker",
  "image": "205661067201.dkr.ecr.ca-central-1.amazonaws.com/email-worker:latest",
  "portMappings": [
    {
      "containerPort": 3000,
      "protocol": "tcp"
    }
  ],
  "healthCheck": {
    "command": [
      "CMD-SHELL",
      "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"
    ],
    "interval": 30,
    "timeout": 5,
    "retries": 3,
    "startPeriod": 60
  }
}
```

#### Environment Variables
Set these in your ECS task definition:
```json
"environment": [
  {"name": "NODE_ENV", "value": "production"},
  {"name": "PORT", "value": "3000"},
  {"name": "REDIS_HOST", "value": "your-redis-host"},
  {"name": "REDIS_PORT", "value": "6379"}
],
"secrets": [
  {
    "name": "SENDGRID_API_KEY",
    "valueFrom": "arn:aws:secretsmanager:ca-central-1:205661067201:secret:sendgrid-api-key"
  }
]
```

### 3. Required AWS Resources

#### ElastiCache Redis Cluster
```bash
# Create Redis cluster for BullMQ
aws elasticache create-cache-cluster \
  --cache-cluster-id email-worker-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

#### Secrets Manager
```bash
# Store SendGrid API key
aws secretsmanager create-secret \
  --name "sendgrid-api-key" \
  --description "SendGrid API key for email worker" \
  --secret-string "SG.your-actual-api-key-here"
```

#### Security Group Rules
- **Inbound**: Port 3000 from ALB/NLB
- **Outbound**: 
  - Port 6379 to Redis cluster
  - Port 443 for SendGrid API
  - Port 80/443 for health checks

### 4. Load Balancer Target Group
```json
{
  "HealthCheckPath": "/health",
  "HealthCheckPort": "3000",
  "HealthCheckProtocol": "HTTP",
  "HealthyThresholdCount": 2,
  "UnhealthyThresholdCount": 3,
  "HealthCheckTimeoutSeconds": 5,
  "HealthCheckIntervalSeconds": 30
}
```

## 🚀 Deployment Steps

1. **Push to GitHub** - Your workflow will build and push the image
2. **Update ECS Service** - Use the new image URI from ECR
3. **Monitor Deployment** - Check CloudWatch logs and health checks
4. **Test Endpoints** - Verify `/health`, `/queue/status`, `/email/stats`

## 📊 Monitoring

### CloudWatch Metrics
- Container CPU/Memory usage
- Health check status
- Application logs

### Redis Monitoring
- Queue length and processing time
- Failed job counts
- Redis connection health

### Custom Metrics
Access via your endpoints:
- `/health` - Application status
- `/queue/status` - BullMQ queue information  
- `/email/stats` - Email sending statistics

## 🔧 Troubleshooting

### Common Issues
1. **Health check failing** - Check if app binds to `0.0.0.0:3000`
2. **Redis connection** - Verify security groups and ElastiCache endpoint
3. **SendGrid errors** - Check API key in Secrets Manager
4. **Image pull errors** - Verify ECR permissions and image URI

### Debug Commands
```bash
# Check running containers
docker ps

# View logs
docker logs email-worker-app

# Test health endpoint
curl http://localhost:3000/health

# Check Redis connection
docker exec -it email-worker-app redis-cli -h redis ping
```

Your Docker setup is now ready for AWS ECS deployment! 🎉