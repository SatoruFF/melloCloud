# MelloCloud

A personal workspace application that combines cloud storage, real-time chat, file management, and collaborative note-taking.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Redux Toolkit with RTK Query for state management
- Vite build tool
- Ant Design component library
- SCSS modules for styling
- React Router v6
- i18next for internationalization (EN/RU)

### Backend
- Hono.js web framework
- Prisma ORM with PostgreSQL
- JWT authentication with httpOnly cookies
- Argon2id password hashing
- WebSocket support for real-time features
- AWS S3 for file storage
- Rate limiting and security headers

### Security
- Argon2id password hashing (OWASP recommended)
- httpOnly cookies for JWT tokens
- Account lockout after failed login attempts
- CORS configuration for production
- Message encryption (AES-GCM)
- GDPR compliance with account deletion
- See SECURITY.md for details

## Setup

### Requirements
- Node.js 18+
- PostgreSQL 14+
- AWS S3 account (for file storage)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables by copying `.env.example` to `.env` and filling in required values.

4. Generate secure secret keys:
```bash
node scripts/generateSecrets.js
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env` (set `VITE_API_URL` and other required values).

4. Start development server:
```bash
npm run dev
```

## Deployment

The application is currently hosted on Yandex Cloud infrastructure.

## Documentation

- `SECURITY.md` - Security implementation details and best practices
- `backend/MIGRATION_ARGON2.md` - Password hashing migration guide
- API documentation available at `/api-docs` when backend is running

## License

Private project