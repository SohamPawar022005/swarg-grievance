# Backend API Setup Guide for Neon PostgreSQL

This guide explains how to set up the Express backend to connect your React UI with the Neon PostgreSQL database.

## Database Connection String
```
postgresql://neondb_owner:npg_cmfHQa0s9nJX@ep-curly-wildflower-ammzcj47-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Prerequisites

1. **Node.js** and **Express.js** installed
2. **PostgreSQL client library** (pg or prisma)
3. Environment variables configured

## Installation

### 1. Install Required Dependencies

```bash
npm install pg dotenv cors express
```

### 2. Create `.env` file in backend root

```env
DATABASE_URL=postgresql://neondb_owner:npg_cmfHQa0s9nJX@ep-curly-wildflower-ammzcj47-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5000
NODE_ENV=development
```

### 3. Create Database Connection Pool (`config/database.js`)

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
```

## API Endpoints to Implement

### 1. **Get All Complaints**
**Endpoint:** `GET /api/complaints`

```javascript
app.get('/api/complaints', async (req, res) => {
  try {
    const query = `
      SELECT id, session_id, transcript, language_code, language_name, 
             urgency_level, urgency_score, keywords, department_assigned, 
             department_confidence, created_at, updated_at
      FROM complaints
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 2. **Get Complaint by Session ID**
**Endpoint:** `GET /api/complaints/:sessionId`

```javascript
app.get('/api/complaints/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const query = `
      SELECT * FROM complaints
      WHERE session_id = $1
    `;
    const result = await pool.query(query, [sessionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3. **Get Complaint Logs**
**Endpoint:** `GET /api/complaints/:sessionId/logs`

```javascript
app.get('/api/complaints/:sessionId/logs', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const query = `
      SELECT * FROM complaint_logs
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [sessionId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 4. **Add Complaint Log Entry**
**Endpoint:** `POST /api/complaints/:sessionId/logs`

```javascript
app.post('/api/complaints/:sessionId/logs', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { action, status } = req.body;
    
    const query = `
      INSERT INTO complaint_logs (session_id, action, status, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await pool.query(query, [sessionId, action, status]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 5. **Get Complaint Route**
**Endpoint:** `GET /api/complaints/:sessionId/route`

```javascript
app.get('/api/complaints/:sessionId/route', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const query = `
      SELECT * FROM complaint_routes
      WHERE session_id = $1
      ORDER BY routed_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [sessionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 6. **Get Audit Logs**
**Endpoint:** `GET /api/complaints/:complaintId/audit-logs`

```javascript
app.get('/api/complaints/:complaintId/audit-logs', async (req, res) => {
  try {
    const { complaintId } = req.params;
    const query = `
      SELECT * FROM audit_logs
      WHERE complaint_id = $1
      ORDER BY timestamp DESC
    `;
    const result = await pool.query(query, [complaintId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 7. **Create New Complaint**
**Endpoint:** `POST /api/complaints`

```javascript
app.post('/api/complaints', async (req, res) => {
  try {
    const {
      session_id,
      transcript,
      language_code,
      language_name,
      urgency_level,
      urgency_score,
      keywords,
      department_assigned,
    } = req.body;

    const query = `
      INSERT INTO complaints 
      (session_id, transcript, language_code, language_name, urgency_level, 
       urgency_score, keywords, department_assigned, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      session_id,
      transcript,
      language_code,
      language_name,
      urgency_level,
      urgency_score,
      keywords,
      department_assigned,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 8. **Update Complaint**
**Endpoint:** `PUT /api/complaints/:sessionId`

```javascript
app.put('/api/complaints/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;
    
    // Build dynamic UPDATE query
    const fields = Object.keys(updates)
      .filter(k => k !== 'session_id' && k !== 'id')
      .map((k, i) => `${k} = $${i + 2}`)
      .join(', ');
    
    const values = [sessionId, ...Object.values(updates)];
    
    const query = `
      UPDATE complaints
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 9. **Search Complaints**
**Endpoint:** `GET /api/complaints/search?q=query`

```javascript
app.get('/api/complaints/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const query = `
      SELECT * FROM complaints
      WHERE transcript ILIKE $1 OR keywords ILIKE $1
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query, [`%${q}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 10. **Get Complaint Statistics**
**Endpoint:** `GET /api/complaints/stats`

```javascript
app.get('/api/complaints/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN urgency_level = 'High' THEN 1 ELSE 0 END) as high_urgency,
        SUM(CASE WHEN urgency_level = 'Emergency' THEN 1 ELSE 0 END) as emergency,
        SUM(CASE WHEN department_assigned IS NOT NULL THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN department_assigned IS NULL THEN 1 ELSE 0 END) as pending
      FROM complaints
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Complete Express Server Setup (`server.js` or `index.js`)

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'connected',
      database_time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Include all complaint endpoints here (from above)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL}`);
});
```

## Frontend Configuration

Update your `.env` file in the React app:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Or for production:

```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Testing the Connection

1. **Start the backend server:**
   ```bash
   npm start
   ```

2. **Test database connection:**
   ```bash
   curl http://localhost:5000/api/db-test
   ```

3. **Fetch all complaints:**
   ```bash
   curl http://localhost:5000/api/complaints
   ```

4. **Frontend will automatically connect and display data**

## Query Examples for Testing

### Insert test complaint:
```sql
INSERT INTO complaints 
(session_id, transcript, language_code, language_name, urgency_level, urgency_score, created_at, updated_at)
VALUES 
('TEST-2025-001', 'Water supply is not working', 'en', 'English', 'High', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Check all complaints:
```sql
SELECT id, session_id, transcript, department_assigned, urgency_level 
FROM complaints 
ORDER BY created_at DESC;
```

### Add a log entry:
```sql
INSERT INTO complaint_logs (session_id, action, status, created_at)
VALUES ('TEST-2025-001', 'Complaint registered', 'Pending', CURRENT_TIMESTAMP);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to Neon DB | Verify connection string, check SSL settings, ensure IP is whitelisted |
| Endpoint returns 500 error | Check backend console for SQL errors, verify query syntax |
| Frontend can't reach backend | Verify CORS configuration, check API URL in .env |
| No data showing | Ensure data exists in database, check query filters |

## Next Steps

1. Implement the backend endpoints above
2. Run the Express server
3. Update React `.env` with correct API URL
4. Test complaint tracking in the UI
5. Verify all database queries work as expected
