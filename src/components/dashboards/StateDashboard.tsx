import { useAuth } from '@/contexts/AuthContext';
import { complaints, users, getPriorityBadgeClass, getStatusBadgeClass, getLevelLabel } from '@/data/mockData';
import { DistrictComparisonChart, TrendAreaChart, PriorityPieChart, StatusPieChart } from '@/components/Charts';

const StateDashboard = () => {
  const { user } = useAuth();
  // State officer sees all complaints except compliance-level
  const stateComplaints = complaints.filter(
    c => c.currentLevel !== 'compliance'
  );
  const pending = stateComplaints.filter(c => c.status === 'pending').length;
  const escalated = stateComplaints.filter(c => c.status === 'escalated').length;
  const resolved = stateComplaints.filter(c => c.status === 'resolved').length;
  const slaViolations = stateComplaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;

  // District officers under supervision
  const districtOfficers = users.filter(u => u.role === 'district');

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        🏗️ State Authority Dashboard — {user?.department}
      </h2>
      <p className="text-sm text-muted">Supervising District Authority officers and overseeing state-wide grievance redressal</p>

      {/* KPIs */}
      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value">{stateComplaints.length}</div>
          <div className="gov-kpi-label">Total in State</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{pending}</div>
          <div className="gov-kpi-label">Pending</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{escalated}</div>
          <div className="gov-kpi-label">Escalated</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value danger">{slaViolations}</div>
          <div className="gov-kpi-label">SLA Violations</div>
        </div>
      </div>

      {/* District Officers Supervision */}
      <div className="gov-card">
        <h3 className="gov-section-title">👥 District Officers Under Supervision</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>District</th>
                <th>Department</th>
                <th>Total Cases</th>
                <th>Escalated</th>
                <th>SLA Breaches</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {districtOfficers.map(officer => {
                const assigned = complaints.filter(c => c.assignedTo === officer.id);
                const officerEscalated = assigned.filter(c => c.status === 'escalated').length;
                const slaBreaches = assigned.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;
                return (
                  <tr key={officer.id}>
                    <td className="font-medium">{officer.name}</td>
                    <td className="text-sm">{officer.district}</td>
                    <td className="text-sm">{officer.department}</td>
                    <td>{assigned.length}</td>
                    <td>{officerEscalated > 0 ? <span className="text-danger font-semibold">{officerEscalated}</span> : '0'}</td>
                    <td>{slaBreaches > 0 ? <span className="text-danger font-semibold">{slaBreaches}</span> : '0'}</td>
                    <td>
                      <span className={`perf-dot ${slaBreaches === 0 ? 'perf-good' : 'perf-bad'}`}></span>
                      {slaBreaches === 0 ? 'Good' : 'Needs Attention'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* District Comparison + Trend */}
      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">📊 District-wise Comparison</h3>
          <div className="chart-container">
            <DistrictComparisonChart data={stateComplaints} />
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
          <h3 className="gov-section-title">📊 Priority Distribution</h3>
          <div className="chart-container">
            <PriorityPieChart data={stateComplaints} />
          </div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">📊 Status Overview</h3>
          <div className="chart-container">
            <StatusPieChart data={stateComplaints} />
          </div>
        </div>
      </div>

      {/* Complaints assigned to state */}
      <div className="gov-card">
        <h3 className="gov-section-title">📋 Complaints Requiring State Intervention</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Issue</th>
                <th>District</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stateComplaints.filter(c => c.currentLevel === 'state').map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs">{c.id}</td>
                  <td>
                    <span className="font-medium text-sm">{c.title}</span><br />
                    <span className="text-xs text-muted capitalize">{c.category}</span>
                  </td>
                  <td className="text-sm">{c.location.district}</td>
                  <td><span className={getPriorityBadgeClass(c.priority)}>{c.priority}</span></td>
                  <td><span className={getStatusBadgeClass(c.status)}>{c.status}</span></td>
                  <td className="text-xs">{getLevelLabel(c.currentLevel)}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <button className="btn btn-saffron btn-sm">Escalate to Compliance</button>
                      <button className="btn btn-green btn-sm">Resolve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StateDashboard;
