# cPanel Deployment Checklist

Quick checklist for deploying to cPanel hosting. See full guide: `docs/CPANEL_DEPLOYMENT.md`

## Before You Start

- [ ] cPanel login credentials ready
- [ ] Domain pointed to cPanel server
- [ ] MongoDB Atlas account created (free tier: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

## Step-by-Step Checklist

### 1. MongoDB Setup (15 minutes)

- [ ] Create MongoDB Atlas cluster (free tier)
- [ ] Create database: `etc-website`
- [ ] Create database user (save username & password!)
- [ ] Whitelist IP: `0.0.0.0/0` (Allow access from anywhere)
- [ ] Copy connection string and add password & database name

**Your connection string should look like**:
```
mongodb+srv://username:PASSWORD@cluster0.xxxxx.mongodb.net/etc-website?retryWrites=true&w=majority
```

### 2. cPanel Setup (10 minutes)

- [ ] Login to cPanel
- [ ] Go to "Setup Node.js App" or "Node.js Selector"
- [ ] Create new application:
  - Node.js version: **18.17.0** (or latest 18.x)
  - Application mode: **Production**
  - Application root: `etc-website`
  - Application URL: Your domain
  - Startup file: `server.js`

### 3. Upload Files (5 minutes)

**Choose one method**:

**Option A: Git (Recommended)**
- [ ] In cPanel Terminal: `cd ~/etc-website`
- [ ] Clone: `git clone https://github.com/repfigit/etc-website.git .`

**Option B: File Upload**
- [ ] Download this repo as ZIP
- [ ] Upload to cPanel File Manager
- [ ] Extract in application root folder

### 4. Create server.js File (2 minutes)

- [ ] In File Manager, create new file: `server.js`
- [ ] Copy content from `docs/CPANEL_DEPLOYMENT.md` Step 5.1
- [ ] Or create via Terminal:
  ```bash
  cd ~/etc-website
  nano server.js
  # Paste the server.js code, then Ctrl+X, Y, Enter
  ```

### 5. Create .env File (5 minutes)

- [ ] In Terminal or File Manager, create `.env` file
- [ ] Add these variables (use YOUR values):

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/etc-website?retryWrites=true&w=majority
ADMIN_PASSWORD=YourStrongPassword123!
JWT_SECRET=random-32-character-secret-key-here-make-it-long
NODE_ENV=production
```

**Security Tips**:
- Admin password: 12+ characters, mixed case, numbers, symbols
- JWT secret: Generate with `openssl rand -base64 32` or use [passwordsgenerator.net](https://passwordsgenerator.net)

### 6. Install & Build (10 minutes)

In cPanel Terminal:

- [ ] Navigate: `cd ~/etc-website`
- [ ] Install: `npm install --production`
- [ ] Build: `npm run build`
- [ ] Seed database: `npm run seed`

**Look for**:
```
✓ Connected to MongoDB
✓ Database seeded successfully
```

### 7. Start Application (2 minutes)

- [ ] Go to cPanel "Setup Node.js App"
- [ ] Click your application
- [ ] Click **"Restart"**
- [ ] Verify status shows **"Running"**

### 8. Test Deployment (5 minutes)

- [ ] Visit your domain: `https://yourdomain.com`
- [ ] Check homepage loads
- [ ] Test events page: `/events`
- [ ] Test resources page: `/resources`
- [ ] Login to admin: `/admin` (use your ADMIN_PASSWORD)
- [ ] Try creating a test event

### 9. Enable SSL/HTTPS (5 minutes)

- [ ] In cPanel, go to "SSL/TLS Status"
- [ ] Run AutoSSL for your domain
- [ ] Or install Let's Encrypt certificate
- [ ] Force HTTPS (add to .htaccess):

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 10. Final Verification

- [ ] Homepage works: `https://yourdomain.com`
- [ ] HTTPS (green padlock) shows
- [ ] Admin login works: `https://yourdomain.com/admin`
- [ ] Can create/edit events
- [ ] Can upload PDF presentations
- [ ] Can add resources
- [ ] API works: `https://yourdomain.com/api/events`

## Common Issues & Quick Fixes

### App Won't Start
```bash
# Check Node version (should be 18+)
node --version

# Rebuild
cd ~/etc-website
rm -rf node_modules .next
npm install --production
npm run build

# Restart in cPanel
```

### MongoDB Connection Error
- Check username/password in `.env`
- Verify IP whitelist in MongoDB Atlas (0.0.0.0/0)
- Test connection string format

### 404 Errors
- Verify `server.js` exists
- Check Application startup file is `server.js` in cPanel
- Restart application

### Memory Issues
- Contact host for higher limits
- Consider upgrading to VPS if on shared hosting

## Maintenance

### Weekly
- [ ] Check application is running
- [ ] Review logs: `tail -100 ~/passenger.log`

### Monthly
- [ ] Test admin panel functionality
- [ ] Verify backups are working
- [ ] Check for npm updates: `npm outdated`

### Quarterly
- [ ] Update dependencies: `npm update && npm run build`
- [ ] Review security (change passwords if needed)
- [ ] Test full backup restoration

## Need Help?

1. **Check logs**: In cPanel → Setup Node.js App → View logs
2. **MongoDB issues**: Verify connection in Atlas dashboard
3. **cPanel issues**: Contact your hosting provider
4. **Application issues**: Check error logs in Terminal

## Alternative: Easier Deployment

If cPanel is too complex, consider **Vercel** (free tier):
1. Push code to GitHub
2. Connect to [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy with one click

See `docs/DEPLOYMENT.md` for details.

---

## Quick Command Reference

```bash
# Navigate to app
cd ~/etc-website

# Pull updates (if using Git)
git pull origin main

# Install dependencies
npm install --production

# Build
npm run build

# View logs
tail -f ~/passenger.log

# Check if app is running
ps aux | grep node
```

## Environment Variables Template

Save this for reference:

```env
# MongoDB (from Atlas)
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/etc-website?retryWrites=true&w=majority

# Admin Login
ADMIN_PASSWORD=YourSecurePassword123!

# Security (32+ characters)
JWT_SECRET=your-long-random-secret-key-here

# Environment
NODE_ENV=production
```

## Support

- Full guide: `docs/CPANEL_DEPLOYMENT.md`
- Setup guide: `docs/SETUP.md`
- API docs: `docs/API.md`
- Deployment options: `docs/DEPLOYMENT.md`

**Estimated Total Time**: 60-90 minutes for first deployment

Good luck! 🚀
