# Admin Panel Guide

## 🔐 Overview

The admin panel allows you to manage events and technology items through a web interface without needing to directly edit the database or code.

---

## 🚀 Quick Start

### 1. Access the Admin Panel

Visit: **http://localhost:3000/admin**

**Default Password:** `admin123`

⚠️ **Important:** Change this password before deploying to production!

### 2. Change the Admin Password

Edit your `.env` file:
```bash
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
```

Then restart the development server.

---

## 📋 Features

### Homepage Events Section
- Shows **top 5 most recent events**
- Displays "View all X events" link if more than 5 exist
- Links to `/events` page

### All Events Page
Visit **http://localhost:3000/events** to see:
- Complete list of all events
- Same styling as homepage
- Back to home link

### Admin Dashboard
Access at **http://localhost:3000/admin/dashboard**

Two main sections:
1. **Manage Events** - Add, edit, delete events
2. **Manage Tech List** - Add, edit, delete technology items

---

## 📅 Managing Events

### Access Events Manager
http://localhost:3000/admin/events

### Create New Event

1. Click **"+ Add New Event"**
2. Fill in the form:
   - **Date*** (required) - Event date
   - **Time*** (required) - e.g., "10:00 AM ET"
   - **Topic*** (required) - Event description
   - **Presenter** (optional) - Speaker name
   - **Presenter URL** (optional) - Link to speaker profile
   - **Location*** (required) - Event location
   - **Location URL** (optional) - Link to location/map
   - **Order** - Display order (lower numbers first)
   - **Visible** - Toggle to show/hide event
3. Click **"Create Event"**

### Edit Event

1. Find the event in the list
2. Click **"Edit"** button
3. Modify the fields
4. Click **"Update Event"**

### Delete Event

1. Find the event in the list
2. Click **"Delete"** button
3. Confirm deletion

### Tips
- Events are sorted by date (most recent first)
- Use **Order** field to control display sequence
- Uncheck **Visible** to hide events without deleting them
- Past events remain in database for historical purposes

---

## 🔬 Managing Tech List

### Access Tech List Manager
http://localhost:3000/admin/tech-list

### Create New Tech Item

1. Click **"+ Add New Tech Item"**
2. Fill in the form:
   - **Name*** (required) - Technology name
   - **URL*** (required) - Reference link (Wikipedia, etc.)
   - **Order** - Display order in marquee
   - **Visible** - Toggle to show/hide item
3. Click **"Create Tech Item"**

### Edit Tech Item

1. Find the item in the grid
2. Click **"Edit"** button
3. Modify the fields
4. Click **"Update Tech Item"**

### Delete Tech Item

1. Find the item in the grid
2. Click **"Delete"** button
3. Confirm deletion

### Tips
- Tech items appear in the scrolling marquee on the homepage
- Items are shuffled randomly each time the page loads
- Hidden items (Visible = false) won't show in marquee
- Use meaningful names and valid URLs

---

## 🔒 Security Notes

### Current Implementation
- Simple password-based authentication
- Password stored in `.env` file
- Session stored in browser's sessionStorage
- No encryption (suitable for development only)

### For Production Use

**Option 1: Change the Password**
```bash
# In .env file
NEXT_PUBLIC_ADMIN_PASSWORD=VerySecurePassword2024!
```

**Option 2: Implement Proper Auth**
Consider adding:
- NextAuth.js for OAuth/JWT authentication
- Database-backed user accounts
- Role-based access control
- API key authentication
- IP whitelist restrictions

**Option 3: Remove Public Access**
- Don't deploy admin pages to production
- Use MongoDB Atlas dashboard for management
- Create a separate admin deployment

### Recommendations
1. **Change default password immediately**
2. **Don't commit `.env` to git** (already in `.gitignore`)
3. **Use strong passwords**
4. **Consider IP restrictions** in production
5. **Log admin actions** for audit trail
6. **Implement rate limiting** on admin routes

---

## 📡 API Endpoints

All endpoints accept/return JSON.

### Events

**GET /api/events**
- Query params: `?limit=5` (optional)
- Returns: List of visible events + total count

**POST /api/events**
- Body: Event object
- Returns: Created event

