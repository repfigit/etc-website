# Quick Start Guide

## 🎉 Your Next.js Migration is Complete!

Your project has been successfully migrated to a modern Next.js application with MongoDB backend.

## 🚀 Getting Started (3 Simple Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up MongoDB

**⚠️ IMPORTANT: Always use separate databases for development and production!**

**Recommended: MongoDB Atlas (Cloud, Free)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. **Create TWO databases:**
   - `etc-website-dev` (for development)
   - `etc-website` (for production)
4. Create a `.env.local` file with your **development** database:
   ```
   # Development database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc-website-dev?retryWrites=true&w=majority
   ADMIN_PASSWORD=dev123
   NODE_ENV=development
   ```

📖 **For detailed setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**

### Step 3: Seed the Database
```bash
npm run seed
```

### Step 4: Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎊

## 📊 What Changed?

### Before (Static HTML)
- Single `index.html` file
- Static content
- Manual updates required
- No database

### After (Next.js + MongoDB)
- ✅ React components (reusable, maintainable)
- ✅ MongoDB database (dynamic content)
- ✅ API endpoints (easy updates)
- ✅ TypeScript (type safety)
- ✅ Server-side rendering
- ✅ Better SEO
- ✅ Production ready

## 🔧 Common Tasks

### Add a New Event
```bash
# Via API
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-15",
    "time": "2:00 PM ET",
    "presenter": "Jane Smith",
    "presenterUrl": "https://example.com",
    "topic": "Future of Quantum Computing",
    "location": "Online/Teams",
    "isVisible": true
  }'
```

### Add a New Technology
```bash
curl -X POST http://localhost:3000/api/tech-list \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quantum Sensors",
    "url": "https://en.wikipedia.org/wiki/Quantum_sensor",
    "isVisible": true
  }'
```

### Build for Production
```bash
npm run build
npm start
```

## 🌐 Deployment

### Deploy to Vercel (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Then in Vercel Dashboard:**
1. Add environment variables:
   - `MONGODB_URI` → Your **production** database (e.g., `etc-website`)
   - `ADMIN_PASSWORD` → Strong production password
   - `NODE_ENV` → `production`
2. ⚠️ Make sure it's different from your local dev database!

📖 See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for complete deployment guide

### Deploy to Netlify, Railway, or DigitalOcean
See detailed instructions in [README.md](./README.md)

## 📁 Project Structure at a Glance

```
your-project/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── components/        # React components
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── lib/                   # Database & utilities
│   ├── mongodb.ts        # DB connection
│   └── models/           # Mongoose schemas
├── public/               # Static assets (images, etc.)
├── scripts/              # Helper scripts
│   └── seed-database.ts # Database seeding
└── data/                 # Original data files
```

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
- Verify `.env.local` exists with correct `MONGODB_URI`
- Check your IP is whitelisted in MongoDB Atlas (Network Access)
- Test connection string in MongoDB Compass or mongosh
- Make sure database name includes `-dev` suffix for development

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB + Next.js Tutorial](https://www.mongodb.com/developer/languages/javascript/nextjs-building-modern-applications/)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)

## ✅ Next Steps

1. [ ] Test the application locally
2. [ ] Review the API endpoints
3. [ ] Add your MongoDB connection string
4. [ ] Run the seed script
5. [ ] Deploy to production
6. [ ] Set up a content management interface (optional)

---

**Need Help?** Check out the full [README.md](./README.md) or reach out to the team!

