# New Hampshire Emerging Technologies Caucus Website

A Next.js-based website for the New Hampshire Emerging Technologies Caucus with MongoDB integration for dynamic content management.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Custom CSS (migrated from original design)
- **Deployment Ready**: Vercel, Netlify, or any Node.js hosting

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- npm or yarn package manager

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/etc_caucus
   ```

   Or for MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/etc_caucus?retryWrites=true&w=majority
   ```

3. **Seed the Database**
   
   Run the database seeding script to populate initial data:
   ```bash
   npm run seed
   ```

   This will:
   - Import all tech items from `data/tech_list.txt`
   - Add all events from the original website
   - Set up the database schema

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
etc-website/
├── app/
│   ├── api/                    # API routes
│   │   ├── events/            # Events CRUD endpoints
│   │   └── tech-list/         # Tech items CRUD endpoints
│   ├── components/            # React components
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── Marquee.tsx
│   │   ├── MissionSection.tsx
│   │   ├── InitiativesSection.tsx
│   │   ├── EventsSection.tsx
│   │   ├── ResourcesSection.tsx
│   │   ├── ContactSection.tsx
│   │   └── Footer.tsx
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/
│   ├── mongodb.ts             # MongoDB connection
│   └── models/                # Mongoose models
│       ├── Event.ts
│       └── TechItem.ts
├── public/
│   └── img/                   # Static images and assets
├── scripts/
│   └── seed-database.ts       # Database seeding script
├── data/
│   └── tech_list.txt          # Original tech list data
├── .env.local.example         # Environment variables template
├── next.config.js             # Next.js configuration
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

### Events Collection
```typescript
{
  date: Date,
  time: String,
  presenter?: String,
  presenterUrl?: String,
  topic: String,
  location: String,
  locationUrl?: String,
  order: Number,
  isVisible: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### TechItems Collection
```typescript
{
  name: String,
  url: String,
  order: Number,
  isVisible: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Events
- `GET /api/events` - Retrieve all visible events (sorted by date)
- `POST /api/events` - Create a new event

### Tech List
- `GET /api/tech-list` - Retrieve all visible tech items
- `POST /api/tech-list` - Create a new tech item

## 🎨 Features

- **Responsive Design**: Mobile-friendly layout
- **Dynamic Content**: Events and tech items loaded from MongoDB
- **Animated Marquee**: Scrolling tech topics with retro styling
- **SEO Optimized**: Meta tags for social media sharing
- **Accessibility**: Semantic HTML and proper alt tags

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project in Vercel
3. Add `MONGODB_URI` environment variable in Vercel settings
4. Deploy!

### MongoDB Atlas Setup
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your IP address (or 0.0.0.0/0 for development)
3. Create a database user
4. Get your connection string and add it to `.env.local`

## 🔧 Development Notes

### Adding New Events
You can add events via the API or directly in MongoDB:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-01",
    "time": "10:00 AM ET",
    "presenter": "John Doe",
    "topic": "Future of AI",
    "location": "Online/Teams",
    "isVisible": true
  }'
```

### Adding New Tech Items
```bash
curl -X POST http://localhost:3000/api/tech-list \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quantum Computing",
    "url": "https://example.com",
    "isVisible": true
  }'
```

## 📝 Migration Notes

This project has been migrated from a static HTML website to a Next.js application with MongoDB backend. Key changes:

- ✅ Static HTML → React components
- ✅ CSS → Preserved with Next.js globals
- ✅ Static data → MongoDB dynamic data
- ✅ Client-side JavaScript → React hooks
- ✅ Single page → Next.js App Router architecture

## 🤝 Contributing

1. Create a feature branch from `nextjs-mongodb-migration`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

© 2025 New Hampshire Emerging Technologies Caucus. All rights reserved.

## 🆘 Support

For questions or issues, contact: info@emergingtechnh.org

