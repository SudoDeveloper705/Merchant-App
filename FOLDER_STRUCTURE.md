# Merchant App - Folder Structure

```
merchantapp/
├── .gitignore
├── package.json                 # Root workspace configuration
├── tsconfig.json               # Root TypeScript config
├── README.md
│
├── apps/
│   ├── api/                    # Express API Server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── env.example         # Environment variables template
│   │   └── src/
│   │       └── index.ts        # Express server with /health route
│   │
│   └── web/                    # Next.js Web Application
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       └── src/
│           └── app/
│               ├── layout.tsx   # Root layout
│               ├── page.tsx     # Home page
│               ├── globals.css  # Global styles
│               └── api/
│                   └── health/
│                       └── route.ts  # Health check API route
│
└── packages/
    └── shared/                 # Shared Package
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts        # Main export file
            ├── roles.ts        # RBAC roles and permissions
            ├── constants.ts    # Shared constants
            └── types.ts        # Shared TypeScript types
```

## Key Features

### API (apps/api)
- Express.js server with TypeScript
- Health check endpoint at `/health`
- Ready for PostgreSQL integration (raw SQL)
- JWT authentication ready
- CORS enabled

### Web (apps/web)
- Next.js 14 with App Router
- TypeScript configured
- Health check API route
- Basic layout and home page

### Shared (packages/shared)
- **Roles**: UserRole enum with 5 roles (SUPER_ADMIN, ADMIN, MERCHANT, STAFF, VIEWER)
- **Permissions**: Role-based permission system with helper functions
- **Constants**: API endpoints, HTTP status codes, JWT config, pagination
- **Types**: User, Merchant, Transaction types with DTOs

## Next Steps

1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Create database connection module in `apps/api/src/db/`
4. Implement authentication middleware
5. Add RBAC middleware for route protection
6. Create API routes for users, merchants, transactions

