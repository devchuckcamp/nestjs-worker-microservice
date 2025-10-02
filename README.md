# NestJS Email Worker with Domain-Driven Design

A NestJS application implementing Domain-Driven Design (DDD) architecture for email processing with queue management.

## Architecture

This application follows Domain-Driven Design principles with clear separation of concerns:

### 🏗️ **Domain Layer** (`src/domain/`)
- **Email Entity**: Core business logic for email management
- **Value Objects**: EmailAddress, EmailContent with validation
- **Repository Interface**: Abstract email storage contract

### 🎯 **Application Layer** (`src/application/`)
- **Use Cases**: SendEmailUseCase, QueueEmailUseCase
- **Service Interfaces**: EmailDeliveryService interface

### 🔧 **Infrastructure Layer** (`src/infrastructure/`)
- **SendGrid Integration**: Email delivery implementation
- **Repository Implementation**: In-memory email storage


### 🌐 **Presentation Layer** (`src/presentation/`)
- **Controllers**: Domain-driven email endpoints
- **DTOs**: Request/response validation

## Features

- ✅ **Domain-Driven Design Architecture**
- ✅ **Queue-based Email Processing** with BullMQ
- ✅ **SendGrid Integration** for reliable email delivery
- ✅ **Email Counter** tracking sent emails
- ✅ **Request Validation** with class-validator
- ✅ **Redis Queue Management**

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Docker** (for Redis)
3. **SendGrid API Key** (see SENDGRID-SETUP.md)
4. **Environment Configuration**: Copy `.env.example` to `.env` and configure your credentials

> ⚠️ **Important**: Don't forget to copy `.env.example` to `.env` and add your SendGrid API key before starting the application!

## 🐳 Redis Setup with Docker

### Quick Start with Docker Compose

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: nest-worker-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  redis-insight:
    image: redis/redisinsight:latest
    container_name: nest-worker-redis-insight
    ports:
      - "5540:5540"
    environment:
      - REDIS_HOSTS=local:redis:6379
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  redis_data:
```

### Start Redis Services

> **📝 Note**: These Docker services are for Redis only. You still need to configure your `.env` file for the NestJS application (see Prerequisites section above).

```bash
# Start Redis and Redis Insight
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs redis
docker-compose logs redis-insight
```

### Alternative: Redis Only

If you prefer to run only Redis:

```bash
# Pull and run Redis
docker run -d \
  --name nest-worker-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine redis-server --appendonly yes

# Check Redis is running
docker ps | grep redis
```

## 🔍 Redis Visualization Tools

### Redis Insight (Recommended)

**Web-based Redis GUI with advanced features:**

1. **Access**: http://localhost:5540
2. **Features**:
   - Real-time monitoring
   - Queue visualization for BullMQ
   - Memory analysis
   - Key-value browser
   - Query profiler

3. **Connect to Redis**:
   - Host: `redis` (if using docker-compose) or `localhost`
   - Port: `6379`
   - No password required for development

### Alternative Tools

#### RedisCommander (Web-based)
```bash
docker run -d \
  --name redis-commander \
  -p 8081:8081 \
  -e REDIS_HOSTS=local:redis:6379 \
  rediscommander/redis-commander:latest
```
Access: http://localhost:8081

#### Redis Desktop Manager / Another Redis Desktop Manager
- Download from official websites
- Connect to `localhost:6379`

## 🛠️ Development Tools

### Redis Development Script

Use the included `redis-dev.sh` script for easy Redis management:

```bash
# Start all Redis services
./redis-dev.sh start

# Check service status
./redis-dev.sh status

# Monitor queue activity
./redis-dev.sh queue-status

# Connect to Redis CLI
./redis-dev.sh cli

# Open Redis Insight in browser
./redis-dev.sh insight

# View all available commands
./redis-dev.sh help
```

### Redis CLI Commands

```bash
# Connect to Redis
docker exec -it nest-worker-redis redis-cli

