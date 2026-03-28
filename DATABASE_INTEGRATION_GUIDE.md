# Database Integration Setup Guide

Complete guide to connecting your Grievance Management UI to Neon PostgreSQL database.

## Overview

Your application now has full database integration with the following features:

- **Real-time Complaint Tracking**: Complaints stored in PostgreSQL database
- **Multi-table Support**: Complaints, logs, routes, audit trails
- **Officer Dashboard**: View all complaints with filtering and sorting
- **Citizen Tracking**: Citizens can track their complaints by session ID
- **API Layer**: Express backend communicates with database

## Database Configuration

### Neon PostgreSQL Connection String

```
postgresql://neondb_owner:npg_cmfHQa0s9nJX@ep-curly-wildflower-ammzcj47-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Tables in Your Database

1. **complaints** - Main complaint records
   - id, session_id, transcript, language_code, urgency_level, department_assigned, etc.

2. **complaint_logs** - Complaint activity history
   - id, session_id, action, status, created_at

3. **complaint_routes** - Routing information
   - id, session_id, department, route_confidence, routing_keywords

4. **audit_logs** - Audit trail
   - id, complaint_id, action, actor, timestamp

5. **conversation_logs** - Conversation history
   - id, complaint_id, speaker, message, timestamp

6. **schemes** - Government schemes data
   - id, scheme_name, scheme_slug, ministry, description, benefits, etc.

## Frontend Implementation

### New Components Created

#### 1. **ComplaintTracker.tsx**
Shows citizen complaint tracking interface. Users can:
- Search complaints by session ID
- View complaint details
- See complaint history and logs
- Track department routing information

**Usage:**
```tsx
import ComplaintTracker from '@/components/ComplaintTracker';

<section>
  <ComplaintTracker />
</section>
```

#### 2. **DatabaseComplaintsDashboard.tsx**
Officer dashboard for managing all complaints. Features:
- View all complaints from database
- Filter by department, urgency level
- Sort by recent, urgent, or department
- Statistics cards
- Real-time data refresh

**Usage:**
```tsx
import DatabaseComplaintsDashboard from '@/components/DatabaseComplaintsDashboard';

<DatabaseComplaintsDashboard supervisorLevel="compliance" />
```

### New Services

#### **services/database.ts**
API client functions for all database operations:
- `getAllComplaints()` - Fetch all complaints
- `getComplaintBySessionId(sessionId)` - Get single complaint
- `getComplaintLogs(sessionId)` - Get complaint history
- `createComplaint(data)` - Create new complaint
- `updateComplaint(sessionId, updates)` - Update complaint
- `searchComplaints(query)` - Search by keywords
- And more...

### Custom Hooks

#### **hooks/useComplaints.ts**
React hooks for complaint management:

```tsx
// Hook to fetch all complaints
const { complaints, loading, error, refetch } = useComplaints();

// Hook to fetch single complaint
const { complaint, loading, error } = useComplaint(sessionId);

// Hook to fetch complaint history
const { logs, loading, error, addLog } = useComplaintHistory(sessionId);

// Hook to route information
const { route, loading, error } = useComplaintRoute(sessionId);

// Hook to search complaints
const { results, loading, error, search } = useSearchComplaints();

// Hook for statistics
const { stats, loading, error } = useComplaintStats();
```

## Backend Setup

See **BACKEND_API_SETUP.md** for detailed backend implementation.

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install pg dotenv cors express
   ```

2. **Create `.env` with Neon connection:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_cmfHQa0s9nJX@ep-curly-wildflower-ammzcj47-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   PORT=5000
   ```

3. **Implement API endpoints** (see BACKEND_API_SETUP.md)

4. **Run the server:**
   ```bash
   npm start
   ```

## Frontend Configuration

Update `.env.local` (or `.env` in React app):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Data Flow

### Creating a Complaint

```
1. Citizen submits form on CitizenPage
2. Form data collected locally
3. API call: POST /api/complaints
4. Backend inserts into complaints table
5. Returns complaint with ID and session_id
6. Citizen gets tracking ID
```

### Tracking a Complaint

```
1. Citizen enters session_id in ComplaintTracker
2. ComplaintTracker calls useComplaint hook
3. Hook calls getComplaintBySessionId()
4. API calls database with session_id
5. Returns complaint details, logs, and route info
6. Components render real-time data
```

### Officer Dashboard

```
1. Officer opens DatabaseComplaintsDashboard
2. useComplaints hook fetches all complaints
3. API returns all records with status
4. Dashboard displays with filters/sorting
5. Officer can click to drill into details
```

## Integration with CitizenPage

The CitizenPage now includes:

```tsx
import ComplaintTracker from '@/components/ComplaintTracker';

<section id="track">
  <ComplaintTracker />
