import { useAuth } from '@/contexts/AuthContext';
import {
  complaints, auditLogs, aiInsights, users,
  getPriorityBadgeClass, getStatusBadgeClass, getLevelLabel,
} from '@/data/mockData';
import {
  CategoryBarChart, StatusPieChart, DistrictComparisonChart,
  TrendAreaChart, PriorityPieChart,
} from '@/components/Charts';
import MapboxGlobe from '@/components/MapboxGlobe';

const ComplianceDashboard = () => {
  const { user } = useAuth();
  const allComplaints = complaints;
  const escalatedComplaints = complaints.filter(c => c.status === 'escalated');
  const slaBreaches = complaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved');
  const avgResponseHours = 48;
  const complianceScore = 72;

  // All officers below compliance
  const allOfficers = users.filter(u => u.role !== 'citizen' && u.role !== 'compliance');

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        ⚖️ Compliance & Legal Authority Dashboard
      </h2>
      <p className="text-sm text-muted">
        Full supervisory authority over all governance levels — {user?.name}, {user?.department}
      </p>

      {/* KPIs */}
      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value danger">{slaBreaches.length}</div>
          <div className="gov-kpi-label">SLA Breaches</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{avgResponseHours}h</div>
          <div className="gov-kpi-label">Avg Response Time</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value" style={{ color: complianceScore < 75 ? 'var(--gov-danger)' : 'var(--gov-navy)' }}>
            {complianceScore}%
          </div>
          <div className="gov-kpi-label">Compliance Score</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{allComplaints.length}</div>
          <div className="gov-kpi-label">Total Complaints</div>
        </div>
      </div>

      {/* Mapbox Globe */}
      <div className="gov-card">
        <h3 className="gov-section-title">🌍 Complaint Hotspot Map (Globe View)</h3>
        <MapboxGlobe />
      </div>

      {/* AI Insights */}
      <div className="gov-card">
        <h3 className="gov-section-title">💡 AI-Generated Insights</h3>
        <div className="space-y-sm">
          {aiInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm" style={{ padding: '4px 0' }}>
              <span style={{ color: 'var(--gov-saffron)', fontWeight: 700 }}>▸</span>
              {insight}
            </div>
          ))}
        </div>
      </div>

      {/* All Officers Supervision */}
      <div className="gov-card">
        <h3 className="gov-section-title">👥 All Officers Under Supervision</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Role</th>
                <th>Location</th>
                <th>Department</th>
                <th>Cases</th>
                <th>SLA Breaches</th>
                <th>Performance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allOfficers.map(officer => {
                const assigned = complaints.filter(c => c.assignedTo === officer.id);
                const breaches = assigned.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;
                const roleLabel = officer.role === 'local' ? 'Local' : officer.role === 'district' ? 'District' : 'State';
                return (
                  <tr key={officer.id}>
                    <td className="font-medium">{officer.name}</td>
                    <td><span className="badge badge-assigned">{roleLabel}</span></td>
                    <td className="text-sm">{officer.location}</td>
                    <td className="text-sm">{officer.department}</td>
                    <td>{assigned.length}</td>
                    <td>{breaches > 0 ? <span className="text-danger font-semibold">{breaches}</span> : '0'}</td>
                    <td>
                      <span className={`perf-dot ${breaches === 0 ? 'perf-good' : breaches <= 1 ? 'perf-warning' : 'perf-bad'}`}></span>
                      {breaches === 0 ? 'Good' : breaches <= 1 ? 'Warning' : 'Poor'}
                    </td>
                    <td>
                      {breaches > 0 && (
                        <div className="flex gap-1">
                          <button className="btn btn-danger btn-sm">⚑ Flag</button>
                          <button className="btn btn-primary btn-sm">Investigate</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalated Complaints */}
      <div className="gov-card">
        <h3 className="gov-section-title">🚨 Escalated Complaints</h3>
        {escalatedComplaints.length === 0 ? (
          <p className="text-sm text-muted">No escalated complaints at this time.</p>
        ) : (
          <div className="table-wrap">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Current Level</th>
                  <th>Escalation History</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {escalatedComplaints.map(c => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.id}</td>
                    <td>
                      <span className="font-medium text-sm">{c.title}</span><br />
                      <span className="text-xs text-muted">{c.location.district}</span>
                    </td>
                    <td><span className={getPriorityBadgeClass(c.priority)}>{c.priority}</span></td>
                    <td className="text-xs">{getLevelLabel(c.currentLevel)}</td>
                    <td className="text-xs">
                      {c.escalationHistory.map((e, i) => (
                        <div key={i} style={{ marginBottom: '4px' }}>
                          {getLevelLabel(e.from)} → {getLevelLabel(e.to)}
                          <span className="text-muted"> ({e.reason})</span>
                        </div>
                      ))}
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        <button className="btn btn-danger btn-sm">⚑ Flag Officer</button>
                        <button className="btn btn-primary btn-sm">Investigate</button>
                        <button className="btn btn-saffron btn-sm">Send to Vigilance</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Audit Log */}
      <div className="gov-card">
        <h3 className="gov-section-title">📜 Complete Audit Log</h3>
        <div className="table-wrap">
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
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td className="text-xs">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                  <td className="text-sm">{log.actorName}</td>
                  <td>
                    <span className={`badge capitalize ${
                      log.action === 'escalated' ? 'badge-escalated' :
                      log.action === 'resolved' ? 'badge-resolved' :
                      log.action === 'flagged' ? 'badge-emergency' :
                      'badge-assigned'
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
      </div>

      {/* SLA Breach Report */}
      <div className="gov-card">
        <h3 className="gov-section-title">⏰ SLA Breach Report</h3>
        <div className="table-wrap">
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
                    <td className="text-danger font-semibold">{overdue} days</td>
                    <td className="text-xs">{getLevelLabel(c.currentLevel)}</td>
                    <td><span className={getStatusBadgeClass(c.status)}>{c.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Analytics */}
      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">📊 District Comparison</h3>
          <div className="chart-container">
            <DistrictComparisonChart data={allComplaints} />
          </div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">📈 Monthly Trend</h3>
          <div className="chart-container">
            <TrendAreaChart />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">📊 Status Distribution</h3>
          <div className="chart-container">
            <StatusPieChart data={allComplaints} />
          </div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">📊 Priority Breakdown</h3>
          <div className="chart-container">
            <PriorityPieChart data={allComplaints} />
          </div>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">📊 Category Analysis</h3>
        <div className="chart-container">
          <CategoryBarChart data={allComplaints} />
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
