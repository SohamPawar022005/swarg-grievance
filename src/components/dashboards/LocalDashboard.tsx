import { useAuth } from '@/contexts/AuthContext';
import { complaints, getPriorityBadgeClass, getStatusBadgeClass } from '@/data/mockData';
import { CategoryBarChart } from '@/components/Charts';

const LocalDashboard = () => {
  const { user } = useAuth();
  const myComplaints = complaints.filter(c => c.currentLevel === 'local');
  const pending = myComplaints.filter(c => c.status === 'pending').length;
  const resolved = myComplaints.filter(c => c.status === 'resolved').length;
  const slaViolations = myComplaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        🏘️ Local Authority Dashboard — {user?.location}
      </h2>

      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value">{myComplaints.length}</div>
          <div className="gov-kpi-label">Total Complaints</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{pending}</div>
          <div className="gov-kpi-label">Pending</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{resolved}</div>
          <div className="gov-kpi-label">Resolved</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value danger">{slaViolations}</div>
          <div className="gov-kpi-label">SLA Violations</div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="gov-card">
        <h3 className="gov-section-title">📋 My Assigned Complaints</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Issue</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myComplaints.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs">{c.id}</td>
                  <td>
                    <span className="font-medium text-sm">{c.title}</span><br />
                    <span className="text-xs text-muted capitalize">{c.category}</span>
                  </td>
                  <td className="text-xs">{c.location.area}, {c.location.district}</td>
                  <td><span className={getPriorityBadgeClass(c.priority)}>{c.priority}</span></td>
                  <td><span className={getStatusBadgeClass(c.status)}>{c.status}</span></td>
                  <td className="text-xs">{new Date(c.slaDeadline).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {c.status === 'pending' && <button className="btn btn-primary btn-sm">Assign</button>}
                      {c.status !== 'resolved' && <button className="btn btn-green btn-sm">Resolve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="gov-card">
        <h3 className="gov-section-title">📊 Complaints by Category</h3>
        <div className="chart-container">
          <CategoryBarChart data={myComplaints} />
        </div>
      </div>
    </div>
  );
};

export default LocalDashboard;
