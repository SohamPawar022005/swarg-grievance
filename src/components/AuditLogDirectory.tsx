import { useState } from 'react';
import { AuditLog } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuditDirectoryProps {
  logs: AuditLog[];
}

interface TreeNode {
  label: string;
  children?: TreeNode[];
  logs?: AuditLog[];
}

const buildTree = (logs: AuditLog[]): TreeNode[] => {
  const years: Record<string, Record<string, AuditLog[]>> = {};

  logs.forEach(log => {
    const d = new Date(log.timestamp);
    const year = d.getFullYear().toString();
    const month = d.toLocaleString('en-IN', { month: 'long' });
    if (!years[year]) years[year] = {};
    if (!years[year][month]) years[year][month] = [];
    years[year][month].push(log);
  });

  return Object.keys(years).sort().reverse().map(year => ({
    label: `📅 ${year}`,
    children: Object.keys(years[year]).map(month => {
      const monthLogs = years[year][month];
      // Group by state
      const states: Record<string, AuditLog[]> = {};
      monthLogs.forEach(log => {
        const state = 'Uttar Pradesh'; // from mock data
        if (!states[state]) states[state] = [];
        states[state].push(log);
      });

      return {
        label: `📁 ${month}`,
        children: Object.keys(states).map(state => {
          const stateLogs = states[state];
          // Group by district
          const districts: Record<string, AuditLog[]> = {};
          stateLogs.forEach(log => {
            // Extract district from complaint data
            const district = log.complaintId.includes('001') || log.complaintId.includes('005') || log.complaintId.includes('007')
              ? 'Varanasi'
              : log.complaintId.includes('004') || log.complaintId.includes('008')
                ? 'Kanpur'
                : 'Lucknow';
            if (!districts[district]) districts[district] = [];
            districts[district].push(log);
          });

          return {
            label: `🏛️ ${state}`,
            children: Object.keys(districts).map(district => {
              const districtLogs = districts[district];
              // Group by ward/area
              const wards: Record<string, AuditLog[]> = {};
              districtLogs.forEach(log => {
                const ward = log.complaintId.includes('001') ? 'Ward 5'
                  : log.complaintId.includes('005') ? 'Ward 8'
                    : log.complaintId.includes('007') ? 'Civil Lines'
                      : log.complaintId.includes('004') ? 'Kidwai Nagar'
                        : log.complaintId.includes('008') ? 'Ward 3'
                          : log.complaintId.includes('003') ? 'Ward 12'
                            : log.complaintId.includes('006') ? 'Gomti Nagar'
                              : 'Aminabad';
                if (!wards[ward]) wards[ward] = [];
                wards[ward].push(log);
              });

              return {
                label: `🏘️ ${district}`,
                children: Object.keys(wards).map(ward => ({
                  label: `📍 ${ward}`,
                  logs: wards[ward],
                })),
              };
            }),
          };
        }),
      };
    }),
  }));
};

const DirectoryNode = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
  const [open, setOpen] = useState(depth < 2);
  const { t } = useLanguage();
  const hasChildren = node.children && node.children.length > 0;
  const hasLogs = node.logs && node.logs.length > 0;

  return (
    <div className="dir-node" style={{ paddingLeft: `${depth * 16}px` }}>
      <button
        className={`dir-node-label ${open ? 'dir-open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className="dir-arrow">{(hasChildren || hasLogs) ? (open ? '▾' : '▸') : '  '}</span>
        {node.label}
        {hasLogs && <span className="dir-count">({node.logs!.length})</span>}
        {hasChildren && !hasLogs && (
          <span className="dir-count">
            ({node.children!.reduce((sum, c) => sum + (c.logs?.length || 0) + (c.children?.reduce((s, cc) => s + (cc.logs?.length || 0) + (cc.children?.reduce((ss, ccc) => ss + (ccc.logs?.length || 0) + (ccc.children?.reduce((sss, cccc) => sss + (cccc.logs?.length || 0), 0) || 0), 0) || 0), 0) || 0), 0)})
          </span>
        )}
      </button>
      {open && hasChildren && node.children!.map((child, i) => (
        <DirectoryNode key={i} node={child} depth={depth + 1} />
      ))}
      {open && hasLogs && (
        <div className="dir-logs" style={{ marginLeft: `${(depth + 1) * 16}px` }}>
          <table className="gov-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>{t('compliance.timestamp')}</th>
                <th>{t('compliance.actor')}</th>
                <th>{t('compliance.action')}</th>
                <th>{t('compliance.complaint')}</th>
                <th>{t('compliance.result')}</th>
              </tr>
            </thead>
            <tbody>
              {node.logs!.map(log => (
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
      )}
    </div>
  );
};

const AuditLogDirectory = ({ logs }: AuditDirectoryProps) => {
  const tree = buildTree(logs);
  return (
    <div className="audit-directory">
      {tree.map((node, i) => (
        <DirectoryNode key={i} node={node} />
      ))}
    </div>
  );
};

export default AuditLogDirectory;
