import { useState } from 'react';
import { Shield, AlertTriangle, Flag } from 'lucide-react';
import {
  complaints,
  auditLogs,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  getLevelLabel,
} from '@/data/mockData';

const CompliancePage = () => {
  const escalatedComplaints = complaints.filter(c => c.status === 'escalated');
  const slaBreaches = complaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved');
  const avgResponseHours = 48;
  const complianceScore = 72;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-primary">Compliance & Audit Monitoring</h2>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value text-destructive">{slaBreaches.length}</div>
          <div className="gov-kpi-label">SLA Breaches</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{avgResponseHours}h</div>
          <div className="gov-kpi-label">Avg Response Time</div>
        </div>
        <div className="gov-kpi">
          <div className={`gov-kpi-value ${complianceScore < 75 ? 'text-destructive' : ''}`}>{complianceScore}%</div>
          <div className="gov-kpi-label">Compliance Score</div>
        </div>
      </div>

      {/* Audit Log */}
      <section className="gov-card">
        <h2 className="gov-section-title">Audit Log</h2>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Complaint ID</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td className="text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                  <td className="text-sm">{log.actorName}</td>
                  <td>
                    <span className={`gov-badge capitalize ${
                      log.action === 'escalated' ? 'gov-badge-escalated' :
                      log.action === 'resolved' ? 'gov-badge-resolved' :
                      log.action === 'flagged' ? 'gov-badge-emergency' :
                      'gov-badge-assigned'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{log.complaintId}</td>
                  <td className="text-xs">{log.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Escalated Complaints */}
      <section className="gov-card">
        <h2 className="gov-section-title flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Escalated Complaints
        </h2>
        {escalatedComplaints.length === 0 ? (
          <p className="text-sm text-muted-foreground">No escalated complaints at this time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Current Level</th>
                  <th>Escalation Steps</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {escalatedComplaints.map(c => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.id}</td>
                    <td>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.location.district}</p>
                    </td>
                    <td><span className={getPriorityBadgeClass(c.priority)}>{c.priority}</span></td>
                    <td className="text-xs">{getLevelLabel(c.currentLevel)}</td>
                    <td className="text-xs">
                      {c.escalationHistory.map((e, i) => (
                        <div key={i} className="mb-1">
                          {getLevelLabel(e.from)} → {getLevelLabel(e.to)}
                          <span className="text-muted-foreground ml-1">({e.reason})</span>
                        </div>
                      ))}
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        <button className="gov-btn-danger text-xs px-2 py-1 flex items-center gap-1">
                          <Flag className="w-3 h-3" /> Flag Officer
                        </button>
                        <button className="gov-btn-primary text-xs px-2 py-1">Investigate</button>
                        <button className="gov-btn-secondary text-xs px-2 py-1">Send to Vigilance</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SLA Breach Details */}
      <section className="gov-card">
        <h2 className="gov-section-title">SLA Breach Report</h2>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Issue</th>
                <th>SLA Deadline</th>
                <th>Days Overdue</th>
                <th>Current Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {slaBreaches.map(c => {
                const overdue = Math.ceil((new Date().getTime() - new Date(c.slaDeadline).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.id}</td>
                    <td className="text-sm">{c.title}</td>
                    <td className="text-xs">{new Date(c.slaDeadline).toLocaleDateString('en-IN')}</td>
                    <td className="text-destructive font-semibold">{overdue} days</td>
                    <td className="text-xs">{getLevelLabel(c.currentLevel)}</td>
                    <td><span className={getStatusBadgeClass(c.status)}>{c.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CompliancePage;
