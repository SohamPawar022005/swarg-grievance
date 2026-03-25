import { useAuth } from '@/contexts/AuthContext';
import { complaints, users, getPriorityBadgeClass, getStatusBadgeClass, getLevelLabel } from '@/data/mockData';
import { CategoryBarChart, StatusPieChart, OfficerWorkloadChart } from '@/components/Charts';

const DistrictDashboard = () => {
  const { user } = useAuth();
  // District officer sees local + district level complaints in their district
  const districtComplaints = complaints.filter(
    c => c.currentLevel === 'local' || c.currentLevel === 'district'
  );
  const pending = districtComplaints.filter(c => c.status === 'pending').length;
  const resolved = districtComplaints.filter(c => c.status === 'resolved').length;
  const escalated = districtComplaints.filter(c => c.status === 'escalated').length;
  const slaViolations = districtComplaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;

  // Local officers under supervision
  const localOfficers = users.filter(u => u.role === 'local');

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        🏛️ District Authority Dashboard — {user?.location}
      </h2>
      <p className="text-sm text-muted">Supervising Local Authority officers and managing district-level complaints</p>

      {/* KPIs */}
      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value">{districtComplaints.length}</div>
          <div className="gov-kpi-label">Total in District</div>
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

      {/* Officer Supervision */}
      <div className="gov-card">
        <h3 className="gov-section-title">👥 Local Officers Under Supervision</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Ward</th>
                <th>Department</th>
                <th>Assigned</th>
                <th>Pending</th>
                <th>Resolved</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {localOfficers.map(officer => {
                const assigned = complaints.filter(c => c.assignedTo === officer.id);
                const officerPending = assigned.filter(c => c.status === 'pending' || c.status === 'assigned').length;
                const officerResolved = assigned.filter(c => c.status === 'resolved').length;
                const slaBreaches = assigned.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;
                return (
                  <tr key={officer.id}>
                    <td className="font-medium">{officer.name}</td>
                    <td className="text-sm">{officer.ward}</td>
                    <td className="text-sm">{officer.department}</td>
                    <td>{assigned.length}</td>
                    <td>{officerPending}</td>
                    <td>{officerResolved}</td>
                    <td>
                      <span className={`perf-dot ${slaBreaches === 0 ? 'perf-good' : slaBreaches <= 1 ? 'perf-warning' : 'perf-bad'}`}></span>
                      {slaBreaches === 0 ? 'Good' : slaBreaches <= 1 ? 'Average' : 'Poor'}
                      {slaBreaches > 0 && <span className="text-xs text-danger"> ({slaBreaches} SLA breach)</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assigned to District */}
      <div className="gov-card">
        <h3 className="gov-section-title">📋 Complaints Assigned to District Level</h3>
        <div className="table-wrap">
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
              {districtComplaints.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs">{c.id}</td>
                  <td>
                    <span className="font-medium text-sm">{c.title}</span><br />
                    <span className="text-xs text-muted capitalize">{c.category}</span>
                  </td>
                  <td className="text-xs">{c.location.area}, {c.location.district}</td>
                  <td><span className={getPriorityBadgeClass(c.priority)}>{c.priority}</span></td>
                  <td><span className={getStatusBadgeClass(c.status)}>{c.status}</span></td>
                  <td className="text-xs">{getLevelLabel(c.currentLevel)}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {c.status === 'pending' && <button className="btn btn-primary btn-sm">Assign</button>}
                      {c.status !== 'resolved' && c.status !== 'escalated' && (
                        <button className="btn btn-saffron btn-sm">Escalate</button>
                      )}
                      {c.status !== 'resolved' && <button className="btn btn-green btn-sm">Resolve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">📊 Status Distribution</h3>
          <div className="chart-container">
            <StatusPieChart data={districtComplaints} />
          </div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">📊 Category Breakdown</h3>
          <div className="chart-container">
            <CategoryBarChart data={districtComplaints} />
          </div>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">📊 Officer Workload</h3>
        <OfficerWorkloadChart />
      </div>
    </div>
  );
};

export default DistrictDashboard;
