# API Documentation

Complete reference for all API endpoints in the NH Emerging Technologies Caucus website.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://emergingtechnh.org/api`

## Authentication

Admin endpoints require authentication via JWT token stored in cookies.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "password": "your-admin-password"
}
```

**Response:**
```json
{
  "success": true
}
```

Sets `admin-token` cookie for subsequent requests.

### Verify Authentication

```http
GET /api/auth/verify
```

**Response:**
```json
{
  "authenticated": true,
  "role": "admin"
}
```

## Events API

### Get All Events

```http
GET /api/events?limit=5&admin=false
```

**Query Parameters:**
- `limit` (optional): Number of events to return
- `admin` (optional): Set to `true` to get all events including hidden ones (requires auth)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "date": "2025-03-15T12:00:00.000Z",
      "time": "10:00 AM ET",
      "presenter": "Dr. Jane Smith",
      "presenterUrl": "https://example.com/jane",
      "topic": "The Future of AI in Healthcare",
      "location": "Online/Teams",
      "locationUrl": "https://teams.microsoft.com/...",
      "presentations": [
        {
          "filename": "ai-healthcare.pdf",
          "contentType": "application/pdf",
          "size": 1024000,
          "uploadedAt": "2025-03-01T10:00:00.000Z"
        }
      ],
      "isVisible": true,
      "content": "# Event Details\n\nMarkdown content here...",
      "createdAt": "2025-03-01T10:00:00.000Z",
      "updatedAt": "2025-03-01T10:00:00.000Z"
    }
  ],
  "total": 15
}
```

**Cache:** 5 minutes (public requests)

### Get Single Event

```http
GET /api/events/[id]?admin=false
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2025-03-15T12:00:00.000Z",
    "time": "10:00 AM ET",
    "topic": "The Future of AI",
    ...
  }
}
```

### Create Event (Admin Only)

```http
POST /api/events
Content-Type: multipart/form-data

date: 2025-03-15
time: 10:00 AM
timezone: ET
presenter: Dr. Jane Smith
presenterUrl: https://example.com/jane
topic: The Future of AI
location: Online/Teams
locationUrl: https://teams.microsoft.com/...
isVisible: true
content: # Markdown content
presentations: [file1.pdf, file2.pdf]
```

**Response:**
```json
{
  "success": true,
  "data": { /* created event */ }
}
```

### Update Event (Admin Only)

```http
PUT /api/events/[id]
Content-Type: multipart/form-data

[Same fields as create]
keepPresentations: [filename1.pdf, filename2.pdf]
```

### Delete Event (Admin Only)

```http
DELETE /api/events/[id]
```

**Response:**
```json
{
  "success": true,
  "data": { /* deleted event */ }
}
```

### Download Presentation

```http
GET /api/events/[id]/presentation
```

Downloads the first presentation file for the event.

### Download Specific Presentation

```http
GET /api/events/[id]/presentations/[index]
```

Downloads presentation at specified index (0-based).

## Resources API

### Get All Resources

```http
GET /api/resources?featured=true&limit=10&admin=false
```

**Query Parameters:**
- `featured` (optional): Filter for featured resources only
- `limit` (optional): Number of resources to return
- `admin` (optional): Include hidden resources (requires auth)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "AI Ethics Guidelines",
      "url": "https://example.com/ai-ethics",
      "description": "Comprehensive guidelines for ethical AI development",
      "thumbnail": "https://example.com/thumb.jpg",
      "featured": true,
      "order": 1,
      "isVisible": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 25
}
```

**Cache:** 5 minutes (public requests)

### Get Single Resource

```http
GET /api/resources/[id]
```

### Create Resource (Admin Only)

```http
POST /api/resources
Content-Type: application/json

{
  "title": "Resource Title",
  "url": "https://example.com",
  "description": "Resource description",
  "thumbnail": "https://example.com/thumb.jpg",
  "featured": false,
  "order": 0,
  "isVisible": true
}
```

### Update Resource (Admin Only)

```http
PUT /api/resources/[id]
Content-Type: application/json

{
  "title": "Updated Title",
  "order": 5
}
```

### Delete Resource (Admin Only)

```http
DELETE /api/resources/[id]
```

## Tech List API

### Get All Tech Items

```http
GET /api/tech-list?admin=false
```

**Query Parameters:**
- `admin` (optional): Include hidden items and sort alphabetically (requires auth)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Artificial Intelligence",
      "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
      "isVisible": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Cache:** 10 minutes (public requests)

### Get Single Tech Item

```http
GET /api/tech-list/[id]
```

### Create Tech Item (Admin Only)

```http
POST /api/tech-list
Content-Type: application/json

{
  "name": "Quantum Computing",
  "url": "https://example.com",
  "isVisible": true
}
```

### Update Tech Item (Admin Only)

```http
PUT /api/tech-list/[id]
Content-Type: application/json

{
  "name": "Updated Name",
  "isVisible": false
}
```

### Delete Tech Item (Admin Only)

```http
DELETE /api/tech-list/[id]
```

## File Uploads API

### Upload File (Admin Only)

```http
POST /api/upload
Content-Type: multipart/form-data

file: [binary file data]
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/filename.pdf"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Public endpoints are cached to reduce load:
- Events: 5 minute cache
- Resources: 5 minute cache  
- Tech List: 10 minute cache

Admin endpoints have no caching for real-time updates.

## Examples

### Fetch Latest Events (JavaScript)

```javascript
const response = await fetch('/api/events?limit=5');
const { success, data, total } = await response.json();

if (success) {
  console.log(`Showing ${data.length} of ${total} events`);
  data.forEach(event => {
    console.log(`${event.topic} - ${event.date}`);
  });
}
```

### Create Event with Presentation (Admin)

```javascript
const formData = new FormData();
formData.append('date', '2025-03-15');
formData.append('time', '10:00 AM');
formData.append('timezone', 'ET');
formData.append('topic', 'Future of AI');
formData.append('location', 'Online');
formData.append('isVisible', 'true');
formData.append('presentations', pdfFile);

const response = await fetch('/api/events', {
  method: 'POST',
  body: formData
});

const { success, data } = await response.json();
```

### Update Resource Order (Admin)

```javascript
const response = await fetch(`/api/resources/${resourceId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order: 3 })
});
```

## TypeScript Types

TypeScript types are available in `lib/types/api.ts`:

```typescript
import type { 
  Event, 
  Resource, 
  TechItem,
  ApiResponse 
} from '@/lib/types/api';
```

## Security

- All admin endpoints require authentication
- JWT tokens expire after 24 hours
- Passwords are hashed with bcrypt
- Security headers are set on all responses
- CORS is configured for same-origin only
