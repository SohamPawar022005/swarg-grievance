/**
 * Complaint Tracker Component
 * Displays real complaints from Neon PostgreSQL database
 * Shows complaint status, history, and routing information
 */

import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, MapPin, Clock, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useComplaint,
  useComplaintHistory,
  useComplaintRoute,
  formatComplaintForDisplay,
} from '@/hooks/useComplaints';

interface ComplaintTrackerProps {
  onClose?: () => void;
}

const ComplaintTracker: React.FC<ComplaintTrackerProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [sessionId, setSessionId] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const { complaint, loading, error } = useComplaint(sessionId || null);
  const { logs, loading: logsLoading } = useComplaintHistory(sessionId || null);
  const { route } = useComplaintRoute(sessionId || null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSessionId(searchInput.trim());
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'emergency':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return '#10b981';
      case 'escalated':
        return '#dc2626';
      case 'pending':
        return '#3b82f6';
      case 'assigned':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--gov-navy)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} /> {t('citizen.track.title')}
        </h2>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>
              {t('citizen.track.inputLabel')}
            </label>
            <input
              type="text"
              placeholder={t('citizen.track.inputPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input"
              style={{ fontSize: '13px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: 'var(--gov-navy)',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              alignSelf: 'flex-end',
              marginBottom: '-4px',
            }}
          >
            {t('citizen.track.button')}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: 'var(--gov-navy)' }} />
          <p style={{ color: 'var(--gov-text-muted)' }}>Loading complaint details...</p>
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Complaint Details */}
      {complaint && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Main Complaint Card */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--gov-border)',
              borderRadius: '4px',
              padding: '16px',
              boxShadow: 'var(--gov-shadow)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gov-navy)', margin: 0 }}>
                  {`GRV-2025-${String(complaint.id).padStart(3, '0')}`}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--gov-text-muted)', margin: '4px 0 0 0' }}>
                  Session: {complaint.session_id}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: getUrgencyBadgeColor(complaint.urgency_level),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  {complaint.urgency_level || 'Medium'}
                </span>
                <span
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                >
                  {complaint.language_name || 'English'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--gov-border)' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Department Assigned
                </p>
                <p style={{ fontSize: '13px', color: 'var(--gov-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {complaint.department_assigned || <><Clock size={14} /> Routing in progress...</>}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Department Confidence
                </p>
                <p style={{ fontSize: '13px', color: 'var(--gov-text)', margin: 0 }}>
                  {(complaint.department_confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Complaint Details
              </p>
              <p style={{ fontSize: '13px', color: 'var(--gov-text)', margin: 0, lineHeight: '1.5' }}>
                {complaint.transcript}
              </p>
            </div>

            {complaint.keywords && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Keywords
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {complaint.keywords.split(',').map((keyword, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', color: 'var(--gov-text-muted)' }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Created: {new Date(complaint.created_at).toLocaleDateString()}
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Updated: {new Date(complaint.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Route Information */}
          {route && (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--gov-border)',
                borderRadius: '4px',
                padding: '16px',
                boxShadow: 'var(--gov-shadow)',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gov-navy)', marginBottom: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} /> Routing Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Routed To
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--gov-text)', margin: 0 }}>
                    {route.department}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Confidence Score
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
                        flex: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: route.route_confidence > 0.8 ? '#10b981' : route.route_confidence > 0.6 ? '#f59e0b' : '#dc2626',
                          width: `${route.route_confidence * 100}%`,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', minWidth: '40px' }}>
                      {(route.route_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              {route.routing_keywords && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gov-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Routing Keywords
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--gov-text)', margin: 0 }}>
                    {route.routing_keywords}
                  </p>
                </div>
              )}
              <p style={{ fontSize: '11px', color: 'var(--gov-text-muted)', margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Routed: {new Date(route.routed_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Complaint History/Logs */}
          {logs.length > 0 && (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--gov-border)',
                borderRadius: '4px',
                padding: '16px',
                boxShadow: 'var(--gov-shadow)',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gov-navy)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Complaint History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f9fafb',
                      borderLeft: '3px solid var(--gov-navy)',
                      borderRadius: '2px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'var(--gov-navy)' }}>
                        {log.action}
                      </span>
                      <span
                        style={{
                          backgroundColor: getStatusBadgeColor(log.status),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p style={{ color: 'var(--gov-text-muted)', margin: '4px 0 0 0', fontSize: '11px' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!complaint && !loading && sessionId && (
            <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#fef3c7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#92400e' }}>
              <AlertTriangle size={20} /> No complaint found with this ID
            </div>
          )}
        </div>
      )}

      {!sessionId && !loading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gov-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'column' }}>
          <Search size={40} style={{ color: 'var(--gov-navy)', opacity: 0.5 }} />
          <p>Enter a complaint ID or session number to track your grievance</p>
        </div>
      )}
    </div>
  );
};

export default ComplaintTracker;
