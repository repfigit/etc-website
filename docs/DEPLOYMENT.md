# Deployment Guide

Guide to deploying the NH Emerging Technologies Caucus website to production.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Code is tested and working locally
- [ ] Production environment variables are prepared
- [ ] Production MongoDB database is set up
- [ ] Database is seeded with content
- [ ] Admin password is strong and secure
- [ ] JWT secret is unique and long
- [ ] All sensitive data is in environment variables (not in code)

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   
   In Vercel project settings, add these environment variables:
   
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.net/etc-website
   ADMIN_PASSWORD=your-strong-production-password
   JWT_SECRET=your-production-jwt-secret-min-32-chars
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like `your-project.vercel.app`

5. **Configure Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., emergingtechnh.org)
   - Update DNS records as instructed

#### Auto-Deploy

Vercel automatically redeploys when you push to GitHub:
```bash
git push origin main  # Triggers automatic deployment
```

### Option 2: Netlify

Similar to Vercel, great for Next.js deployments.

#### Steps:

1. **Push to GitHub** (same as Vercel)

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - New site from Git
   - Choose your repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Environment Variables**
   
   Add in Site Settings → Environment:
   ```
   MONGODB_URI=mongodb+srv://...
   ADMIN_PASSWORD=...
   JWT_SECRET=...
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy site"
   - Configure custom domain if needed

### Option 3: Self-Hosted (VPS/Server)

For full control, deploy to your own server.

#### Requirements:
- Ubuntu/Debian server
- Node.js 18+ installed
- Process manager (PM2 recommended)
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

#### Steps:

1. **Install Dependencies on Server**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install nginx
   ```

2. **Clone and Build Project**
   ```bash
   cd /var/www
   git clone https://github.com/your-org/etc-website.git
   cd etc-website
   npm install
   npm run build
   ```

3. **Configure Environment**
   ```bash
   # Create .env file
   nano .env
   
   # Add production variables
   MONGODB_URI=mongodb+srv://...
   ADMIN_PASSWORD=...
   JWT_SECRET=...
   NODE_ENV=production
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "etc-website" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/emergingtechnh.org
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name emergingtechnh.org www.emergingtechnh.org;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/emergingtechnh.org /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Add SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d emergingtechnh.org -d www.emergingtechnh.org
   ```

## MongoDB Production Setup

### MongoDB Atlas (Recommended)

1. **Create Production Database**
   - Separate from development database
   - Use database name: `etc-website` (without `-dev`)

2. **Configure IP Whitelist**
   - Add your production server IP
   - Or `0.0.0.0/0` for cloud deployments (less secure but necessary for some platforms)

3. **Create Database User**
   - Strong password
   - Read/write permissions

4. **Get Connection String**
   - Format: `mongodb+srv://user:pass@cluster.net/etc-website?retryWrites=true&w=majority`

5. **Seed Production Database**
   ```bash
   # From your local machine with production .env
   npm run seed
   ```

## Environment Variables Reference

### Required for Production

| Variable | Example | Notes |
|----------|---------|-------|
| `MONGODB_URI` | `mongodb+srv://...` | Production database only |
| `ADMIN_PASSWORD` | `StrongPass123!@#` | Minimum 8 characters |
| `JWT_SECRET` | `32-char-minimum-secret-key` | Minimum 32 characters |
| `NODE_ENV` | `production` | Must be "production" |

### Security Best Practices

- **Different databases**: Never use same database for dev and production
- **Different passwords**: Use unique passwords for production
- **Rotate secrets**: Change JWT secret periodically
- **Strong passwords**: Use password generator
- **Limited access**: Restrict MongoDB IP whitelist

## Post-Deployment

### 1. Verify Deployment

Test these URLs:
- ✅ Homepage loads: `https://your-domain.com`
- ✅ Events page: `https://your-domain.com/events`
- ✅ Resources page: `https://your-domain.com/resources`
- ✅ Admin login: `https://your-domain.com/admin`
- ✅ API endpoints: `https://your-domain.com/api/events`

### 2. Test Admin Panel

- Login at `/admin`
- Verify you can:
  - Create/edit events
  - Add/remove resources
  - Manage tech list
  - Upload presentations

### 3. Monitor Performance

Check these metrics:
- Page load times
- API response times
- Error rates
- Database performance

### 4. Set Up Monitoring (Optional)

**Vercel Analytics**:
- Built-in analytics in Vercel dashboard
- Web vitals tracking
- Real user monitoring

**External Services**:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: User analytics

## Continuous Deployment

### Vercel/Netlify

Automatic deployment on git push:
```bash
git add .
git commit -m "Update feature"
git push origin main  # Auto-deploys to production
```

### Self-Hosted

Set up webhook or use GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/etc-website
            git pull origin main
            npm install
            npm run build
            pm2 restart etc-website
```

## Rollback

### Vercel/Netlify
- Go to deployments page
- Click "Rollback" on previous working deployment

### Self-Hosted
```bash
cd /var/www/etc-website
git log --oneline  # Find previous commit
git checkout <commit-hash>
npm install
npm run build
pm2 restart etc-website
```

## Troubleshooting

### Build Failures

**Error**: "Module not found"
- Solution: Run `npm install` and commit `package-lock.json`

**Error**: "Environment variable missing"
- Solution: Add all required variables in hosting platform

### Runtime Errors

**Error**: "Cannot connect to MongoDB"
- Check MongoDB URI is correct
- Verify IP whitelist includes deployment platform
- Test connection from deployment environment

**Error**: "500 Internal Server Error"
- Check server logs in hosting platform
- Verify all environment variables are set
- Check MongoDB credentials

### Performance Issues

- Enable caching headers (already configured)
- Use CDN for static assets
- Optimize database queries
- Add indexes to MongoDB collections

## Backup Strategy

### Database Backups

**MongoDB Atlas**:
- Automatic daily backups enabled
- Point-in-time recovery available
- Manual snapshots in dashboard

**Self-Hosted**:
```bash
# Daily backup script
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)

# Cron job (daily at 2 AM)
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

### Code Backups

- Git repository is your backup
- Push regularly to GitHub
- Tag releases: `git tag -a v1.0.0 -m "Production release"`

## Support

For deployment issues:
- Email: info@emergingtechnh.org
- Check [GitHub Issues](https://github.com/your-org/etc-website/issues)