</section>
```

The tracker component handles:
- Searching complaints from database
- Showing real complaint details
- Displaying history and routing information
- Real-time status updates

## Language Support

All components are fully multilingual:
- ComplaintTracker displays in 20+ languages
- Dashboard filters support all languages
- All labels use translation keys

## Testing the Integration

### 1. **Test Backend Connection**

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

### 2. **Fetch Complaints**

```bash
curl http://localhost:5000/api/complaints
```

### 3. **Get Specific Complaint**

```bash
curl http://localhost:5000/api/complaints/TEST-2025-001
```

### 4. **Search Complaints**

```bash
curl "http://localhost:5000/api/complaints/search?q=water"
```

### 5. **In Application**

- Navigate to Citizen Page → Track Complaint section
- Enter a session ID from database (e.g., "TEST-2025-001")
- Should return complaint details from database

## Database Queries

### Find All Complaints

```sql
SELECT id, session_id, transcript, urgency_level, department_assigned
FROM complaints
ORDER BY created_at DESC;
```

### Find High Priority Complaints

```sql
SELECT * FROM complaints
WHERE urgency_level = 'High' OR urgency_level = 'Emergency'
ORDER BY urgency_score DESC;
```

### Get Complaint with Full History

```sql
SELECT 
  c.id, c.session_id, c.transcript, c.urgency_level,
  json_agg(json_build_object(
    'action', cl.action,
    'status', cl.status,
    'created_at', cl.created_at
  )) as logs
FROM complaints c
LEFT JOIN complaint_logs cl ON c.session_id = cl.session_id
WHERE c.session_id = 'TEST-2025-001'
GROUP BY c.id;
```

### Count by Department

```sql
SELECT department_assigned, COUNT(*) as count
FROM complaints
GROUP BY department_assigned
ORDER BY count DESC;
```

## Troubleshooting

### Issue: API returns 500 error

**Solution:**
- Check backend console for SQL errors
- Verify connection string in .env
- Ensure all tables exist in database

### Issue: Frontend shows "loading" forever

**Solution:**
- Check browser console for errors
- Verify `REACT_APP_API_URL` is correct
- Ensure backend is running: `npm start`

### Issue: Complaints don't appear in dashboard

**Solution:**
- Insert test data: `INSERT INTO complaints (session_id, transcript, language_code, language_name, urgency_level, created_at, updated_at) VALUES ('TEST-001', 'Test complaint', 'en', 'English', 'Medium', NOW(), NOW());`
- Check database has data: `SELECT COUNT(*) FROM complaints;`
- Verify API endpoint returns data

### Issue: CORS errors

**Solution:**
- Ensure backend has CORS enabled: `const cors = require('cors'); app.use(cors());`
- Check allowed origins if using restricted CORS policy

## Performance Optimization

For large datasets:

1. **Add Pagination**
   ```tsx
   const [page, setPage] = useState(1);
   const limit = 20;
   // API: GET /api/complaints?page=1&limit=20
   ```

2. **Add Indexing** (already exists for common queries)
   ```sql
   CREATE INDEX idx_complaints_dept ON complaints(department_assigned);
   CREATE INDEX idx_complaints_urgency ON complaints(urgency_level);
   ```

3. **Cache Results**
   ```tsx
   const [cache, setCache] = useState({});
   if (!cache[sessionId]) {
     fetchComplaint(sessionId);
   }
   ```

## Next Steps

1. ✅ Backend API implemented
2. ✅ Frontend components created
3. ✅ Database service layer set up
4. ✅ Hooks for React integration
5. ⏳ **TODO**: Integrate with citizen complaint form
6. ⏳ **TODO**: Add real-time updates with WebSockets
7. ⏳ **TODO**: Implement officer assignment features
8. ⏳ **TODO**: Add SLA tracking and alerts

## Security Considerations

- ✅ Use HTTPS in production
- ✅ Validate all inputs on backend
- ✅ Use parameterized queries (pg library handles this)
- ✅ Implement authentication/authorization
- ✅ Rate limit API endpoints
- ✅ Use environment variables for secrets
- ✅ CORS configured appropriately

## File Structure

```
src/
├── services/
│   └── database.ts           # API client functions
├── hooks/
│   └── useComplaints.ts      # React hooks for complaints
├── components/
│   ├── ComplaintTracker.tsx  # Citizen tracking UI
│   └── DatabaseComplaintsDashboard.tsx  # Officer dashboard
└── pages/
    └── CitizenPage.tsx       # Updated to use ComplaintTracker

backend/
├── config/
│   └── database.js           # Neon connection pool
├── routes/
│   └── complaints.js         # API endpoints
└── server.js                 # Express app
```

## Support

For detailed API endpoint documentation, see: **BACKEND_API_SETUP.md**

For complaint tracking: Use the `ComplaintTracker` component in any page

For officer dashboard: Use the `DatabaseComplaintsDashboard` component

---

Last Updated: March 27, 2025
