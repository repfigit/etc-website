# cPanel Deployment Guide

Complete guide for deploying the NH Emerging Technologies Caucus Next.js application to a cPanel hosting environment.

## Prerequisites

- cPanel hosting account with:
  - Node.js support (version 18.x or higher)
  - SSH access (recommended)
  - Terminal access in cPanel
  - Sufficient disk space (~500MB minimum)
- MongoDB Atlas account (for database)
- Domain pointed to your cPanel server

## Important: Next.js on cPanel Limitations

⚠️ **Note**: cPanel hosting has limitations for Next.js applications:
- Many shared hosting providers don't support Node.js server properly
- Some hosts limit long-running Node.js processes
- Performance may be slower than dedicated hosting

**Alternative**: Consider Vercel (free tier) for better Next.js support. See `docs/DEPLOYMENT.md`

## Step 1: Prepare MongoDB Database

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Create a new cluster (free tier works)
4. Create a database named: `etc-website`

### 1.2 Create Database User

1. Go to Database Access
2. Add New Database User
3. Choose password authentication
4. Username: `etcadmin` (or your choice)
5. Password: **Generate a strong password** (save it securely!)
6. Database User Privileges: "Read and write to any database"

### 1.3 Whitelist IP Address

1. Go to Network Access
2. Add IP Address
3. Choose: **"Allow Access from Anywhere" (0.0.0.0/0)**
   - This is necessary for cPanel since IP may change
   - For better security, add your server's specific IP if known

### 1.4 Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string, it looks like:
   ```
   mongodb+srv://etcadmin:<password>@cluster0.xxxxx.mongodb.net/
   ```
4. **Replace `<password>`** with your actual password
5. **Add database name** at the end:
   ```
   mongodb+srv://etcadmin:YourPassword123@cluster0.xxxxx.mongodb.net/etc-website?retryWrites=true&w=majority
   ```

## Step 2: Access Your cPanel

1. Log into your cPanel account
2. Navigate to **"Setup Node.js App"** or **"Node.js Selector"**
   - If you don't see this, contact your host to enable Node.js

## Step 3: Create Node.js Application in cPanel

### 3.1 Setup Application

