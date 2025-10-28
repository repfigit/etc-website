# Documentation

Complete documentation for the NH Emerging Technologies Caucus website.

## 📚 Getting Started

New to the project? Start here:

1. **[Setup Guide](SETUP.md)** - Install and configure the project
2. **[API Documentation](API.md)** - Learn about available endpoints
3. **[Deployment Guide](DEPLOYMENT.md)** - Deploy to production

## 📖 Documentation Index

### Essential Guides

- **[SETUP.md](SETUP.md)** - Complete setup instructions
  - Prerequisites and dependencies
  - Environment configuration
  - Database setup (MongoDB Atlas or local)
  - First-time setup steps
  - Troubleshooting common issues

- **[API.md](API.md)** - API reference and examples
  - Authentication endpoints
  - Events API (CRUD operations)
  - Resources API
  - Tech List API
  - File upload handling
  - TypeScript types
  - Example requests

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment
  - Vercel deployment (recommended)
  - Netlify deployment
  - Self-hosted VPS setup
  - Environment configuration
  - MongoDB production setup
  - Post-deployment checklist
  - Monitoring and backups

### Additional Resources

- **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Recent improvements and optimizations
  - Performance enhancements
  - Security improvements
  - Developer experience updates
  - Bug fixes

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│           Client Browser                 │
│  (React Components, Next.js Pages)      │
└─────────────┬───────────────────────────┘
              │
              │ HTTP/HTTPS
              │
┌─────────────▼───────────────────────────┐
│         Next.js App Router               │
│  (Server-Side Rendering, API Routes)    │
├─────────────────────────────────────────┤
│         Authentication Layer             │
│       (JWT, Cookie-based Auth)           │
├─────────────────────────────────────────┤
│           API Routes                     │
│  /api/events  /api/resources            │
│  /api/tech-list  /api/auth              │
└─────────────┬───────────────────────────┘
              │
              │ Mongoose ODM
              │
┌─────────────▼───────────────────────────┐
│          MongoDB Database                │
│  (Events, Resources, TechItems)         │
└─────────────────────────────────────────┘
```

## 🔑 Key Features

### Public Features
- **Events Showcase** - Display upcoming and past events
- **Resources Library** - Curated technology resources
- **Tech Topics Marquee** - Scrolling list of technologies
- **Responsive Design** - Works on all devices

### Admin Features
- **Event Management** - Create, edit, delete events
- **PDF Uploads** - Attach presentations to events
- **Resource Management** - Add and organize resources
- **Drag & Drop Ordering** - Reorder resources visually
- **Tech List Editor** - Manage technology topics
- **Visibility Controls** - Show/hide content

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT (jose) |
| Styling | Custom CSS |
| Drag & Drop | dnd-kit |
| Markdown | react-markdown |

## 📁 Project Structure

```
etc-website/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/         # Authentication
│   │   ├── events/       # Events CRUD
│   │   ├── resources/    # Resources CRUD
│   │   └── tech-list/    # Tech items CRUD
│   ├── admin/            # Admin dashboard
│   │   ├── dashboard/    # Main dashboard
│   │   ├── events/       # Event management
│   │   ├── resources/    # Resource management
│   │   └── tech-list/    # Tech list management
│   ├── components/       # React components
│   ├── events/           # Public events pages
│   ├── resources/        # Public resources page
│   └── page.tsx          # Homepage
├── lib/                   # Utilities and core logic
│   ├── models/           # Mongoose schemas
│   │   ├── Event.ts
│   │   ├── Resource.ts
│   │   └── TechItem.ts
│   ├── types/            # TypeScript definitions
│   ├── auth.ts           # Authentication helpers
│   ├── cache.ts          # Caching utilities
│   ├── env-validation.ts # Environment validation
│   ├── logger.ts         # Logging utility
│   └── mongodb.ts        # Database connection
├── docs/                  # Documentation (you are here)
├── public/               # Static assets
│   └── img/             # Images
└── scripts/              # Utility scripts
    └── seed-database.ts # Database seeding
```

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Database
npm run seed             # Seed database with data

# Code Quality
npm run lint             # Run ESLint
```

## 🔒 Security

The application includes:
- **JWT Authentication** - Secure admin access
- **Password Hashing** - Bcrypt for passwords
- **Security Headers** - HSTS, XSS protection, etc.
- **Environment Validation** - Ensures proper configuration
- **Error Boundaries** - Graceful error handling

## 📊 Performance

Optimizations include:
- **API Caching** - 5-10 minute cache for public endpoints
- **Static Generation** - Pre-rendered pages where possible
- **Image Optimization** - WebP format for images
- **Code Splitting** - Automatic by Next.js
- **Lazy Loading** - Components load on demand

## 🤝 Contributing

When contributing:
1. Read the [Setup Guide](SETUP.md) first
2. Create feature branches from `main`
3. Test thoroughly before submitting PR
4. Update documentation as needed
5. Follow existing code style

## 📞 Support

Need help?
- **Email**: info@emergingtechnh.org
- **Website**: https://emergingtechnh.org

## 📝 License

© 2025 New Hampshire Emerging Technologies Caucus. All rights reserved.

---

**Last Updated**: January 2025
