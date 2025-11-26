# New Hampshire Emerging Technologies Caucus

A modern Next.js website for the NH Emerging Technologies Caucus with MongoDB backend for dynamic content management.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and credentials

# 3. Seed the database (first time only)
npm run seed

# 4. Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📋 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Custom CSS with retro terminal aesthetic
- **Authentication**: JWT-based admin authentication
- **Drag & Drop**: @dnd-kit for reorderable lists
- **Markdown**: react-markdown with GitHub-flavored markdown support

## 🎯 Features

- **Public Website**: Events, resources, and tech topics showcase
- **Admin Panel**: Manage events, resources, tech list, and contact submissions
- **Dynamic Content**: All content stored in MongoDB
- **Drag & Drop**: Reorder resources with drag-and-drop interface
- **Image Carousel**: Event pages support multiple images with carousel display
- **File Uploads**: PDF presentations and image uploads stored in MongoDB
- **iCalendar Export**: Download events as .ics files for calendar integration
- **Contact Form**: Public contact form with admin management
- **Responsive Design**: Mobile-friendly layout
- **SEO Optimized**: Meta tags, Open Graph, and Twitter Card support

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[API Documentation](docs/API.md)** - API endpoints and usage
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to production
- **[Improvements Log](docs/IMPROVEMENTS.md)** - Recent enhancements

## 🔧 Project Structure

```
etc-website/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── events/        # Events CRUD + images + iCal
│   │   ├── resources/     # Resources CRUD + thumbnails
│   │   ├── tech-list/     # Tech list management
│   │   └── contact/       # Contact form submissions
│   ├── admin/             # Admin dashboard pages
│   ├── events/            # Event listing and detail pages
│   ├── resources/         # Resources page
│   ├── components/        # React components
│   └── page.tsx           # Home page
├── lib/                    # Utilities and models
│   ├── models/            # Mongoose models
│   ├── auth.ts            # Authentication
│   ├── logger.ts          # Logging utility
│   └── mongodb.ts         # Database connection
├── docs/                   # Documentation
├── public/                 # Static assets
└── scripts/                # Utility scripts
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run seed         # Seed database with initial data
npm run lint         # Run ESLint
npm run copy-to-prod # Copy data to production database
```

## 🔐 Admin Access

Access the admin panel at `/admin` with the password configured in your `.env` file:

```
ADMIN_PASSWORD=your-secure-password
```

## 📝 License

© 2025 New Hampshire Emerging Technologies Caucus. All rights reserved.

## 🆘 Support

For questions or issues:
- Email: info@emergingtechnh.org
- Website: https://emergingtechnh.org

---

**Need more details?** Check out the [full documentation](docs/) for comprehensive guides.
