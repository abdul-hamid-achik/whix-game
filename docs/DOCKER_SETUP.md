# Docker Development Environment Setup

## Prerequisites

- Docker Desktop installed and running
- Docker Compose V2
- At least 4GB of RAM allocated to Docker
- Port 3000, 5432, and 8080 available

## Quick Start

1. **Clone the repository and navigate to project**
   ```bash
   cd whix-game
   ```

2. **Copy environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Start the development environment**
   ```bash
   npm run docker:dev
   ```

4. **Access the services**
   - Next.js App: http://localhost:3000
   - Adminer (DB Management): http://localhost:8080
   - PostgreSQL: localhost:5432

## Docker Commands

### Development
```bash
# Start all services
npm run docker:dev

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Rebuild containers
npm run docker:build

# Reset everything (including database)
npm run docker:reset
```

### Database Operations
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=postgresql://whixuser:whixpassword@localhost:5432/whixgame

# Next Auth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Game Configuration
GAME_VERSION=0.1.0
NODE_ENV=development

# PostgreSQL (for docker-compose)
POSTGRES_USER=whixuser
POSTGRES_PASSWORD=whixpassword
POSTGRES_DB=whixgame
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Next.js   │  │ PostgreSQL  │  │  Adminer   │ │
│  │    :3000    │  │    :5432    │  │   :8080    │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
│         │                │                │        │
│         └────────────────┴────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Development Workflow

1. **Making Code Changes**
   - Changes to source files are automatically detected
   - Next.js hot reload works through volume mounts
   - No need to rebuild containers for code changes

2. **Database Schema Changes**
   ```bash
   # 1. Modify schema in lib/db/schema.ts
   # 2. Generate migration
   npm run db:generate
   # 3. Apply migration
   npm run db:migrate
   ```

3. **Adding Dependencies**
   ```bash
   # Stop containers
   npm run docker:down
   
   # Add dependency locally
   npm install <package-name>
   
   # Rebuild and start
   npm run docker:build
   npm run docker:dev
   ```

## Production Deployment

For production, use the optimized Dockerfile:

```bash
# Build production image
docker build -t whix-game:prod .

# Or use docker-compose production
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Permission Issues
```bash
# Fix node_modules permissions
docker-compose exec app chown -R node:node /app/node_modules

# Reset everything
npm run docker:reset
```

### Build Cache Issues
```bash
# Build without cache
docker-compose build --no-cache

# Remove all volumes and rebuild
docker-compose down -v
docker-compose build
docker-compose up
```

## Performance Optimization

1. **Use .dockerignore** - Already configured to exclude unnecessary files

2. **Volume Optimization**
   - node_modules is excluded from bind mount
   - .next directory is excluded for better performance

3. **Resource Limits** (Optional)
   Add to docker-compose.yml:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

## Security Considerations

1. **Never commit .env files**
2. **Use strong passwords for production**
3. **Limit database access in production**
4. **Use secrets management for sensitive data**
5. **Regular security updates for base images**

## Monitoring

View real-time logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

Check resource usage:
```bash
docker stats
```

## Backup and Restore

### Backup Database
```bash
docker-compose exec postgres pg_dump -U whixuser whixgame > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U whixuser whixgame < backup.sql
```

## Additional Tools

- **Adminer**: Database management UI at http://localhost:8080
- **Drizzle Studio**: ORM-specific UI with `npm run db:studio`
- **Docker Desktop**: Visual container management

## Next Steps

1. Set up authentication system
2. Implement database migrations
3. Configure CI/CD pipeline
4. Set up monitoring and logging
5. Prepare production deployment