# Environment Setup Checklist

Use this checklist to ensure your development and production environments are properly separated.

## ✅ Development Setup

- [ ] **Step 1: Create Development Database in MongoDB Atlas**
  - Log into [MongoDB Atlas](https://cloud.mongodb.com/)
  - Navigate to your cluster
  - Click "Browse Collections"
  - Click "Create Database"
  - Name it: `etc-website-dev`

- [ ] **Step 2: Create `.env.local` File**
  - Copy `.env.example` to `.env.local`
  - Update with your credentials:
    ```
    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc-website-dev?retryWrites=true&w=majority
    ADMIN_PASSWORD=dev123
    NODE_ENV=development
    ```
  - ⚠️ Notice the database name: `etc-website-dev` (with `-dev` suffix)

- [ ] **Step 3: Verify `.env.local` is in `.gitignore`**
  - Check that `.gitignore` contains `.env*.local`
  - This prevents committing your local credentials

- [ ] **Step 4: Seed Development Database**
  ```bash
  npm run seed
  ```

- [ ] **Step 5: Test Development Server**
  ```bash
  npm run dev
  ```
  - Visit http://localhost:3000
  - Log into admin at http://localhost:3000/admin
  - Password: `dev123` (or whatever you set in `.env.local`)

- [ ] **Step 6: Test Admin Functions**
  - Add/edit/delete test events
  - Add/edit/delete test resources
  - Verify changes appear on homepage

## ✅ Production Setup

- [ ] **Step 1: Create Production Database in MongoDB Atlas**
  - In the same cluster, create another database
  - Name it: `etc-website` (NO `-dev` suffix)
  - Keep it separate from your dev database

- [ ] **Step 2: Set Up Production Environment Variables**
  
  **If deploying to Vercel:**
  1. Go to your project in Vercel Dashboard
  2. Navigate to Settings → Environment Variables
  3. Add:
     ```
     MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/etc-website?retryWrites=true&w=majority
     ADMIN_PASSWORD = [STRONG-SECURE-PASSWORD-HERE]
     NODE_ENV = production
     ```
  4. ⚠️ Notice: Different database name (`etc-website` not `etc-website-dev`)
  5. ⚠️ Use a strong, unique admin password!

  **If deploying elsewhere:**
  - Set environment variables through your hosting provider's dashboard
  - Same variables as above

- [ ] **Step 3: Seed Production Database (Optional)**
  - You can manually add initial data through the admin panel
  - Or run the seed script once in production (be careful!)

- [ ] **Step 4: Deploy and Test**
  ```bash
  vercel --prod  # or your deployment command
  ```
  - Visit your production URL
  - Test the site functionality
  - Test admin login with production password

- [ ] **Step 5: Verify Separation**
  - Check that local changes (dev) don't appear in production
  - Verify production has its own data
  - Confirm two separate databases in MongoDB Atlas

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] `.env` is in `.gitignore` and not committed (if it exists)
- [ ] Production admin password is strong and unique
- [ ] Production admin password is different from development
- [ ] MongoDB Atlas Network Access is configured properly
- [ ] Production connection string is not in any committed files

## 📊 Verification

### How to Check Your Current Database

Add this to any API route temporarily to see which database you're connected to:

```typescript
console.log('Connected to database:', process.env.MONGODB_URI?.split('/').pop()?.split('?')[0]);
```

**Expected output:**
- **Development** (local): `etc-website-dev`
- **Production** (deployed): `etc-website`

### MongoDB Atlas Quick Check

1. Log into MongoDB Atlas
2. Click "Browse Collections"
3. You should see **TWO** databases:
   - `etc-website-dev` (with your test data)
   - `etc-website` (with your production data)

## ❓ Common Questions

### Q: Can I use the same MongoDB cluster?
**A: Yes!** You can have multiple databases in the same cluster. Just use different database names in the connection string.

### Q: What if I accidentally used the same database for both?
**A: No problem!** Just:
1. Create a new database with `-dev` suffix
2. Update your `.env.local` to point to it
3. Run `npm run seed` to populate it
4. You now have separate environments!

### Q: Can I switch between environments locally?
**A: Yes!** 
- `.env.local` = development (default for `npm run dev`)
- `.env.production.local` = test production setup locally
- Environment vars in hosting = actual production

### Q: How do I backup my data?
**A: MongoDB Atlas has automatic backups.** You can also:
- Use MongoDB Compass to export collections
- Use `mongodump` command-line tool
- Set up Atlas automated backups (paid feature)

## 🎉 You're All Set!

Once all checkboxes are complete, you have:
- ✅ Separate development and production databases
- ✅ Safe environment to test changes
- ✅ No risk of polluting production data
- ✅ Secure credential management

---

**Need more help?** See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed explanations.

