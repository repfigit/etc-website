# 🔒 Security Setup Guide

## Overview

The authentication system has been upgraded to use secure, server-side authentication with JWT tokens and HTTP-only cookies. This provides much better security than the previous client-side only authentication.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# MongoDB Database Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc-website-dev?retryWrites=true&w=majority

# Admin Authentication (Server-side only - NOT prefixed with NEXT_PUBLIC_)
ADMIN_PASSWORD=your-secure-admin-password-here

# JWT Secret for secure token generation (change in production)
JWT_SECRET=your-jwt-secret-key-change-in-production

# Environment
NODE_ENV=development
```

## Security Features Implemented

### ✅ Server-Side Authentication
- Password validation happens on the server, not in the browser
- No sensitive data exposed to client-side code

### ✅ JWT Token-Based Sessions
- Secure JWT tokens for authentication
- Tokens expire after 24 hours
- Tokens include timestamp validation

### ✅ HTTP-Only Cookies
- Authentication tokens stored in HTTP-only cookies
- Cannot be accessed by JavaScript (XSS protection)
- Secure flag enabled in production
- SameSite protection against CSRF

### ✅ API Endpoint Protection
- All admin operations (POST, PUT, DELETE) require authentication
- GET endpoints remain public for content display
- Proper error handling for unauthorized access

### ✅ Rate Limiting
- Login attempts limited to 5 per IP per 15 minutes
- Automatic cleanup of rate limit data
- Prevents brute force attacks

### ✅ Secure Password Storage
- Admin password stored in server-side environment variables
- No client-side password exposure

## Production Deployment

### Environment Variables for Production

Set these in your hosting provider's environment variables dashboard:

```bash
# Production MongoDB (different database)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc-website?retryWrites=true&w=majority

# Strong production password
ADMIN_PASSWORD=VerySecureProductionPassword2024!

# Strong JWT secret (use a random string)
JWT_SECRET=your-very-long-random-jwt-secret-key-for-production

# Production environment
NODE_ENV=production
```

### Security Checklist for Production

- [ ] Use strong, unique admin password (20+ characters)
- [ ] Generate a strong JWT secret (64+ characters)
- [ ] Use different database for production
- [ ] Enable HTTPS (cookies will be secure automatically)
- [ ] Regularly rotate admin password
- [ ] Monitor login attempts and failed authentications

## API Security

### Protected Endpoints
All admin operations now require authentication:

- `POST /api/events` - Create event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `POST /api/tech-list` - Create tech item
- `PUT /api/tech-list/[id]` - Update tech item
- `DELETE /api/tech-list/[id]` - Delete tech item
- `POST /api/resources` - Create resource
- `PUT /api/resources/[id]` - Update resource
- `DELETE /api/resources/[id]` - Delete resource

### Public Endpoints
These remain public for content display:

- `GET /api/events` - List events (public view)
- `GET /api/events/[id]` - Get individual event
- `GET /api/tech-list` - List tech items (public view)
- `GET /api/resources` - List resources (public view)

## Authentication Flow

1. **Login**: User submits password to `/api/auth/login`
2. **Verification**: Server validates password against environment variable
3. **Token Creation**: Server creates JWT token with expiration
4. **Cookie Setting**: Server sets HTTP-only cookie with token
5. **API Requests**: Browser automatically sends cookie with requests
6. **Verification**: Each protected API endpoint verifies the token
7. **Logout**: User calls `/api/auth/login` with DELETE method to clear cookie

## Testing the Security

### Test Authentication
1. Try to access `/admin/dashboard` without logging in - should redirect to login
2. Try to call API endpoints directly without authentication - should return 401
3. Try to login with wrong password multiple times - should get rate limited
4. Check that admin password is not visible in browser developer tools

### Test Session Management
1. Login and verify you can access admin pages
2. Clear browser cookies and try to access admin pages - should redirect to login
3. Wait for token expiration (24 hours) and verify session expires

## Troubleshooting

### "Authentication required" errors
- Check that `ADMIN_PASSWORD` environment variable is set
- Verify the password matches what you're entering
- Ensure cookies are enabled in your browser

### "Server configuration error"
- Make sure `ADMIN_PASSWORD` is set in your environment variables
- Restart your development server after changing environment variables

### Rate limiting issues
- Wait 15 minutes after 5 failed attempts
- Check that you're not behind a shared IP (corporate network, etc.)

## Security Best Practices

1. **Never commit environment files** - `.env.local` is in `.gitignore`
2. **Use different passwords** for development and production
3. **Regularly rotate passwords** in production
4. **Monitor failed login attempts** for security threats
5. **Keep dependencies updated** for security patches
6. **Use HTTPS in production** for secure cookie transmission

## Migration from Old System

The old client-side authentication has been completely replaced. If you had any custom code that relied on `sessionStorage.getItem('adminAuth')`, you'll need to update it to use the new authentication API.

### Old vs New

| Old System | New System |
|------------|------------|
| `sessionStorage.getItem('adminAuth')` | `fetch('/api/auth/verify')` |
| `sessionStorage.setItem('adminAuth', 'true')` | `fetch('/api/auth/login', { method: 'POST' })` |
| `sessionStorage.removeItem('adminAuth')` | `fetch('/api/auth/login', { method: 'DELETE' })` |
| Client-side password check | Server-side password validation |
| No API protection | All admin APIs protected |

The new system is significantly more secure and production-ready.
