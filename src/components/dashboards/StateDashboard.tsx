import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { complaints, users, getPriorityBadgeClass, getStatusBadgeClass, getLevelLabel } from '@/data/mockData';
import { DistrictComparisonChart, TrendAreaChart, PriorityPieChart, StatusPieChart } from '@/components/Charts';

const StateDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const stateComplaints = complaints.filter(c => c.currentLevel !== 'compliance');
  const pending = stateComplaints.filter(c => c.status === 'pending').length;
  const escalated = stateComplaints.filter(c => c.status === 'escalated').length;
  const slaViolations = stateComplaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;
  const districtOfficers = users.filter(u => u.role === 'district');

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        {t('state.title')} — {user?.department}
      </h2>
      <p className="text-sm text-muted">{t('state.supervising')}</p>

      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value">{stateComplaints.length}</div>
          <div className="gov-kpi-label">{t('state.totalInState')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{pending}</div>
          <div className="gov-kpi-label">{t('dash.pending')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{escalated}</div>
          <div className="gov-kpi-label">{t('dash.escalated')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value danger">{slaViolations}</div>
          <div className="gov-kpi-label">{t('dash.slaViolations')}</div>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">{t('state.officerSupervision')}</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('dash.officer')}</th>
                <th>{t('state.district')}</th>
                <th>{t('dash.department')}</th>
                <th>{t('state.totalCases')}</th>
                <th>{t('dash.escalated')}</th>
                <th>{t('state.slaBreaches')}</th>
                <th>{t('dash.performance')}</th>
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
                      {slaBreaches === 0 ? t('dash.good') : t('dash.needsAttention')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">{t('state.districtComparison')}</h3>
          <div className="chart-container"><DistrictComparisonChart data={stateComplaints} /></div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">{t('state.trend')}</h3>
          <div className="chart-container"><TrendAreaChart /></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">{t('state.priorityChart')}</h3>
          <div className="chart-container"><PriorityPieChart data={stateComplaints} /></div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">{t('state.statusChart')}</h3>
          <div className="chart-container"><StatusPieChart data={stateComplaints} /></div>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">{t('state.stateComplaints')}</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('dash.id')}</th>
                <th>{t('dash.issue')}</th>
                <th>{t('state.district')}</th>
                <th>{t('dash.priority')}</th>
                <th>{t('dash.status')}</th>
                <th>{t('dash.level')}</th>
                <th>{t('dash.actions')}</th>
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
                      <button className="btn btn-saffron btn-sm">{t('state.escalateCompliance')}</button>
                      <button className="btn btn-green btn-sm">{t('dash.resolve')}</button>
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