1. In cPanel, go to **"Setup Node.js App"**
2. Click **"Create Application"**
3. Configure:
   - **Node.js version**: 18.17.0 (or latest 18.x available)
   - **Application mode**: Production
   - **Application root**: `etc-website` (or your preferred folder)
   - **Application URL**: Select your domain (e.g., `emergingtechnh.org`)
   - **Application startup file**: `server.js` (we'll create this)
   - **Passenger log file**: Leave default

4. Click **"Create"**

## Step 4: Upload Application Files

### Option A: Using cPanel File Manager (Easier)

1. **Build the project locally first**:
   ```bash
   # On your local machine
   npm run build
   ```

2. **Create a deployment package**:
   ```bash
   # Create deployment archive (exclude node_modules and .env)
   zip -r deployment.zip . -x "node_modules/*" -x ".env*" -x ".git/*" -x "_old_static_site/*"
   ```

3. **Upload to cPanel**:
   - In cPanel, go to **File Manager**
   - Navigate to your application root (e.g., `etc-website`)
   - Click **Upload**
   - Upload `deployment.zip`
   - Right-click and **Extract**
   - Delete the zip file

### Option B: Using Git (Recommended if available)

1. **In cPanel Terminal or SSH**:
   ```bash
   cd ~/etc-website
   git clone https://github.com/repfigit/etc-website.git .
   ```

2. **Or using Git Version Control in cPanel**:
   - Go to **Git Version Control** in cPanel
   - Create repository
   - Clone from: `https://github.com/repfigit/etc-website.git`

## Step 5: Create Required Files

### 5.1 Create server.js (Custom Server)

cPanel needs a custom server file. In your application root, create `server.js`:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

### 5.2 Create .env file

In cPanel File Manager or Terminal:

```bash
nano .env
```

Add your production environment variables:

```env
# MongoDB Connection (from Step 1.4)
MONGODB_URI=mongodb+srv://etcadmin:YourPassword123@cluster0.xxxxx.mongodb.net/etc-website?retryWrites=true&w=majority

# Admin Password - CREATE A STRONG PASSWORD
ADMIN_PASSWORD=YourSecureAdminPassword123!

# JWT Secret - GENERATE A LONG RANDOM STRING (min 32 chars)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Node Environment
NODE_ENV=production
```

**Security Tips**:
- Use a password generator for ADMIN_PASSWORD
- For JWT_SECRET, use: `openssl rand -base64 32` or generate online
- Never share these values or commit them to Git

## Step 6: Install Dependencies

### 6.1 Using cPanel Terminal

1. Go to **Terminal** in cPanel
2. Navigate to your app directory:
   ```bash
   cd ~/etc-website
   ```

3. Install dependencies:
   ```bash
   npm install --production
   ```

### 6.2 Using Node.js App Manager

1. In **Setup Node.js App**, click on your application
2. Look for "Run NPM Install" button
3. Click it to install dependencies

## Step 7: Build the Application

In cPanel Terminal:

```bash
cd ~/etc-website
npm run build
```

This will create the `.next` folder with optimized production build.

## Step 8: Seed the Database

Before starting the app, seed your production database:

```bash
cd ~/etc-website
npm run seed
```

You should see:
```
✓ Connected to MongoDB
✓ Database seeded successfully
✓ Database seeded with 50 tech items
```

## Step 9: Start the Application

### 9.1 Update Application in cPanel

1. Go back to **Setup Node.js App**
2. Click on your application
3. **Restart** the application

### 9.2 Verify it's Running

1. Check the application status - should show "Running"
2. Visit your domain: `https://emergingtechnh.org`
3. You should see the homepage

## Step 10: Configure Domain (if needed)

If your domain doesn't point to the app:

1. In cPanel, go to **"Domains"** or **"Addon Domains"**
2. Ensure your domain points to the application directory
3. Or in **Setup Node.js App**, verify the Application URL is correct

## Step 11: SSL/HTTPS Setup

### 11.1 Enable SSL

1. In cPanel, go to **"SSL/TLS Status"**
2. Find your domain
3. Click **"Run AutoSSL"** (if available)

Or:

1. Go to **"Let's Encrypt SSL"** (if available)
2. Select your domain
3. Issue certificate

### 11.2 Force HTTPS

1. In cPanel File Manager, go to public_html (or your app root)
2. Edit or create `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Step 12: Test Your Deployment

### 12.1 Test Public Pages

- ✅ Homepage: `https://emergingtechnh.org`
- ✅ Events: `https://emergingtechnh.org/events`
- ✅ Resources: `https://emergingtechnh.org/resources`
- ✅ API: `https://emergingtechnh.org/api/events`

### 12.2 Test Admin Panel

1. Go to: `https://emergingtechnh.org/admin`
2. Login with your ADMIN_PASSWORD
3. Try creating an event
4. Upload a PDF presentation
5. Create a resource

## Troubleshooting

### Application Won't Start

**Check Node.js version**:
```bash
node --version
```
Should be 18.x or higher

**Check logs**:
1. In Setup Node.js App, view the Passenger log file
2. Or in Terminal:
   ```bash
   tail -f ~/passenger.log
   tail -f ~/etc-website/logs/error.log
   ```

**Common fixes**:
- Restart application in cPanel
- Rebuild: `npm run build`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### MongoDB Connection Issues

**Error: "MongoServerError: bad auth"**
- Check username/password in MONGODB_URI
- Verify database user exists in Atlas
- Password may need URL encoding for special characters

**Error: "MongooseServerSelectionError"**
- Check IP whitelist in MongoDB Atlas
- Ensure you whitelisted 0.0.0.0/0
- Verify connection string format

### 404 Errors or Pages Not Loading

**Static export issue**:
- Next.js needs server mode (not static export)
- Verify `server.js` exists
- Check Application startup file is set to `server.js`

**Rewrite rules**:
Create/edit `.htaccess` in application root:
```apache
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

### Memory Issues

Shared hosting has memory limits. If app crashes:

1. **Optimize package.json** - remove unused dependencies
2. **Contact host** - request higher memory limit
3. **Consider upgrade** - VPS or dedicated hosting

### Port Already in Use

If you see "port already in use":
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or restart via cPanel
```

## Updating the Application

### Method 1: Git Pull (Recommended)

```bash
cd ~/etc-website
git pull origin main
npm install
npm run build
# Restart app in cPanel Setup Node.js App
```

### Method 2: Manual Upload

1. Build locally: `npm run build`
2. Upload changed files via cPanel File Manager
3. Restart application in cPanel

## Performance Optimization

### 1. Enable Caching

In `.htaccess`:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 2. Enable Gzip Compression

In `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>
```

## Maintenance Tasks

### Regular Backups

1. **Database backups**:
   - MongoDB Atlas has automatic backups
   - Or use `mongodump` via Terminal

2. **File backups**:
   - Use cPanel Backup feature
   - Download full backup monthly

### Monitor Application

1. Check logs weekly:
   ```bash
   tail -100 ~/passenger.log
   ```

2. Test admin panel monthly

3. Update dependencies quarterly:
   ```bash
   npm update
   npm run build
   # Restart app
   ```

## Security Checklist

- ✅ Strong ADMIN_PASSWORD (12+ characters, mixed case, numbers, symbols)
- ✅ Long JWT_SECRET (32+ characters)
- ✅ HTTPS enabled (SSL certificate)
- ✅ .env file is NOT in Git repository
- ✅ MongoDB IP restricted (or 0.0.0.0/0 if necessary)
- ✅ Regular backups configured
- ✅ Dependencies updated regularly

## Getting Help

If you encounter issues:

1. **Check logs** in cPanel Setup Node.js App
2. **Contact your hosting provider** for Node.js specific issues
3. **Verify all environment variables** are set correctly
4. **Check MongoDB connection** from another tool (MongoDB Compass)

## Alternative: Vercel Deployment

If cPanel proves difficult, consider **Vercel** (much easier for Next.js):

1. Push code to GitHub
2. Connect to Vercel (free tier available)
3. Add environment variables
4. Deploy with one click

See `docs/DEPLOYMENT.md` for Vercel instructions.

---

## Quick Reference Card

```bash
# Navigate to app
cd ~/etc-website

# Install dependencies
npm install --production

# Build application
npm run build

# Seed database (one time)
npm run seed

# Check Node version
node --version

# View logs
tail -f ~/passenger.log

# Restart app
# Go to cPanel → Setup Node.js App → Restart
```

**Important URLs**:
- Homepage: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin`
- API Test: `https://yourdomain.com/api/events`

**Need Help?** 
- Review error logs in cPanel
- Check MongoDB Atlas connection
- Verify all .env variables are set correctly
