# Vercel Deployment Guide

This guide will help you deploy the etc-website to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A MongoDB database (MongoDB Atlas recommended)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Push to Git Repository

Make sure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js

## Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

### Required Variables

- `MONGODB_URI` - Your MongoDB connection string (e.g., `mongodb+srv://user:password@cluster.mongodb.net/database`)
- `ADMIN_PASSWORD` - Admin panel password (minimum 8 characters)
- `JWT_SECRET` - Secret key for JWT tokens (minimum 32 characters, use a strong random string)
- `NODE_ENV` - Set to `production` (Vercel sets this automatically, but you can override if needed)

### How to Add Environment Variables

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:
   - **Name**: The variable name (e.g., `MONGODB_URI`)
   - **Value**: The variable value
   - **Environment**: Select all (Production, Preview, Development)
3. Click **Save**

### Generating a Secure JWT_SECRET

You can generate a secure JWT secret using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

## Step 4: Deploy

1. After configuring environment variables, go to the **Deployments** tab
2. Click **"Redeploy"** on the latest deployment (or push a new commit)
3. Wait for the build to complete

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Test the admin panel at `/admin`
3. Verify API endpoints are working

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## MongoDB Atlas Setup

If using MongoDB Atlas:

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist Vercel IPs (or use `0.0.0.0/0` for all IPs - less secure but easier)
4. Get your connection string and add it as `MONGODB_URI`

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` has correct build scripts

### Database Connection Issues

- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (IP whitelist)
- Ensure database user has correct permissions

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to your main/master branch
- **Preview**: Pull requests and other branches

## Performance Optimization

The project is already configured with:
- Vercel Analytics (`@vercel/analytics`)
- Vercel Speed Insights (`@vercel/speed-insights`)
- Optimized Next.js configuration

## Support

For Vercel-specific issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

