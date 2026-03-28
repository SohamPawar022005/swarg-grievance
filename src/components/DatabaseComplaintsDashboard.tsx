/**
 * Database Complaints Dashboard
 * Shows all complaints from Neon PostgreSQL database
 * For officers to manage and track all grievances
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useComplaints, useComplaintStats } from '@/hooks/useComplaints';

interface DatabaseComplaintsDashboardProps {
  supervisorLevel?: 'local' | 'district' | 'state' | 'compliance';
}

const DatabaseComplaintsDashboard: React.FC<DatabaseComplaintsDashboardProps> = ({
  supervisorLevel = 'local',
}) => {
  const { t } = useLanguage();
  const { complaints, loading, error, refetch } = useComplaints();
  const { stats, loading: statsLoading } = useComplaintStats();
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterUrgency, setFilterUrgency] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'urgent' | 'department'>('recent');

  const filteredAndSortedComplaints = useMemo(() => {
    let filtered = complaints;

    // Apply department filter
    if (filterDepartment) {
      filtered = filtered.filter((c) =>
        c.department_assigned?.toLowerCase().includes(filterDepartment.toLowerCase())
      );
    }

    // Apply urgency filter
    if (filterUrgency) {
      filtered = filtered.filter((c) =>
        c.urgency_level?.toLowerCase() === filterUrgency.toLowerCase()
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'urgent':
        sorted.sort((a, b) => (b.urgency_score || 0) - (a.urgency_score || 0));
        break;
      case 'department':
        sorted.sort((a, b) =>
          (a.department_assigned || '').localeCompare(b.department_assigned || '')
        );
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [complaints, filterDepartment, filterUrgency, sortBy]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'emergency':
        return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
      case 'medium':
        return { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' };
      case 'low':
        return { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
  };

  const departments = useMemo(
    () => [...new Set(complaints.map((c) => c.department_assigned).filter(Boolean))],
    [complaints]
  );

  const urgencyLevels = useMemo(
    () => [...new Set(complaints.map((c) => c.urgency_level).filter(Boolean))],
    [complaints]
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--gov-navy)', margin: '0 0 16px 0' }}>
          📊 {t('dash.totalComplaints') || 'Complaints Dashboard'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--gov-text-muted)', margin: 0 }}>
          Showing {filteredAndSortedComplaints.length} of {complaints.length} complaints from database
        </p>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af', textTransform: 'uppercase', margin: 0 }}>
              Total
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af', margin: '4px 0 0 0' }}>
              {stats.total || complaints.length}
            </p>
          </div>

          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', textTransform: 'uppercase', margin: 0 }}>
              High Priority
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: '4px 0 0 0' }}>
              {stats.high_urgency || complaints.filter((c) => c.urgency_level?.toLowerCase() === 'high').length}
            </p>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '4px', padding: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase', margin: 0 }}>
              Resolved
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a', margin: '4px 0 0 0' }}>
              {stats.resolved || 0}
            </p>
          </div>

          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px', padding: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#d97706', textTransform: 'uppercase', margin: 0 }}>
              Pending
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#d97706', margin: '4px 0 0 0' }}>
              {stats.pending || complaints.filter((c) => !c.department_assigned).length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid var(--gov-border)',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="urgent">Most Urgent</option>
            <option value="department">By Department</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            {t('dash.department') || 'Department'}
          </label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid var(--gov-border)',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            {t('dash.priority') || 'Priority'}
          </label>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid var(--gov-border)',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
          >
            <option value="">All Priorities</option>
            {urgencyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => refetch()}
            style={{
              width: '100%',
              padding: '6px 12px',
              backgroundColor: 'var(--gov-navy)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gov-text-muted)' }}>
          ⏳ Loading complaints from database...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            padding: '12px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Complaints List */}
      {!loading && filteredAndSortedComplaints.length > 0 && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {filteredAndSortedComplaints.map((complaint) => {
            const urgencyColor = getUrgencyColor(complaint.urgency_level);
            return (
              <div
                key={complaint.id}
                style={{
                  backgroundColor: 'white',
                  border: `1px solid ${urgencyColor.border}`,
                  borderLeft: `4px solid ${urgencyColor.text}`,
                  borderRadius: '4px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--gov-shadow-md)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', margin: 0 }}>
                      GRV-2025-{String(complaint.id).padStart(3, '0')} • {complaint.session_id}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--gov-text)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      {complaint.transcript.substring(0, 80)}...
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: urgencyColor.bg,
                      color: urgencyColor.text,
                      padding: '4px 12px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      marginLeft: '12px',
                    }}
                  >
                    {complaint.urgency_level}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px' }}>
                  <div>
                    <p style={{ color: 'var(--gov-text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: '600' }}>
                      Dept
                    </p>
                    <p style={{ color: 'var(--gov-text)', margin: '2px 0 0 0' }}>
                      {complaint.department_assigned || '🔄 Routing'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--gov-text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: '600' }}>
                      Language
                    </p>
                    <p style={{ color: 'var(--gov-text)', margin: '2px 0 0 0' }}>
                      {complaint.language_name || 'English'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--gov-text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: '600' }}>
                      Confidence
                    </p>
                    <p style={{ color: 'var(--gov-text)', margin: '2px 0 0 0' }}>
                      {(complaint.department_confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--gov-text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: '600' }}>
                      Date
                    </p>
                    <p style={{ color: 'var(--gov-text)', margin: '2px 0 0 0' }}>
                      {new Date(complaint.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredAndSortedComplaints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gov-text-muted)' }}>
          <p style={{ fontSize: '14px', margin: '0 0 8px 0' }}>📭 No complaints found</p>
          <p style={{ fontSize: '12px', margin: 0 }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default DatabaseComplaintsDashboard;
