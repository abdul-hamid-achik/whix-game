# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
- `npm run dev` - Start development server with Turbopack on http://localhost:3000
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Testing
- `npm test` - Run all tests with Vitest
- `npm run test:watch` - Run tests in watch mode for TDD
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Generate coverage report
- To run a single test file: `npm test path/to/test.test.ts`
- To run tests matching a pattern: `npm test -- -t "pattern"`

### Database Operations
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply migrations to database
- `npm run db:push` - Push schema directly to database (dev only)
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:seed` - Seed database with initial data

## High-Level Architecture

### Project Overview
WHIX is a cyberpunk-themed web game where players manage neurodivergent delivery partners in a dystopian gig economy. The game combines turn-based combat, visual novel storytelling, and gacha mechanics with social commentary.

### Core Architecture Patterns

1. **Next.js App Router Structure**
   - `app/` directory uses Next.js 15 App Router with layouts
   - Route groups: `(game)` for authenticated game routes, `(landing)` for public pages
   - API routes in `app/api/` handle backend logic
   - Protected routes use Next-Auth for authentication

2. **State Management Architecture**
   - Zustand stores in `lib/stores/` manage client-side state
   - Each store handles a specific domain (game, partners, missions, story)
   - Stores use Immer middleware for immutable updates
   - Server state syncs with client stores on load

3. **Content Management System**
   - Markdown-based content in `content/` directory
   - Content loader in `lib/cms/` provides type-safe access
   - Dynamic schemas in `lib/cms/content-schemas.ts`
   - Content types: chapters, characters, items, abilities, missions

4. **Database Architecture**
   - PostgreSQL with Drizzle ORM
   - Schema in `lib/db/schema.ts` defines all tables
   - Relationships: users → players → partners/missions/progress
   - Enums define game constants (classes, traits, rarities)

5. **Game Systems Integration**
   - **Combat System**: Turn-based grid combat with Pixi.js visualization
   - **Gacha System**: Partner recruitment with pity mechanics
   - **Story System**: Branching narrative with humanity index
   - **Mission System**: Various mission types (story, side, daily)
   - **Economy**: Tips currency with corporate exploitation mechanics

### Key Technical Decisions

1. **TypeScript Everywhere**
   - Strict mode enabled
   - Comprehensive type definitions for game entities
   - Zod schemas for runtime validation

2. **Component Organization**
   - `components/game/` - Game-specific components
   - `components/ui/` - Reusable UI primitives
   - `components/cms/` - Content management tools
   - Components use Radix UI for accessibility

3. **Testing Strategy**
   - Vitest for unit/integration tests
   - React Testing Library for component tests
   - Test files colocated or in `test/` directory
   - Store tests verify state management logic

4. **API Design**
   - RESTful endpoints for content (`/api/content/[type]`)
   - Stripe webhooks for payment processing
   - AI generation endpoints for dynamic content
   - Type-safe API responses with TypeScript

5. **Performance Considerations**
   - Pixi.js for efficient game rendering
   - Image optimization disabled for pixel art preservation
   - Turbopack for fast development builds
   - Standalone output for optimized production builds

### Development Workflow

1. **Feature Development**
   - Create/update database schema if needed
   - Generate migrations with `npm run db:generate`
   - Update relevant Zustand stores
   - Implement UI components
   - Add tests for new functionality
   - Update content files if needed

2. **Content Updates**
   - Add/modify markdown files in `content/`
   - Ensure content follows established schemas
   - Test content loading with CMS browser

3. **Game Balance**
   - Adjust constants in schema enums
   - Update combat formulas in game logic
   - Test with different partner combinations

### Important Conventions

- **Naming**: Use kebab-case for files, PascalCase for components, camelCase for functions
- **Imports**: Use `@/` alias for absolute imports from project root
- **State Updates**: Always use Immer patterns in Zustand stores
- **Error Handling**: Wrap async operations in try-catch blocks
- **Type Safety**: Avoid `any` types, use proper TypeScript definitions
- **Testing**: Write tests for critical game logic and state management

## Development Guidelines

### Scripting and Execution
- Do not create a script folder with scripts, always execute the solution in steps and defer to using existing @package.json scripts, dont create a new script entry everytime you need to do something