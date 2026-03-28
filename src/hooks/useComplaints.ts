/**
 * Custom React Hook for Complaint Management
 * Handles fetching, caching, and managing complaint data from database
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Complaint,
  ComplaintLog,
  ComplaintRoute,
  AuditLog,
  getAllComplaints,
  getComplaintBySessionId,
  getComplaintLogs,
  getComplaintRoute,
  getAuditLogs,
  createComplaint,
  updateComplaint,
  addComplaintLog,
  getComplaintsByDepartment,
  getComplaintsByUrgency,
  searchComplaints,
  getComplaintStats,
  formatComplaintForDisplay,
} from '@/services/database';

export interface UseComplaintsState {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook to fetch all complaints
 */
export const useComplaints = (): UseComplaintsState & { refetch: () => void } => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllComplaints();
      setComplaints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return {
    complaints,
    loading,
    error,
    total: complaints.length,
    refetch: fetchComplaints,
  };
};

/**
 * Hook to fetch single complaint by session ID
 */
export const useComplaint = (sessionId: string | null) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setComplaint(null);
      setLoading(false);
      return;
    }

    const fetchComplaint = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComplaintBySessionId(sessionId);
        setComplaint(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch complaint');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [sessionId]);

  return { complaint, loading, error };
};

/**
 * Hook to fetch complaint history/logs
 */
export const useComplaintHistory = (sessionId: string | null) => {
  const [logs, setLogs] = useState<ComplaintLog[]>([]);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComplaintLogs(sessionId);
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [sessionId]);

  const addLog = useCallback(
    async (action: string, status: string) => {
      if (!sessionId) return;
      try {
        await addComplaintLog(sessionId, { action, status });
        // Refetch logs
        const data = await getComplaintLogs(sessionId);
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add log');
      }
    },
    [sessionId]
  );

  return { logs, loading, error, addLog };
};

/**
 * Hook to fetch complaint route information
 */
export const useComplaintRoute = (sessionId: string | null) => {
  const [route, setRoute] = useState<ComplaintRoute | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setRoute(null);
      setLoading(false);
      return;
    }

    const fetchRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComplaintRoute(sessionId);
        setRoute(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch route');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [sessionId]);

  return { route, loading, error };
};

/**
 * Hook to search complaints
 */
export const useSearchComplaints = () => {
  const [results, setResults] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchComplaints(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
};

/**
 * Hook to fetch complaints by department
 */
export const useComplaintsByDepartment = (department: string | null) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(!!department);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!department) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComplaintsByDepartment(department);
        setComplaints(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [department]);

  return { complaints, loading, error };
};

/**
 * Hook to fetch complaint statistics
 */
export const useComplaintStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComplaintStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { stats, loading, error };
};

/**
 * Hook to create a new complaint
 */
export const useCreateComplaint = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const create = useCallback(async (complaintData: Partial<Complaint>) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createComplaint(complaintData);
      if (result) {
        setSuccess(true);
        return result;
      }
      throw new Error('Failed to create complaint');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create complaint');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error, success };
};

/**
 * Hook to update complaint
 */
export const useUpdateComplaint = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (sessionId: string, updates: Partial<Complaint>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateComplaint(sessionId, updates);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update complaint');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};
