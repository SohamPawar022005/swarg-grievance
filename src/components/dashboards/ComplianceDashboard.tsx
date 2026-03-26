import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  complaints, auditLogs, aiInsights, users,
  getPriorityBadgeClass, getStatusBadgeClass, getLevelLabel,
  Complaint,
} from '@/data/mockData';
import {
  CategoryBarChart, StatusPieChart, DistrictComparisonChart,
  TrendAreaChart, PriorityPieChart,
} from '@/components/Charts';
import MapboxGlobe from '@/components/MapboxGlobe';
import AuditLogDirectory from '@/components/AuditLogDirectory';
import { InvestigationModal, FlagModal, VigilanceModal } from '@/components/ActionModals';

const ComplianceDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const allComplaints = complaints;
  const escalatedComplaints = complaints.filter(c => c.status === 'escalated');
  const slaBreaches = complaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== 'resolved');
  const avgResponseHours = 48;
  const complianceScore = 72;
  const allOfficers = users.filter(u => u.role !== 'citizen' && u.role !== 'compliance');

  const [investigateCase, setInvestigateCase] = useState<Complaint | null>(null);
  const [flagCase, setFlagCase] = useState<Complaint | null>(null);
  const [vigilanceCase, setVigilanceCase] = useState<Complaint | null>(null);

  return (
    <div className="page-content space-y">
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
        {t('compliance.title')}
      </h2>
      <p className="text-sm text-muted">
        {t('compliance.supervising')} — {user?.name}, {user?.department}
      </p>

      {/* KPIs */}
      <div className="grid-4">
        <div className="gov-kpi">
          <div className="gov-kpi-value danger">{slaBreaches.length}</div>
          <div className="gov-kpi-label">{t('compliance.slaBreaches')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{avgResponseHours}h</div>
          <div className="gov-kpi-label">{t('compliance.avgResponse')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value" style={{ color: complianceScore < 75 ? 'var(--gov-danger)' : 'var(--gov-navy)' }}>
            {complianceScore}%
          </div>
          <div className="gov-kpi-label">{t('compliance.complianceScore')}</div>
        </div>
        <div className="gov-kpi">
          <div className="gov-kpi-value">{allComplaints.length}</div>
          <div className="gov-kpi-label">{t('dash.totalComplaints')}</div>
        </div>
      </div>

      {/* Map */}
      <div className="gov-card">
        <h3 className="gov-section-title">{t('compliance.map')}</h3>
        <MapboxGlobe />
      </div>

      {/* AI Insights */}
      <div className="gov-card">
        <h3 className="gov-section-title">{t('compliance.aiInsights')}</h3>
        <div className="space-y-sm">
          {aiInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm" style={{ padding: '4px 0' }}>
              <span style={{ color: 'var(--gov-saffron)', fontWeight: 700 }}>▸</span>
              {insight}
            </div>
          ))}
        </div>
      </div>

      {/* Officers */}
      <div className="gov-card">
        <h3 className="gov-section-title">{t('compliance.officerSupervision')}</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('dash.officer')}</th>
                <th>{t('compliance.role')}</th>
                <th>{t('dash.location')}</th>
                <th>{t('dash.department')}</th>
                <th>{t('compliance.cases')}</th>
                <th>{t('compliance.slaBreaches')}</th>
                <th>{t('dash.performance')}</th>
                <th>{t('dash.actions')}</th>
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
                      {breaches === 0 ? t('dash.good') : breaches <= 1 ? 'Warning' : t('dash.poor')}
                    </td>
                    <td>
                      {breaches > 0 && (
                        <div className="flex gap-1">
                          <button className="btn btn-danger btn-sm"
                            onClick={() => setFlagCase(assigned.find(c => c.status !== 'resolved') || null)}>
                            {t('compliance.flagOfficer')}
                          </button>
                          <button className="btn btn-primary btn-sm"
                            onClick={() => setInvestigateCase(assigned[0] || null)}>
                            {t('compliance.investigate')}
                          </button>
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

      {/* Escalated */}
      <div className="gov-card">
        <h3 className="gov-section-title">{t('compliance.escalatedComplaints')}</h3>
        {escalatedComplaints.length === 0 ? (
          <p className="text-sm text-muted">{t('compliance.noEscalated')}</p>
        ) : (
          <div className="table-wrap">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>{t('dash.id')}</th>
                  <th>{t('dash.issue')}</th>
                  <th>{t('dash.priority')}</th>
                  <th>{t('compliance.currentLevel')}</th>
                  <th>{t('compliance.escalationHistory')}</th>
                  <th>{t('dash.actions')}</th>
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
                        <button className="btn btn-danger btn-sm" onClick={() => setFlagCase(c)}>
                          {t('compliance.flagOfficer')}
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setInvestigateCase(c)}>
                          {t('compliance.investigate')}
                        </button>
                        <button className="btn btn-saffron btn-sm" onClick={() => setVigilanceCase(c)}>
                          {t('compliance.sendVigilance')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Directory */}
      <div className="gov-card">
        <h3 className="gov-section-title">{t('compliance.auditLog')}</h3>
        <AuditLogDirectory logs={auditLogs} />
      </div>

      {/* SLA Breach Report */}
      <div className="gov-card">
        <h3 className="gov-section-title">{t('compliance.slaReport')}</h3>
        <div className="table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('dash.id')}</th>
                <th>{t('dash.issue')}</th>
                <th>{t('dash.slaDeadline')}</th>
                <th>{t('compliance.daysOverdue')}</th>
                <th>{t('compliance.currentLevel')}</th>
                <th>{t('dash.status')}</th>
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

      {/* Charts */}
      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">{t('compliance.districtComparison')}</h3>
          <div className="chart-container"><DistrictComparisonChart data={allComplaints} /></div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">{t('compliance.trend')}</h3>
          <div className="chart-container"><TrendAreaChart /></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="gov-card">
          <h3 className="gov-section-title">{t('compliance.statusChart')}</h3>
          <div className="chart-container"><StatusPieChart data={allComplaints} /></div>
        </div>
        <div className="gov-card">
          <h3 className="gov-section-title">{t('compliance.priorityChart')}</h3>
          <div className="chart-container"><PriorityPieChart data={allComplaints} /></div>
        </div>
      </div>

      <div className="gov-card">
        <h3 className="gov-section-title">{t('compliance.categoryChart')}</h3>
        <div className="chart-container"><CategoryBarChart data={allComplaints} /></div>
      </div>

      {/* Modals */}
      {investigateCase && <InvestigationModal complaint={investigateCase} onClose={() => setInvestigateCase(null)} />}
      {flagCase && <FlagModal complaint={flagCase} onClose={() => setFlagCase(null)} />}
      {vigilanceCase && <VigilanceModal complaint={vigilanceCase} onClose={() => setVigilanceCase(null)} />}
    </div>
  );
};

export default ComplianceDashboard;
