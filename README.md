# Omli Dashboard

Internal dashboard for managing the Omli platform - the brain of all user and conversation data.

## Features

### D0 Launch Requirements ✅

- **Internal Team Login**: Username/password authentication (SSO migration planned)
- **Parent & Child Management**: View parent accounts and their associated children
- **Analytics Dashboard**: 
  - Average conversation time per child per day
  - Hourly conversation duration patterns
  - Usage statistics and engagement metrics
- **Subscription Management**: Renew subscription button to add more usage minutes
- **Content Management**: Create, edit, and manage lessons with engagement tracking

### Architecture

- **Frontend**: React 18 with Vite, Tailwind CSS, and Recharts for analytics
- **Backend**: FastAPI integration with existing companio-web-onrender service
- **Database**: MongoDB (AWS DocumentDB) for user data, S3 for conversation storage
- **Authentication**: JWT-based admin authentication

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.11+ (for backend)
- Access to MongoDB and S3 (configured in backend)

### Frontend Setup

```bash
cd companio-dashboard
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Backend Setup

The dashboard uses the existing `companio-web-onrender` backend. Make sure it's running:

```bash
cd ../companio-web-onrender
pip install -r requirements.txt
python start_web_chat.py
```

### Create First Admin User

```bash
cd companio-web-onrender
python scripts/create_admin.py
```

## API Endpoints

All admin endpoints are prefixed with `/api/admin` and require JWT authentication:

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/parents` - List all parents with subscription info
- `GET /api/admin/parents/{id}/children` - Get children for a parent
- `POST /api/admin/parents/{id}/renew` - Renew parent subscription
- `GET /api/admin/analytics` - Conversation analytics data
- `GET /api/admin/lessons` - List all lessons
- `POST /api/admin/lessons` - Create new lesson
- `PUT /api/admin/lessons/{id}` - Update lesson
- `DELETE /api/admin/lessons/{id}` - Delete lesson

## Database Schema

### New Collections Added

- **admins**: Internal team user accounts
- **subscriptions**: Parent subscription and usage tracking
- **parent_child_relationships**: Links between parent and child accounts
- **lesson_engagements**: Tracks lesson interaction and completion

### Existing Collections Used

- **users**: Parent and child user accounts
- **conversations**: Conversation history and analytics
- **lessons**: Educational content and materials

## Development

### Frontend Structure

```
src/
├── components/          # React components
│   ├── Login.jsx       # Admin authentication
│   ├── Dashboard.jsx   # Main dashboard with stats
│   ├── ParentManagement.jsx  # Parent/child management
│   ├── Analytics.jsx   # Analytics and charts
│   └── ContentManagement.jsx # Lesson management
├── services/
│   └── api.js          # API service layer
└── App.jsx             # Main app with routing
```

### Backend Extensions

```
services/
├── admin_service.py    # Admin authentication
└── dashboard_service.py # Dashboard data aggregation

db/models/
├── admin_model.py      # Admin user model
├── subscription_model.py # Subscription tracking
├── parent_child_relationship_model.py # Parent-child links
└── lesson_engagement_model.py # Lesson analytics

app_server/routes/
└── admin.py           # Admin API endpoints
```

## Security

- JWT-based authentication for admin access
- Password hashing with SHA-256
- CORS configuration for frontend-backend communication
- Input validation on all API endpoints

## Deployment

### Frontend

```bash
npm run build
# Deploy dist/ folder to your web server
```

### Backend

The dashboard backend is integrated with the existing FastAPI service. No separate deployment needed.

## Future Enhancements

- SSO integration for admin authentication
- Real-time dashboard updates with WebSockets
- Advanced analytics and reporting
- User account deletion functionality
- Bulk operations for parent/child management
- Content recommendation engine based on engagement data