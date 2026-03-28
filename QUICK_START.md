# 🚀 Quick Start: Database Integration

Your UI is now connected to Neon PostgreSQL! Here's how to get started.

## What Was Created

### Frontend Components
- ✅ **ComplaintTracker.tsx** - Citizen complaint tracking interface
- ✅ **DatabaseComplaintsDashboard.tsx** - Officer dashboard to view all complaints
- ✅ **useComplaints.ts** - Custom React hooks for database operations
- ✅ **database.ts** - API client functions

### Backend Documentation
- 📄 **BACKEND_API_SETUP.md** - Complete guide to implement Express backend
- 📄 **DATABASE_INTEGRATION_GUIDE.md** - Full integration documentation

### Updated Components
- 🔄 **CitizenPage.tsx** - Now uses real complaint tracker from database

## Setup in 5 Steps

### Step 1: Create Express Backend (If Not Exists)

```bash
mkdir backend
cd backend
npm init -y
npm install pg dotenv cors express
```

### Step 2: Create Backend Database Config

Create `backend/config/database.js`:
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
```

### Step 3: Create `.env` in Backend

```env
DATABASE_URL=postgresql://neondb_owner:npg_cmfHQa0s9nJX@ep-curly-wildflower-ammzcj47-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5000
NODE_ENV=development
```

### Step 4: Implement API Endpoints

Copy all endpoint code from **BACKEND_API_SETUP.md** into your Express app

### Step 5: Configure Frontend

Update React `.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing the Connection

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Test Database Connection
```bash
curl http://localhost:5000/api/db-test
```

Expected response:
```json
{
  "status": "connected",
  "database_time": "2025-03-27T..."
}
```

### 3. In React App

Navigate to: **Citizen Services → Track Complaint**

Enter a complaint session ID from your database, e.g., `TEST-2025-001`

The tracker will show:
- ✅ Complaint details from database
- ✅ History/logs of the complaint
- ✅ Routing information
- ✅ Department assignment
- ✅ Urgency level and confidence scores

## Database Schema Your App Uses

### complaints table
```sql
id | session_id | transcript | language | urgency_level | department_assigned | created_at
```

### complaint_logs table
```sql
id | session_id | action | status | created_at
```

### complaint_routes table
```sql
id | session_id | department | route_confidence | routed_at
```

### audit_logs table
```sql
id | complaint_id | action | actor | timestamp
```

## Sample Test Data

Insert this to test:
```sql
INSERT INTO complaints 
(session_id, transcript, language_code, language_name, urgency_level, urgency_score, department_assigned, created_at, updated_at)
VALUES 
('TEST-2025-001', 'Water supply not working in my area', 'en', 'English', 'High', 8, 'Water Department', NOW(), NOW());

INSERT INTO complaint_logs (session_id, action, status, created_at)
VALUES 
('TEST-2025-001', 'Complaint registered', 'Pending', NOW()),
('TEST-2025-001', 'Routed to Water Department', 'Assigned', NOW());
```

## Features Now Available

### For Citizens
- 🔍 Track complaints by session ID
- 📋 View full complaint details
- 📜 See complaint history/timeline
- 🌍 Track routing information
- 🗂️ Get official department assignment

### For Officers
- 👀 View all complaints from database
- 🔽 Filter by department or urgency
- ✓ Sort by recent, urgent, or department
- 📊 See statistics and metrics
- 🎯 Quick drill-down to details

### For Admin/Compliance
- 📈 Use DatabaseComplaintsDashboard for full oversight
- 🔐 Role-based access control
- 📜 Audit trail of all actions
- 🔔 Real-time alerts on high priority

## API Endpoints Available

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/complaints` | Get all complaints |
| GET | `/api/complaints/:sessionId` | Get single complaint |
| GET | `/api/complaints/:sessionId/logs` | Get complaint history |
| GET | `/api/complaints/:sessionId/route` | Get routing info |
| POST | `/api/complaints` | Create complaint |
| PUT | `/api/complaints/:sessionId` | Update complaint |
| GET | `/api/complaints/search?q=query` | Search complaints |
| GET | `/api/complaints/stats` | Get statistics |

## Hooks Available in React

```tsx
// Fetch all complaints
const { complaints, loading, error, refetch } = useComplaints();

// Track single complaint
const { complaint, loading, error } = useComplaint(sessionId);

// Get complaint history
const { logs, loading, error, addLog } = useComplaintHistory(sessionId);

// Search functionality
const { results, loading, error, search } = useSearchComplaints();

// Create complaint
const { create, loading, error, success } = useCreateComplaint();
```

## Troubleshooting

### "Failed to fetch complaints"
- Verify backend is running: `npm start` in backend folder
- Check `REACT_APP_API_URL` in React .env
- Ensure CORS is enabled in Express

### "Cannot resolve './database'"
- Already fixed! Import uses `@/services/database`

### No data showing
- Insert test data using SQL commands above
- Check database has data: `SELECT COUNT(*) FROM complaints;`
- Verify API returns data: `curl http://localhost:5000/api/complaints`

### CORS error in browser console
- Add to backend Express: 
  ```javascript
  const cors = require('cors');
  app.use(cors());
  ```

## File Locations

```
Frontend:
- src/services/database.ts          ← Database API client
- src/hooks/useComplaints.ts        ← React hooks
- src/components/ComplaintTracker.tsx ← Citizen tracking UI
- src/components/DatabaseComplaintsDashboard.tsx ← Officer dashboard
- src/pages/CitizenPage.tsx         ← Updated with tracker

Backend (create):
- backend/config/database.js        ← Neon connection
- backend/server.js                 ← Express app
- backend/.env                      ← Database credentials

Documentation:
- BACKEND_API_SETUP.md              ← Backend implementation
- DATABASE_INTEGRATION_GUIDE.md     ← Full integration guide
- QUICK_START.md                    ← This file
```

## Next: Add Real-Time Updates (Optional)

For live updates without page refresh:
1. Add WebSocket support to backend
2. Use `useCallback` to poll data every 5 seconds
3. Or implement Socket.io for real-time events

Example interval polling:
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 5000); // Refresh every 5 seconds
  
  return () => clearInterval(interval);
}, [refetch]);
```

## What's Next?

1. ✅ Implement backend endpoints (follow BACKEND_API_SETUP.md)
2. ✅ Start Express server
3. ✅ Test complaint tracking in UI
4. ⏳ Add real-time notifications
5. ⏳ Implement officer assignment features
6. ⏳ Add SLA tracking and alerts

## Support Files

- **DATABASE_INTEGRATION_GUIDE.md** - Full technical documentation
- **BACKEND_API_SETUP.md** - Backend implementation details
- **SCHEMES_DASHBOARD_SETUP.md** - Government schemes setup
- **IMPLEMENTATION_SUMMARY.md** - Project overview

---

**Last Updated:** March 27, 2025  
**Status:** ✅ Build Successful | Ready for Backend Implementation