# Monitor Redis operations
docker exec -it nest-worker-redis redis-cli monitor

# Check Redis info
docker exec -it nest-worker-redis redis-cli info

# List all keys
docker exec -it nest-worker-redis redis-cli keys "*"

# BullMQ specific commands
docker exec -it nest-worker-redis redis-cli keys "bull:email-queue:*"
```

### Useful Redis Commands for BullMQ

```bash
# List queue jobs
LLEN bull:email-queue:waiting
LLEN bull:email-queue:active
LLEN bull:email-queue:completed
LLEN bull:email-queue:failed

# View job data
LRANGE bull:email-queue:waiting 0 -1
LRANGE bull:email-queue:completed 0 10

# Clear all jobs (be careful!)
FLUSHALL
```

### BullMQ Configuration Notes

> **📝 Note**: The current BullMQ configuration uses `defaultJobOptions.removeOnComplete = false` specifically for **visualization purposes** in Redis Insight and other monitoring tools. This allows you to see completed jobs in the Redis interface for debugging and monitoring.
> 
> **🔄 Next Update**: In the next version, completed job data will be saved to a database for permanent storage and analytics, allowing us to set `removeOnComplete = true` for better Redis memory management.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### 📧 Send Email (Domain-Driven)
**POST** `/email/send`

```bash
curl -X POST http://localhost:3001/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "your-email@example.com",
    "to": "recipient@example.com",
    "subject": "Hello from NestJS DDD",
    "textContent": "This is a test email from our domain-driven architecture!",
    "htmlContent": "<h1>Hello!</h1><p>This is a test email from our domain-driven architecture!</p>"
  }'
```

### 📊 Email Statistics
**GET** `/email/stats`

```bash
curl http://localhost:3001/email/stats
```

### 🔍 Queue Status
**GET** `/queue/status`

```bash
curl http://localhost:3001/queue/status
```

## Testing

Use the included test script:
```bash
./test-queue-email.sh
```

## Architecture Benefits

- **Clean Architecture**: Clear separation between domain, application, infrastructure, and presentation layers
- **Testability**: Easily mockable dependencies and isolated business logic
- **Maintainability**: Changes to external services don't affect business logic
- **Scalability**: Queue-based processing with Redis and BullMQ
- **Type Safety**: Full TypeScript coverage with strict validation

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 🚀 Development Workflow

### Quick Start Development Setup

#### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <your-repo>
cd nest-worker

# Run automated setup script (handles dependencies, .env, and Redis)
./setup.sh
```
> **✅ The setup script automatically copies `.env.example` to `.env` for you!**

#### Option 2: Manual Setup

1. **Clone and Install**:
   ```bash
   git clone <your-repo>
   cd nest-worker
   npm install
   ```

2. **Setup Redis with Docker**:
   ```bash
   ./redis-dev.sh start
   ```

3. **Configure Environment** (⚠️ **Required**):
   ```bash
   cp .env.example .env
   # Edit .env with your SendGrid credentials
   ```
   > **Note**: The application will not work without proper environment configuration!

4. **Start Development Server**:
   ```bash
   npm run start:dev
   ```

5. **Monitor with Redis Insight**:
   - Open http://localhost:5540
   - Connect to Redis at `localhost:6379`

### Debugging Email Queues

1. **Check Queue Status**:
   ```bash
   ./redis-dev.sh queue-status
   curl http://localhost:3001/queue/status
   ```

2. **Monitor Queue Activity**:
   ```bash
   ./redis-dev.sh monitor
   ```

3. **Send Test Email**:
   ```bash
   ./test-queue-email.sh
   ```

4. **View in Redis Insight**:
   - Go to Browser tab
   - Look for keys starting with `bull:email-queue:`

### Production Considerations

- Use Redis Cluster for high availability
- Configure Redis password authentication
- Set up proper monitoring and alerting
- Use Redis persistence (RDB + AOF)

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
