# Quick Start Guide

## 🎉 Your Next.js Migration is Complete!

Your project has been successfully migrated to a modern Next.js application with MongoDB backend.

## 🚀 Getting Started (3 Simple Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB (Quick Start)**
```bash
# Install MongoDB from https://www.mongodb.com/try/download/community
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud, Free)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Create a `.env.local` file with:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etc_caucus
   ```

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

# Add your MONGODB_URI in Vercel dashboard
```

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
- Check MongoDB is running: `mongosh` (local) or test Atlas connection
- Verify `.env.local` has correct `MONGODB_URI`

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

