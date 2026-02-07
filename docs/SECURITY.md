# 🔐 Security Guide - Mello Cloud

## Implemented Security Measures

### ✅ 1. Privacy Policy & Terms of Service
- **Pages**: `/privacy-policy`, `/terms-of-service`
- **Languages**: EN + RU
- **Compliance**: GDPR, CCPA

### ✅ 2. CORS Protection
- **Development**: All localhost ports allowed
- **Production**: Only `CLIENT_URL` from `.env`
- **File**: `backend/src/app.ts`

### ✅ 3. Strong Password Hashing (Argon2id) 🏆
- **Algorithm**: Argon2id (Password Hashing Competition 2015 winner)
- **Recommendation**: OWASP #1, RFC 9106
- **Parameters**: memoryCost=64MiB, timeCost=3, parallelism=4
- **Advantages**: 
  - Best protection against GPU/ASIC/side-channel attacks
  - Modern security standard (2026)
  - Works perfectly in Docker
- **Library**: `@node-rs/argon2` (native Rust binding)
- **File**: `backend/src/utils/argon2.ts`

### ✅ 4. httpOnly Cookies for JWT
- **Protection against**: XSS attacks
- **Cookies**: 
  - `accessToken` (httpOnly, 1 hour)
  - `refreshToken` (httpOnly, 30 days)
- **Files**: 
  - `backend/src/controllers/userController.ts`
  - `backend/src/middleware/auth.middleware.ts`

### ✅ 5. Account Lockout (Brute-force protection)
- **Limit**: 5 failed attempts
- **Lockout**: 15 minutes
- **Database**: Fields `failedLoginAttempts`, `lockedUntil`
- **File**: `backend/src/services/userService.ts`

### ✅ 6. GDPR Account Deletion
- **Feature**: Complete account deletion with password confirmation
- **Right to be Forgotten**: ✅
- **Deletion**: User, sessions, files, messages, notes, tasks
- **Files**: 
  - Backend: `backend/src/services/userService.ts`
  - Frontend: `frontend/src/pages/profile/ui/Profile.tsx`

### ✅ 7. Strong Secret Keys
- **Length**: 384 bits (SECRET_KEY, ACCESS_SECRET_KEY, REFRESH_SECRET_KEY)
- **Generator**: `backend/scripts/generateSecrets.js`
- **Usage**: `node scripts/generateSecrets.js`

---

## 🚀 Installation and Setup

### 1. Generate Secret Keys

```bash
cd backend
node scripts/generateSecrets.js
```

Copy generated keys to `.env`:

```env
SECRET_KEY="<your-generated-key>"
ACCESS_SECRET_KEY="<your-generated-key>"
REFRESH_SECRET_KEY="<your-generated-key>"
MESSAGE_ENCRYPTION_KEY="<your-generated-key>"
ADMIN_SESSION_SECRET="<your-generated-key>"
```

### 2. Database Migration (ALREADY DONE ✅)

```bash
cd backend
npx prisma migrate dev --name add_account_lockout_security
```

This adds fields:
- `failedLoginAttempts` (Int, default: 0)
- `lockedUntil` (DateTime?, nullable)

**Status**: ✅ Migration applied!

### 3. CORS Setup for Production

In `.env` specify your frontend domain:

```env
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

### 4. Frontend: httpOnly Cookies Migration

**Important**: After deployment, optionally remove `localStorage.getItem('token')` from components. JWT is now in httpOnly cookies and sent automatically!

Files to update (optional, for full cookie migration):
- `frontend/src/shared/api/rtkApi.ts` - remove `Authorization` header
- `frontend/src/entities/user/model/api/user.ts` - remove `localStorage.getItem('token')`
- All other components with `localStorage`

**Note**: Backend currently supports both methods (cookies have priority, header for backward compatibility).

---

## 🛡️ Best Practices

### Production Checklist

- [x] ✅ Installed `@node-rs/argon2`
- [x] ✅ Database migrated (`add_account_lockout_security`)
- [ ] Generate new secret keys (`node scripts/generateSecrets.js`)
- [ ] Set `CLIENT_URL` in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (for `secure` cookies)
- [ ] Ensure `.env` is not committed to Git
- [ ] Use different keys for dev/staging/prod

### Monitoring

Recommended to monitor:
- Failed login attempts (logs)
- Account lockouts (metrics)
- GDPR deletion requests (audit logs)

### Backup

Before updating secret keys:
1. Backup your database
2. Notify users they will need to re-login
3. Update keys
4. Restart server

---

## 📋 Security Headers

Already configured in `backend/src/app.ts`:

```typescript
secureHeaders({
  contentSecurityPolicy: { ... },
  xFrameOptions: "DENY",
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
})
```

---

## 🔗 Useful Links

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Guidelines](https://gdpr.eu/)
- [Argon2 RFC 9106](https://datatracker.ietf.org/doc/html/rfc9106)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## 📞 Support

If you found a vulnerability, please report it to:
- Email: security@mellocloud.com
- **DO NOT create public issues for security vulnerabilities!**

---

**Last Updated**: February 5, 2026  
**Security Version**: 2.0
