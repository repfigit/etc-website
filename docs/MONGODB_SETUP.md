# MongoDB Atlas Setup Guide

## 🌐 Setting Up MongoDB Cloud Connection

Since the `.env` file is gitignored for security (which is correct!), you'll need to create it manually.

### Step 1: Create Your MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** to create a free account
3. Sign up with your email or Google account

### Step 2: Create a Free Cluster

1. After logging in, click **"Create a Cluster"**
2. Select **"M0 Free"** tier (perfect for development)
3. Choose a cloud provider and region (closest to you)
4. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 3: Create a Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set a username (e.g., `etcwebsite`)
5. Set a strong password (save it!)
6. User Privileges: Select **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Allow Network Access

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, use specific IP addresses
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as driver and **"5.5 or later"** as version
5. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Create Your .env File

Create a file named `.env` in your project root with the following content:

```bash
# .env file
MONGODB_URI=mongodb+srv://etcwebsite:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/etc_caucus?retryWrites=true&w=majority
```

**Important:**
- Replace `YOUR_PASSWORD_HERE` with your actual database user password
- Replace `cluster0.xxxxx` with your actual cluster address
- Add `/etc_caucus` before the `?` to specify the database name

### Example

If your credentials are:
- Username: `etcwebsite`
- Password: `MySecurePass123`
- Cluster: `cluster0.abc123.mongodb.net`

Your `.env` file should be:
```bash
MONGODB_URI=mongodb+srv://etcwebsite:MySecurePass123@cluster0.abc123.mongodb.net/etc_caucus?retryWrites=true&w=majority
```

### Step 7: Create the .env File

**Windows (PowerShell):**
```powershell
# Navigate to your project directory
cd c:\Users\keith\code\etc-website

# Create the .env file
@"
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/etc_caucus?retryWrites=true&w=majority
"@ | Out-File -FilePath .env -Encoding utf8
```

**Or manually:**
1. Open Notepad or your code editor
2. Create a new file named `.env` (no extension)
3. Add the connection string
4. Save it in the project root: `c:\Users\keith\code\etc-website\.env`

### Step 8: Verify and Test

```bash
# Seed the database (this will test your connection)
npm run seed

# You should see:
# Connected to MongoDB
# Cleared existing data
# Seeded 25 tech items
# Seeded 10 events
# Database seeding completed successfully!
```

---

## 🔒 Security Notes

✅ **Good:** `.env` is in `.gitignore` (won't be committed to git)  
✅ **Good:** Never share your `.env` file publicly  
✅ **Good:** Use different credentials for development vs production  
⚠️ **Warning:** For production, restrict IP addresses (not 0.0.0.0/0)  

---

## 🆘 Troubleshooting

### "Authentication failed"
- Double-check your username and password
- Make sure you're using the **database user** password (not your Atlas account password)

### "Connection timeout"
- Check Network Access settings in Atlas
- Make sure 0.0.0.0/0 is allowed (or your specific IP)

### "MongoServerError: bad auth"
- Verify the username in the connection string matches the database user
- Check for special characters in password (may need URL encoding)

### Special Characters in Password
If your password has special characters like `@`, `#`, `%`, encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`

Example: Password `My@Pass#123` becomes `My%40Pass%23123`

---

## 📋 Quick Command Reference

```bash
# Test connection by seeding database
npm run seed

# Run development server
npm run dev

# Check if .env exists (Windows PowerShell)
Test-Path .env

# View .env content (be careful, contains sensitive data!)
Get-Content .env
```

---

## ✅ Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0 for dev)
- [ ] Connection string copied
- [ ] `.env` file created in project root
- [ ] Connection string updated with actual credentials
- [ ] Database seeded successfully (`npm run seed`)
- [ ] Application runs (`npm run dev`)

---

## 🎯 Next Steps

Once your `.env` file is set up and the database is seeded:

1. Run the development server: `npm run dev`
2. Visit http://localhost:3000
3. Verify events and tech items load
4. You're ready to develop!

---

**Need help?** Check the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/getting-started/) or reach out to your team.

