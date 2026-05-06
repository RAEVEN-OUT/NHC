# User Management Module Reference

## Scope

This module handles identity and access control only:

- Users
- Roles
- Permissions
- Authentication
- Authorization
- Sessions
- Audit logs

Lead management, customers, cards, hospitals, and discounts should be separate modules later.

## Roles

Seeded roles:

- `super_admin`
- `admin`
- `receptionist`
- `field_manager`
- `field_executive`
- `customer`

## Tables

Core RBAC:

- `users`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`

Auth/session:

- `refresh_tokens`
- `sessions`

Monitoring:

- `audit_logs`

## API Endpoints

Auth:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Users:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `PATCH /users/:id/status`
- `POST /users/:id/roles`
- `GET /users/:id/roles`
- `POST /users/:id/reset-password`
- `GET /users/:id/activity`

Roles and permissions:

- `GET /roles`
- `POST /roles`
- `PATCH /roles/:id`
- `DELETE /roles/:id`
- `GET /permissions`
- `GET /roles/:id/permissions`
- `POST /roles/:id/permissions`

Sessions:

- `GET /sessions`
- `DELETE /sessions/:id`
- `DELETE /sessions/user/:id`

Audit:

- `GET /audit-logs`

## Permission Rules

Every protected endpoint uses backend guards:

```ts
@Permissions('user.create')
```

The request flow is:

```txt
JWT -> user -> user_roles -> roles -> role_permissions -> permissions -> allow/deny
```

Frontend permission checks can be added for UX, but the backend guard is the source of truth.