**PUT /api/events/[id]**
- Body: Updated event object
- Returns: Updated event

**DELETE /api/events/[id]**
- Returns: Deleted event

### Tech Items

**GET /api/tech-list**
- Returns: List of visible tech items

**POST /api/tech-list**
- Body: Tech item object
- Returns: Created tech item

**PUT /api/tech-list/[id]**
- Body: Updated tech item object
- Returns: Updated tech item

**DELETE /api/tech-list/[id]**
- Returns: Deleted tech item

### Example API Usage

**Create Event:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-25",
    "time": "2:00 PM ET",
    "presenter": "John Doe",
    "presenterUrl": "https://example.com/john",
    "topic": "Future of AI",
    "location": "Online/Teams",
    "order": 0,
    "isVisible": true
  }'
```

**Update Event:**
```bash
curl -X PUT http://localhost:3000/api/events/[event_id] \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Updated topic"
  }'
```

**Delete Event:**
```bash
curl -X DELETE http://localhost:3000/api/events/[event_id]
```

---

## 🎨 UI Features

### Visual Indicators
- **Green border** - Normal items
- **Gray background** - Hidden items
- **⚠️ Hidden** label - Visible = false
- **Yellow "Edit" button**
- **Red "Delete" button**

### Responsive Design
- Works on desktop and mobile
- Grid layout for tech items
- List layout for events
- Touch-friendly buttons

---

## 🐛 Troubleshooting

### Can't Login
- Check password in `.env` file
- Restart dev server after changing `.env`
- Clear browser cache/sessionStorage
- Try incognito/private window

### Changes Not Showing
- Hard refresh browser (Ctrl+Shift+R)
- Check if item is marked **Visible = true**
- Check browser console for errors

### Database Errors
- Verify MongoDB connection in `.env`
- Check if MongoDB service is running
- Review terminal/console for error messages

### "Unauthorized" or Redirect to Login
- SessionStorage may have been cleared
- Re-login to admin panel
- Check browser console for auth errors

---

## 🚀 Deployment Considerations

### Before Deploying

1. **Change admin password:**
   ```bash
   NEXT_PUBLIC_ADMIN_PASSWORD=production_secure_password
   ```

2. **Consider removing admin routes:**
   - Delete `app/admin/` directory
   - Or add middleware to restrict access

3. **Set up proper authentication:**
   - Implement NextAuth.js
   - Use environment-specific passwords
   - Add IP whitelisting

4. **Add monitoring:**
   - Log admin actions
   - Set up alerts for admin access
   - Track API usage

### Environment Variables

Make sure these are set in your deployment platform (Vercel, Netlify, etc.):

```bash
MONGODB_URI=your_production_mongodb_uri
NEXT_PUBLIC_ADMIN_PASSWORD=your_production_password
```

---

## 📊 Database Schema

### Events Collection
```typescript
{
  _id: ObjectId,
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
  _id: ObjectId,
  name: String,
  url: String,
  order: Number,
  isVisible: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Best Practices

### Content Management
1. Use meaningful event topics
2. Include presenter details when available
3. Provide location links for physical venues
4. Keep tech item names concise
5. Use canonical URLs (Wikipedia preferred)

### Ordering
- Lower order numbers appear first
- Use increments of 10 (10, 20, 30...) for flexibility
- Reserve 0 for highest priority items

### Visibility
- Hide outdated content instead of deleting
- Test hidden items before making visible
- Use visibility to stage content

---

## 📚 Quick Reference

| Task | URL | Action |
|------|-----|--------|
| Login | `/admin` | Enter password |
| Dashboard | `/admin/dashboard` | Navigate admin |
| Manage Events | `/admin/events` | CRUD events |
| Manage Tech | `/admin/tech-list` | CRUD tech items |
| View All Events | `/events` | Public events page |
| Homepage | `/` | Main website |

---

## 🆘 Need Help?

- Review the [README.md](./README.md) for general setup
- Check [QUICKSTART.md](./QUICKSTART.md) for getting started
- Review [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for architecture details
- Inspect browser console (F12) for errors
- Check terminal output for API errors

---

**Admin panel created!** Manage your content with ease. 🎉

Remember to secure the admin panel before deploying to production!

