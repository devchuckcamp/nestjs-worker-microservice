#!/bin/bash

# Redis Development Tools Script
# Usage: ./redis-dev.sh [command]

set -e

REDIS_CONTAINER="nest-worker-redis"
REDIS_INSIGHT_CONTAINER="nest-worker-redis-insight"

show_help() {
    echo "Redis Development Tools for NestJS Email Worker"
    echo ""
    echo "Usage: ./redis-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start         Start Redis and Redis Insight with docker-compose"
    echo "  stop          Stop all Redis services"
    echo "  restart       Restart all Redis services"
    echo "  status        Check status of Redis services"
    echo "  logs          Show Redis logs"
    echo "  cli           Connect to Redis CLI"
    echo "  monitor       Monitor Redis operations in real-time"
    echo "  info          Show Redis server information"
    echo "  keys          List all keys in Redis"
    echo "  queue-status  Show BullMQ queue status"
    echo "  flush         Clear all Redis data (BE CAREFUL!)"
    echo "  insight       Open Redis Insight in browser"
    echo "  cleanup       Remove all containers and volumes"
    echo "  help          Show this help message"
}

start_services() {
    echo "🚀 Starting Redis and Redis Insight..."
    docker-compose up -d
    echo "✅ Services started!"
    echo "📊 Redis Insight: http://localhost:5540"
    echo "🔧 Redis CLI: ./redis-dev.sh cli"
}

stop_services() {
    echo "🛑 Stopping Redis services..."
    docker-compose down
    echo "✅ Services stopped!"
}

restart_services() {
    echo "🔄 Restarting Redis services..."
    docker-compose restart
    echo "✅ Services restarted!"
}

show_status() {
    echo "📋 Service Status:"
    docker-compose ps
    echo ""
    echo "🔍 Container Health:"
    docker ps --filter "name=$REDIS_CONTAINER" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    docker ps --filter "name=$REDIS_INSIGHT_CONTAINER" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

show_logs() {
    echo "📜 Redis Logs (last 50 lines):"
    docker-compose logs --tail=50 redis
}

redis_cli() {
    echo "🔧 Connecting to Redis CLI..."
    echo "Type 'exit' to quit the Redis CLI"
    docker exec -it $REDIS_CONTAINER redis-cli
}

monitor_redis() {
    echo "👁️ Monitoring Redis operations (Ctrl+C to stop)..."
    docker exec -it $REDIS_CONTAINER redis-cli monitor
}

redis_info() {
    echo "ℹ️ Redis Server Information:"
    docker exec -it $REDIS_CONTAINER redis-cli info
}

list_keys() {
    echo "🔑 All Redis Keys:"
    docker exec -it $REDIS_CONTAINER redis-cli keys "*"
}

queue_status() {
    echo "📊 BullMQ Queue Status:"
    echo ""
    echo "Waiting jobs:"
    docker exec -it $REDIS_CONTAINER redis-cli llen "bull:email-queue:waiting"
    echo "Active jobs:"
    docker exec -it $REDIS_CONTAINER redis-cli llen "bull:email-queue:active"
    echo "Completed jobs:"
    docker exec -it $REDIS_CONTAINER redis-cli llen "bull:email-queue:completed"
    echo "Failed jobs:"
    docker exec -it $REDIS_CONTAINER redis-cli llen "bull:email-queue:failed"
    echo ""
    echo "Queue keys:"
    docker exec -it $REDIS_CONTAINER redis-cli keys "bull:email-queue:*"
}

flush_redis() {
    echo "⚠️ WARNING: This will delete ALL data in Redis!"
    read -p "Are you sure? Type 'yes' to confirm: " confirm
    if [ "$confirm" = "yes" ]; then
        docker exec -it $REDIS_CONTAINER redis-cli flushall
        echo "🗑️ All Redis data cleared!"
    else
        echo "❌ Operation cancelled"
    fi
}

open_insight() {
    echo "🌐 Opening Redis Insight in browser..."
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:5540
    elif command -v open > /dev/null; then
        open http://localhost:5540
    elif command -v start > /dev/null; then
        start http://localhost:5540
    else
        echo "📊 Redis Insight URL: http://localhost:5540"
    fi
}

cleanup() {
    echo "🧹 Cleaning up Redis containers and volumes..."
    docker-compose down -v
    docker volume prune -f
    echo "✅ Cleanup complete!"
}

# Main command handler
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    cli)
        redis_cli
        ;;
    monitor)
        monitor_redis
        ;;
    info)
        redis_info
        ;;
    keys)
        list_keys
        ;;
    queue-status)
        queue_status
        ;;
    flush)
        flush_redis
        ;;
    insight)
        open_insight
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        echo "❌ No command specified. Use './redis-dev.sh help' for usage."
        exit 1
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use './redis-dev.sh help' for available commands."
        exit 1
        ;;
esac