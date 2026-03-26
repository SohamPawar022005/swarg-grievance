import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { complaints, getPriorityBadgeClass, getStatusBadgeClass } from '@/data/mockData';
import { CategoryBarChart } from '@/components/Charts';

const LocalDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const myComplaints = complaints.filter(c => c.currentLevel === 'local');
  const pending = myComplaints.filter(c => c.status === 'pending').length;
  const resolved = myComplaints.filter(c => c.status === 'resolved').length;
  const slaViolations = myComplaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved').length;

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        {t('local.title')} — {user?.location}
      </h2>

      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value">{myComplaints.length}</div>
          <div className="gov-kpi-label">{t('dash.totalComplaints')}</div>
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
        <h3 className="gov-section-title">{t('local.myComplaints')}</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('dash.id')}</th>
                <th>{t('dash.issue')}</th>
                <th>{t('dash.location')}</th>
                <th>{t('dash.priority')}</th>
                <th>{t('dash.status')}</th>
                <th>{t('dash.slaDeadline')}</th>
                <th>{t('dash.actions')}</th>
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
                      {c.status === 'pending' && <button className="btn btn-primary btn-sm">{t('dash.assign')}</button>}
                      {c.status !== 'resolved' && <button className="btn btn-green btn-sm">{t('dash.resolve')}</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">{t('local.categoryChart')}</h3>
        <div className="chart-container">
          <CategoryBarChart data={myComplaints} />
        </div>
      </div>
    </div>
  );
};

export default LocalDashboard;
