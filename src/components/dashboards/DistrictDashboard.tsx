import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { complaints, users, getPriorityBadgeClass, getStatusBadgeClass, getLevelLabel } from '@/data/mockData';
import { CategoryBarChart, StatusPieChart, OfficerWorkloadChart } from '@/components/Charts';

const DistrictDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const districtComplaints = complaints.filter(
    c => c.currentLevel === 'local' || c.currentLevel === 'district'
  );
  const pending = districtComplaints.filter(c => c.status === 'pending').length;
  const resolved = districtComplaints.filter(c => c.status === 'resolved').length;
  const slaViolations = districtComplaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;
  const localOfficers = users.filter(u => u.role === 'local');

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        {t('district.title')} — {user?.location}
      </h2>
      <p className="text-sm text-muted">{t('district.supervising')}</p>

      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value">{districtComplaints.length}</div>
          <div className="gov-kpi-label">{t('district.totalInDistrict')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{pending}</div>
          <div className="gov-kpi-label">{t('dash.pending')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{resolved}</div>
          <div className="gov-kpi-label">{t('dash.resolved')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value danger">{slaViolations}</div>
          <div className="gov-kpi-label">{t('dash.slaViolations')}</div>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">{t('district.officerSupervision')}</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('dash.officer')}</th>
                <th>{t('dash.ward')}</th>
                <th>{t('dash.department')}</th>
                <th>{t('dash.assigned')}</th>
                <th>{t('dash.pending')}</th>
                <th>{t('dash.resolved')}</th>
                <th>{t('dash.performance')}</th>
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
                      {slaBreaches === 0 ? t('dash.good') : slaBreaches <= 1 ? t('dash.average') : t('dash.poor')}
                      {slaBreaches > 0 && <span className="text-xs text-danger"> ({slaBreaches} {t('dash.slaBreach')})</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">{t('district.complaints')}</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('dash.id')}</th>
                <th>{t('dash.issue')}</th>
                <th>{t('dash.location')}</th>
                <th>{t('dash.priority')}</th>
                <th>{t('dash.status')}</th>
                <th>{t('dash.level')}</th>
                <th>{t('dash.actions')}</th>
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
                      {c.status === 'pending' && <button className="btn btn-primary btn-sm">{t('dash.assign')}</button>}
                      {c.status !== 'resolved' && c.status !== 'escalated' && (
                        <button className="btn btn-saffron btn-sm">{t('district.escalateToState')}</button>
                      )}
                      {c.status !== 'resolved' && <button className="btn btn-green btn-sm">{t('dash.resolve')}</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">{t('district.statusChart')}</h3>
          <div className="chart-container"><StatusPieChart data={districtComplaints} /></div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">{t('district.categoryChart')}</h3>
          <div className="chart-container"><CategoryBarChart data={districtComplaints} /></div>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">{t('district.workloadChart')}</h3>
        <OfficerWorkloadChart />
      </div>
    </div>
  );
};

export default DistrictDashboard;
