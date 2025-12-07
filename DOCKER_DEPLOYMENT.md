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

#### 1. Health Check Failing
**Symptoms**: Container restarts, ECS shows unhealthy

**Solutions**:
```bash
# Check if app is listening on correct port
docker exec -it email-worker-app netstat -tlnp | grep 3000

# Verify health endpoint
docker exec -it email-worker-app wget -O- http://localhost:3000/health

# Check application logs
docker logs email-worker-app --tail 50
```

#### 2. Redis Connection Issues
**Symptoms**: Queue operations failing, connection timeouts

**Solutions**:
```bash
# Test Redis connectivity from container
docker exec -it email-worker-app sh -c "apk add redis && redis-cli -h redis ping"

# Verify Redis host in environment
docker exec -it email-worker-app env | grep REDIS

# Check security group rules (AWS)
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

#### 3. SendGrid API Errors
**Symptoms**: 401 Unauthorized, email sending failures

**Solutions**:
```bash
# Verify API key is set
docker exec -it email-worker-app env | grep SENDGRID

# Test SendGrid API key (replace with your key)
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"from@example.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'

# Check Secrets Manager (AWS)
aws secretsmanager get-secret-value --secret-id sendgrid-api-key
```

#### 4. Image Pull Errors
**Symptoms**: ECS task fails to start, ECR authentication errors

**Solutions**:
```bash
# Verify ECR login
aws ecr get-login-password --region ca-central-1 | docker login --username AWS --password-stdin 205661067201.dkr.ecr.ca-central-1.amazonaws.com

# Check if image exists
aws ecr describe-images --repository-name email-worker --region ca-central-1

# Verify IAM permissions
aws iam get-role-policy --role-name ecsTaskExecutionRole --policy-name ECRPolicy
```

#### 5. Environment Variables Not Loading
**Symptoms**: Application crashes, missing configuration errors

**Solutions**:
```bash
# Check all environment variables in container
docker exec -it email-worker-app env

# Verify .env file (local development)
cat .env

# Check ECS task definition environment variables
aws ecs describe-task-definition --task-definition email-worker:1 --query 'taskDefinition.containerDefinitions[0].environment'
```

### Debug Commands Reference

```bash
# Container Management
docker ps -a                           # List all containers
docker logs email-worker-app -f        # Follow logs in real-time
docker stats email-worker-app          # Resource usage
docker inspect email-worker-app        # Full container details

# Network Debugging
docker exec -it email-worker-app sh    # Enter container shell
docker network ls                      # List networks
docker network inspect email-worker-network  # Network details

# Redis Debugging
docker exec -it nest-worker-redis redis-cli INFO
docker exec -it nest-worker-redis redis-cli KEYS "bull:email-queue:*"
docker exec -it nest-worker-redis redis-cli LLEN "bull:email-queue:waiting"

# Application Testing
curl http://localhost:3000/health      # Health check
curl http://localhost:3000/queue/status  # Queue status
curl http://localhost:3000/email/stats   # Email statistics

# Docker Compose
docker-compose ps                      # Service status
docker-compose logs -f email-worker    # Follow worker logs
docker-compose down -v                 # Stop and remove volumes
docker-compose up -d --build           # Rebuild and restart
```

### Performance Optimization

#### Memory Usage
```bash
# Monitor memory in container
docker stats email-worker-app --no-stream

# Set memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

#### Build Cache Optimization
```bash
# Build with no cache
docker build --no-cache -t email-worker:latest .

# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t email-worker:latest .

# Multi-platform build (for ARM/x86)
docker buildx build --platform linux/amd64,linux/arm64 -t email-worker:latest .
```

## 📊 Monitoring & Observability

### Application Metrics
- Access `/health` for application status
- Access `/queue/status` for BullMQ queue metrics
- Access `/email/stats` for email delivery statistics

### AWS CloudWatch
```bash
# Stream logs
aws logs tail /ecs/email-worker --follow

# Create metric alarm for failed tasks
aws cloudwatch put-metric-alarm \
  --alarm-name email-worker-unhealthy \
  --alarm-description "Alert when email worker is unhealthy" \
  --metric-name HealthyHostCount \
  --namespace AWS/ECS \
  --statistic Average \
  --period 60 \
  --threshold 1 \
  --comparison-operator LessThanThreshold
```

### Redis Monitoring
```bash
# Monitor Redis in real-time
docker exec -it nest-worker-redis redis-cli --stat

# Check queue sizes
docker exec -it nest-worker-redis redis-cli LLEN "bull:email-queue:waiting"
docker exec -it nest-worker-redis redis-cli LLEN "bull:email-queue:active"
docker exec -it nest-worker-redis redis-cli LLEN "bull:email-queue:completed"
docker exec -it nest-worker-redis redis-cli LLEN "bull:email-queue:failed"
```

## 🚀 Production Checklist

- [ ] Environment variables configured in AWS Secrets Manager
- [ ] ElastiCache Redis cluster created and accessible
- [ ] Security groups configured for ECS, Redis, and ALB
- [ ] IAM roles with proper ECR and ECS permissions
- [ ] CloudWatch logging enabled
- [ ] Health check endpoint responding correctly
- [ ] SendGrid API key verified and working
- [ ] Load balancer configured with health checks
- [ ] Auto-scaling policies configured
- [ ] Backup strategy for Redis data
- [ ] Monitoring and alerting set up
- [ ] Docker image tested locally

Your Docker setup is now ready for AWS ECS deployment! 🎉