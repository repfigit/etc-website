# Environment Setup Guide

## Separate Development and Production Databases

It's critical to use separate databases for development and production to avoid:
- Test data polluting production
- Development bugs affecting real users
- Accidental data loss or corruption

## Setup Instructions

### 1. Create Separate Databases in MongoDB Atlas

1. Log into your [MongoDB Atlas](https://cloud.mongodb.com/) account
2. Navigate to your cluster
3. Click "Browse Collections"
4. Create two databases:
   - **Production**: `etc-website` (or `etc-website-prod`)
   - **Development**: `etc-website-dev`

### 2. Configure Local Development Environment

Create a `.env.local` file in your project root (this is for development only):

```bash
# Development Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc-website-dev?retryWrites=true&w=majority

# Admin Password (can be simpler for dev)
ADMIN_PASSWORD=dev123

# Environment
NODE_ENV=development
```

**Important**: 
- The `.env.local` file is already in `.gitignore` and won't be committed
- Replace `username`, `password`, and `cluster` with your actual MongoDB credentials
- Notice the database name ends with `-dev`

### 3. Configure Production Environment

For production (e.g., Vercel, Netlify, or your hosting provider):

1. Set environment variables in your hosting platform's dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc-website?retryWrites=true&w=majority
   ADMIN_PASSWORD=your-secure-production-password
   NODE_ENV=production
   ```

2. Notice the production database name is `etc-website` (without `-dev`)

### 4. Seed Your Development Database

Run the seed script to populate your development database:

```bash
npm run seed
```

This will create sample data in your development database without affecting production.

### 5. Environment File Priority

Next.js loads environment variables in this order (first match wins):
1. `.env.local` (local overrides, never committed)
2. `.env.development` or `.env.production` (environment-specific)
3. `.env` (defaults, can be committed as template)

## Best Practices

### Development
- Use `.env.local` for your personal dev database connection
- Keep a weak admin password (e.g., `dev123`)
- Feel free to seed, reset, and experiment with data
- Test destructive operations safely

### Production
- Set environment variables in your hosting provider's dashboard
- Use a strong, unique admin password
- Never commit production credentials to git
- Regularly backup your production database

## Quick Reference

| Environment | Database Name | Config File | Committed to Git? |
|-------------|---------------|-------------|-------------------|
| Development | `etc-website-dev` | `.env.local` | ❌ No |
| Production | `etc-website` | Hosting provider env vars | ❌ No |
| Template | (example only) | `.env.example` | ✅ Yes |

## Switching Between Environments

### Local Development
By default, when you run `npm run dev`, it will use `.env.local`

### Testing Production-like Setup
Create `.env.production.local` and run:
```bash
npm run build
npm start
```

### Verify Current Database
You can add a simple check in your code to see which database you're connected to:
```javascript
console.log('Connected to:', process.env.MONGODB_URI?.split('/').pop()?.split('?')[0]);
```

## Troubleshooting

### "Using same database in dev and prod"
- Check that your `.env.local` has a different database name (e.g., `-dev` suffix)
- Verify environment variables in your production hosting dashboard

### "Connection refused" during seeding
- Make sure your `.env.local` exists with valid credentials
- Check that your IP address is whitelisted in MongoDB Atlas

### "Admin password not working"
- Development uses password from `.env.local`
- Production uses password from hosting provider's environment variables
- They can (and should) be different

## Migration Checklist

- [ ] Created `etc-website-dev` database in MongoDB Atlas
- [ ] Created `.env.local` with dev database connection
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Ran `npm run seed` to populate dev database
- [ ] Set production environment variables in hosting provider
- [ ] Verified production uses different database name
- [ ] Tested both environments work independently

## Need Help?

If you need to create additional databases or set up database users with specific permissions, refer to the [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/).

