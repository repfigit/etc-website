# Setup Guide

Complete guide to setting up the NH Emerging Technologies Caucus website.

## Prerequisites

- **Node.js** 18+ installed
- **MongoDB** database (local or Atlas)
- **npm** or **yarn** package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, MongoDB drivers, and development tools.

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc-website-dev?retryWrites=true&w=majority

# Admin Panel Password (minimum 8 characters)
ADMIN_PASSWORD=your-secure-password-here

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long

# Environment
NODE_ENV=development
```

#### MongoDB Setup Options

**Option A: MongoDB Atlas (Cloud - Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from the "Connect" button
6. Create a database named `etc-website-dev` for development

**Option B: Local MongoDB**

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/etc-website-dev`

### 3. Seed the Database

Populate your database with initial data:

```bash
npm run seed
```

This will:
- Import all tech items from `data/tech_list.txt`
- Add sample events
- Add sample resources
- Set up database indexes

You'll see output confirming the number of items created.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `ADMIN_PASSWORD` | Admin panel login password | `MySecurePass123` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-32-char-secret-key` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Security Notes

- **Never commit `.env` file to version control**
- Use different databases for development and production
- Use strong passwords (minimum 8 characters)
- Use long JWT secrets (minimum 32 characters)
- Rotate secrets regularly in production

## Development vs Production

### Development Setup

```bash
# .env for development
MONGODB_URI=mongodb+srv://user:pass@cluster.net/etc-website-dev
ADMIN_PASSWORD=dev-password-123
JWT_SECRET=dev-jwt-secret-key-32-characters
NODE_ENV=development
```

### Production Setup

```bash
# Environment variables for production (set in hosting provider)
MONGODB_URI=mongodb+srv://user:pass@cluster.net/etc-website
ADMIN_PASSWORD=strong-production-password-here
JWT_SECRET=production-jwt-secret-key-different-from-dev
NODE_ENV=production
```

**Important**: Use separate databases for dev and production!

## Verification Checklist

After setup, verify everything works:

- [ ] `npm install` completed without errors
- [ ] `.env` file created with all required variables
- [ ] MongoDB connection string is valid
- [ ] `npm run seed` populated the database
- [ ] `npm run dev` starts the server
- [ ] Can access [http://localhost:3000](http://localhost:3000)
- [ ] Can see events and resources on homepage
- [ ] Can access admin panel at `/admin`
- [ ] Can login to admin panel with password

## Troubleshooting

### "Cannot connect to MongoDB"

- Check your MongoDB URI is correct
- Verify your IP is whitelisted in MongoDB Atlas
- Ensure MongoDB service is running (if local)
- Check username and password are correct

### "Environment validation error"

- Ensure all required variables are in `.env`
- Check passwords are at least 8 characters
- Check JWT secret is at least 32 characters
- Verify MongoDB URI starts with `mongodb://` or `mongodb+srv://`

### "Port 3000 is already in use"

- Stop any other processes using port 3000
- Or specify a different port: `PORT=3001 npm run dev`

### "Module not found" errors

- Run `npm install` again
- Delete `node_modules` and run `npm install`
- Clear Next.js cache: `rm -rf .next`

## Next Steps

- Read [API Documentation](API.md) to understand available endpoints
- Check [Deployment Guide](DEPLOYMENT.md) when ready to deploy
- Review [Improvements Log](IMPROVEMENTS.md) for recent changes

## Need Help?

Contact: info@emergingtechnh.org
