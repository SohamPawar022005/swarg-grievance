import { useState } from 'react';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import {
  complaints,
  auditLogs,
  aiInsights,
  getUserById,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  getLevelLabel,
  type Level,
  type Complaint,
} from '@/data/mockData';

type Tab = 'dashboard' | 'complaints' | 'analytics' | 'compliance';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [viewingLevel, setViewingLevel] = useState<Level | 'all'>('all');

  const filteredComplaints = viewingLevel === 'all'
    ? complaints
    : complaints.filter(c => c.currentLevel === viewingLevel);

  const totalComplaints = filteredComplaints.length;
  const pendingComplaints = filteredComplaints.filter(c => c.status === 'pending').length;
  const resolvedToday = filteredComplaints.filter(c => c.status === 'resolved').length;
  const slaViolations = filteredComplaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'complaints', label: 'Complaints' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'compliance', label: 'Compliance' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Level Selector + Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-1 border-b border-border">
          {tabs.map(t => (
            <button
              key={t.key}
              className={activeTab === t.key ? 'gov-tab-active' : 'gov-tab'}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Viewing Level:</span>
          <select
            className="border border-border rounded px-3 py-1.5 text-sm bg-background"
            value={viewingLevel}
            onChange={(e) => setViewingLevel(e.target.value as Level | 'all')}
          >
            <option value="all">All Levels</option>
            <option value="local">Local Authority</option>
            <option value="district">District Authority</option>
            <option value="state">State Authority</option>
            <option value="compliance">Compliance Authority</option>
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value">{totalComplaints}</div>
          <div className="gov-kpi-label">Total Complaints</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{pendingComplaints}</div>
          <div className="gov-kpi-label">Pending Complaints</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{resolvedToday}</div>
          <div className="gov-kpi-label">Resolved</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value text-destructive">{slaViolations}</div>
          <div className="gov-kpi-label">SLA Violations</div>
        </div>
      </div>

      {/* Tab Content */}
      {(activeTab === 'dashboard' || activeTab === 'complaints') && (
        <ComplaintsTable complaints={filteredComplaints} />
      )}

      {activeTab === 'dashboard' && (
        <>
          {/* SLA Alerts */}
          {slaViolations > 0 && (
            <section className="gov-card">
              <h2 className="gov-section-title flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                SLA Violation Alerts
              </h2>
              <div className="space-y-2">
                {filteredComplaints
                  .filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved')
                  .map(c => (
                    <div key={c.id} className="gov-alert text-sm">
                      <strong>{c.id}</strong> — {c.title} — SLA breached on {new Date(c.slaDeadline).toLocaleDateString('en-IN')}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* AI Insights */}
          <section className="gov-card">
            <h2 className="gov-section-title flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-gov-saffron" />
              AI-Generated Insights
            </h2>
            <ul className="space-y-2">
              {aiInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-gov-saffron font-bold">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </section>

          {/* Area Summary */}
          <section className="gov-card">
            <h2 className="gov-section-title">Area-wise Summary</h2>
            <div className="overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Total</th>
                    <th>Pending</th>
                    <th>Resolved</th>
                    <th>Escalated</th>
                  </tr>
                </thead>
                <tbody>
                  {['Varanasi', 'Lucknow', 'Kanpur'].map(district => {
                    const dc = complaints.filter(c => c.location.district === district);
                    return (
                      <tr key={district}>
                        <td className="font-medium">{district}</td>
                        <td>{dc.length}</td>
                        <td>{dc.filter(c => c.status === 'pending').length}</td>
                        <td>{dc.filter(c => c.status === 'resolved').length}</td>
                        <td>{dc.filter(c => c.status === 'escalated').length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === 'analytics' && (
        <section className="gov-card">
          <h2 className="gov-section-title">Category-wise Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Pending</th>
                  <th>Assigned</th>
                  <th>Escalated</th>
                  <th>Resolved</th>
                </tr>
              </thead>
              <tbody>
                {(['water', 'roads', 'health', 'sanitation', 'electricity', 'education'] as const).map(cat => {
                  const cc = complaints.filter(c => c.category === cat);
                  return (
                    <tr key={cat}>
                      <td className="font-medium capitalize">{cat}</td>
                      <td>{cc.length}</td>
                      <td>{cc.filter(c => c.status === 'pending').length}</td>
                      <td>{cc.filter(c => c.status === 'assigned').length}</td>
                      <td>{cc.filter(c => c.status === 'escalated').length}</td>
                      <td>{cc.filter(c => c.status === 'resolved').length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'compliance' && (
        <section className="gov-card">
          <h2 className="gov-section-title">Recent Audit Log</h2>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Complaint</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 5).map(log => (
                  <tr key={log.id}>
                    <td className="text-xs">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                    <td>{log.actorName}</td>
                    <td><span className="capitalize gov-badge-assigned">{log.action}</span></td>
                    <td className="font-mono text-xs">{log.complaintId}</td>
                    <td className="text-xs">{log.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

const ComplaintsTable = ({ complaints: list }: { complaints: Complaint[] }) => (
  <section className="gov-card">
    <h2 className="gov-section-title">Complaints Register</h2>
    <div className="overflow-x-auto">
      <table className="gov-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Issue</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map(c => (
            <tr key={c.id}>
              <td className="font-mono text-xs">{c.id}</td>
              <td className="max-w-[200px]">
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{c.category}</p>
              </td>
              <td className="text-xs">{c.location.area}, {c.location.district}</td>
              <td><span className={getPriorityBadgeClass(c.priority)}>{c.priority}</span></td>
              <td><span className={getStatusBadgeClass(c.status)}>{c.status}</span></td>
              <td className="text-xs">{getLevelLabel(c.currentLevel)}</td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  {c.status === 'pending' && <button className="gov-btn-primary text-xs px-2 py-1">Assign</button>}
                  {c.status !== 'resolved' && c.status !== 'escalated' && (
                    <button className="gov-btn-secondary text-xs px-2 py-1">Escalate</button>
                  )}
                  {c.status !== 'resolved' && (
                    <button className="gov-btn-success text-xs px-2 py-1">Resolve</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminDashboard;
