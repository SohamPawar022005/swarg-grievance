/**
 * Database Service Layer
 * Handles all queries to Neon PostgreSQL database through backend API
 */

export interface Complaint {
  id: number;
  session_id: string;
  transcript: string;
  language_code: string;
  language_name: string;
  urgency_level: string;
  urgency_score: number;
  keywords: string;
  department_assigned: string;
  department_confidence: number;
  created_at: string;
  updated_at: string;
}

export interface ComplaintLog {
  id: number;
  complaint_id: number;
  session_id: string;
  action: string;
  status: string;
  created_at: string;
}

export interface ComplaintRoute {
  id: number;
  session_id: string;
  department: string;
  route_confidence: number;
  routing_keywords: string;
  routed_at: string;
}

export interface AuditLog {
  id: number;
  complaint_id: number;
  action: string;
  actor: string;
  timestamp: string;
}

// Vite exposes env vars via import.meta.env using the VITE_ prefix.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetch all complaints from database
 */
export const getAllComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch complaints');
    return await response.json();
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
};

/**
 * Fetch single complaint by session_id
 */
export const getComplaintBySessionId = async (sessionId: string): Promise<Complaint | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch complaint');
    return await response.json();
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return null;
  }
};

/**
 * Fetch complaint logs for a specific complaint
 */
export const getComplaintLogs = async (sessionId: string): Promise<ComplaintLog[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${sessionId}/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch complaint logs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching complaint logs:', error);
    return [];
  }
};

/**
 * Fetch complaint route information
 */
export const getComplaintRoute = async (sessionId: string): Promise<ComplaintRoute | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${sessionId}/route`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch complaint route');
    return await response.json();
  } catch (error) {
    console.error('Error fetching complaint route:', error);
    return null;
  }
};

/**
 * Fetch audit logs for a specific complaint
 */
export const getAuditLogs = async (complaintId: number): Promise<AuditLog[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/audit-logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

/**
 * Create a new complaint
 */
export const createComplaint = async (complaintData: Partial<Complaint>): Promise<Complaint | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaintData),
    });
    if (!response.ok) throw new Error('Failed to create complaint');
    return await response.json();
  } catch (error) {
    console.error('Error creating complaint:', error);
    return null;
  }
};

/**
 * Update complaint status or details
 */
export const updateComplaint = async (sessionId: string, updates: Partial<Complaint>): Promise<Complaint | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update complaint');
    return await response.json();
  } catch (error) {
    console.error('Error updating complaint:', error);
    return null;
  }
};

/**
 * Add a log entry for a complaint
 */
export const addComplaintLog = async (sessionId: string, logData: Partial<ComplaintLog>): Promise<ComplaintLog | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${sessionId}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
    if (!response.ok) throw new Error('Failed to add log');
    return await response.json();
  } catch (error) {
    console.error('Error adding log:', error);
    return null;
  }
};

/**
 * Fetch complaints by department
 */
export const getComplaintsByDepartment = async (department: string): Promise<Complaint[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/complaints?department=${encodeURIComponent(department)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch complaints by department');
    return await response.json();
  } catch (error) {
    console.error('Error fetching complaints by department:', error);
    return [];
  }
};

/**
 * Fetch complaints by urgency level
 */
export const getComplaintsByUrgency = async (urgencyLevel: string): Promise<Complaint[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/complaints?urgency=${encodeURIComponent(urgencyLevel)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch complaints by urgency');
    return await response.json();
  } catch (error) {
    console.error('Error fetching complaints by urgency:', error);
    return [];
  }
};

/**
 * Search complaints by keywords or transcript
 */
export const searchComplaints = async (query: string): Promise<Complaint[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/complaints/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) throw new Error('Failed to search complaints');
    return await response.json();
  } catch (error) {
    console.error('Error searching complaints:', error);
    return [];
  }
};

/**
 * Get complaint statistics/metrics
 */
export const getComplaintStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return null;
  }
};

/**
 * Format complaint for display
 */
export const formatComplaintForDisplay = (complaint: Complaint) => {
  return {
    id: `GRV-2025-${String(complaint.id).padStart(3, '0')}`,
    sessionId: complaint.session_id,
    title: complaint.transcript.substring(0, 60) + '...',
    description: complaint.transcript,
    department: complaint.department_assigned || 'Unassigned',
    urgency: complaint.urgency_level || 'Medium',
    urgencyScore: complaint.urgency_score || 5,
    status: 'Pending',
    language: complaint.language_name || 'English',
    createdAt: new Date(complaint.created_at),
    updatedAt: new Date(complaint.updated_at),
    keywords: complaint.keywords?.split(',') || [],
  };
};
