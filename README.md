# NHC User Management Module

This workspace is scaffolded from scratch for the hospital user-management module described in `User Management Structure.pdf`.

## Folder Structure

```txt
D:\Projects\NHC
├── docker-compose.yml              # PostgreSQL in Docker
├── .env.example                    # Root reference values
├── apps
│   ├── api                         # NestJS backend
│   │   ├── .env                    # Backend DB/JWT/seed values
│   │   ├── prisma
│   │   │   ├── schema.prisma       # Users, roles, permissions, sessions, audit tables
│   │   │   └── seed.ts             # Default roles, permissions, super admin
│   │   └── src
│   │       ├── auth                # Login, logout, refresh, password reset scaffold
│   │       ├── users               # User CRUD, status, soft delete, role assignment
│   │       ├── roles               # Role CRUD and role-permission assignment
│   │       ├── permissions         # Permission listing
│   │       ├── sessions            # Active sessions and force logout
│   │       ├── audit               # Audit log service and viewer endpoint
│   │       └── common              # Prisma, JWT guard, permission guard, decorators
│   └── web                         # Next.js admin frontend
│       ├── .env.local              # Frontend API URL
│       ├── app
│       │   ├── users               # User management page
│       │   ├── roles               # Role management page
│       │   ├── permissions         # Permission catalog page
│       │   ├── sessions            # Session monitor page
│       │   ├── audit-logs          # Audit viewer page
│       │   └── login               # Email/phone login page
│       └── components              # Admin shell/nav
└── docs
    └── user-management.md          # Module reference
```

## Local Dev Credentials

These are local-only defaults. Change them before any real deployment.

```env
POSTGRES_DB=nhc_dev
POSTGRES_USER=nhc_user
POSTGRES_PASSWORD=nhc_dev_password
DATABASE_URL="postgresql://nhc_user:nhc_dev_password@localhost:5432/nhc_dev?schema=public"
SEED_SUPER_ADMIN_EMAIL="admin@nhc.local"
SEED_SUPER_ADMIN_PHONE="9999999999"
SEED_SUPER_ADMIN_PASSWORD="Admin@12345"
```

## Setup Commands

Run these from `D:\Projects\NHC`.

```powershell
npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev:api
```

In another terminal:

```powershell
npm run dev:web
```

Open:

- API: `http://localhost:3001`
- Web: `http://localhost:3000`
- Login page: `http://localhost:3000/login`

The root web route redirects to `/login`, and successful login opens `/users`.

## Login Behavior

The backend accepts either email or phone in `identifier`.

```json
{
  "identifier": "admin@nhc.local",
  "password": "Admin@12345"
}
```

You can also use:

```json
{
  "identifier": "9999999999",
  "password": "Admin@12345"
}
```
