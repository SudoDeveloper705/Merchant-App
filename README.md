# Merchant App

Financial SaaS Platform - Monorepo

## Project Structure

```
merchantapp/
├── apps/
│   ├── api/              # Express API server (Node.js + TypeScript)
│   └── web/              # Next.js web application
├── packages/
│   └── shared/           # Shared types, constants, and utilities
├── package.json          # Root workspace configuration
└── tsconfig.json         # Root TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm install
```

### Development

```bash
# Run API server
npm run dev:api

# Run web app
npm run dev:web

# Build all packages
npm run build
```

## Tech Stack

- **API**: Express.js + TypeScript + PostgreSQL (raw SQL)
- **Web**: Next.js 14 + TypeScript
- **Auth**: JWT
- **RBAC**: Role-based access control
- **Monorepo**: npm workspaces

## Environment Variables

### API (.env)

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/merchantapp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## Features

- ✅ Monorepo structure with npm workspaces
- ✅ Express API with TypeScript
- ✅ Next.js web application
- ✅ Shared package for types and constants
- ✅ JWT authentication ready
- ✅ RBAC roles and permissions
- ✅ PostgreSQL with raw SQL (no ORM)
- ✅ Clean folder structure

