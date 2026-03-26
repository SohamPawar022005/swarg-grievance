import { useState } from 'react';
import { Complaint } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLevelLabel } from '@/data/mockData';

interface InvestigationModalProps {
  complaint: Complaint;
  onClose: () => void;
}

export const InvestigationModal = ({ complaint, onClose }: InvestigationModalProps) => {
  const { t } = useLanguage();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modal.investigation.title')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="debrief-grid">
            <div className="debrief-field">
              <span className="debrief-label">{t('modal.investigation.caseId')}</span>
              <span className="font-mono">{complaint.id}</span>
            </div>
            <div className="debrief-field">
              <span className="debrief-label">{t('modal.investigation.caseTitle')}</span>
              <span>{complaint.title}</span>
            </div>
            <div className="debrief-field">
              <span className="debrief-label">{t('modal.investigation.currentLevel')}</span>
              <span>{getLevelLabel(complaint.currentLevel)}</span>
            </div>
            <div className="debrief-field">
              <span className="debrief-label">{t('modal.investigation.priority')}</span>
              <span className="capitalize">{complaint.priority}</span>
            </div>
            <div className="debrief-field">
              <span className="debrief-label">{t('modal.investigation.status')}</span>
              <span className="capitalize">{complaint.status}</span>
            </div>
          </div>

          <div className="debrief-section">
            <h4>{t('modal.investigation.description')}</h4>
            <p className="text-sm">{complaint.description}</p>
          </div>

          <div className="debrief-section">
            <h4>{t('modal.investigation.escalationTimeline')}</h4>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot created" />
                <div className="timeline-content">
                  <span className="font-semibold text-sm">Created</span>
                  <span className="text-xs text-muted">{new Date(complaint.createdAt).toLocaleString('en-IN')}</span>
                  <span className="text-xs">{complaint.location.area}, {complaint.location.district}</span>
                </div>
              </div>
              {complaint.escalationHistory.map((e, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot escalated" />
                  <div className="timeline-content">
                    <span className="font-semibold text-sm">{getLevelLabel(e.from)} → {getLevelLabel(e.to)}</span>
                    <span className="text-xs text-muted">{new Date(e.timestamp).toLocaleString('en-IN')}</span>
                    <span className="text-xs">{e.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="debrief-section">
            <h4>{t('modal.investigation.findings')}</h4>
            <div className="findings-box">
              <p className="text-sm">{t('modal.investigation.findingsText')}</p>
              <ul className="findings-list">
                <li>{t('modal.investigation.delay')}</li>
                <li>{t('modal.investigation.escalation')}</li>
                <li>{t('modal.investigation.action')}</li>
              </ul>
            </div>
          </div>

          <div className="debrief-section">
            <h4>{t('modal.investigation.recommendation')}</h4>
            <div className="recommendation-box">
              <p className="text-sm">{t('modal.investigation.recommendationText')}</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>{t('modal.close')}</button>
        </div>
      </div>
    </div>
  );
};

interface FlagModalProps {
  complaint: Complaint;
  onClose: () => void;
}

export const FlagModal = ({ complaint, onClose }: FlagModalProps) => {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header modal-header-danger">
          <h2>{t('modal.flag.title')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="notice-box notice-danger">
            <div className="notice-stamp">{t('modal.flag.notice')}</div>
            <h3>{t('modal.flag.header')}</h3>
            <p className="text-sm"><strong>{t('modal.flag.regarding')}:</strong> {complaint.id} — {complaint.title}</p>
            <hr className="notice-hr" />
            <p className="text-sm">{t('modal.flag.body')}</p>
            <ul className="notice-reasons">
              <li>{t('modal.flag.reason1')}</li>
              <li>{t('modal.flag.reason2')}</li>
              <li>{t('modal.flag.reason3')}</li>
            </ul>
            <p className="text-sm" style={{ marginTop: '12px' }}>{t('modal.flag.consequence')}</p>
            <div className="notice-action">{t('modal.flag.action')}</div>
          </div>
          {sent && (
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              {t('modal.flag.sent')}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {!sent ? (
            <button className="btn btn-danger" onClick={() => setSent(true)}>⚑ Send Flag Notice</button>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>{t('modal.close')}</button>
          )}
        </div>
      </div>
    </div>
  );
};

interface VigilanceModalProps {
  complaint: Complaint;
  onClose: () => void;
}

export const VigilanceModal = ({ complaint, onClose }: VigilanceModalProps) => {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header modal-header-warning">
          <h2>{t('modal.vigilance.title')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="notice-box notice-warning">
            <div className="notice-stamp">{t('modal.vigilance.notice')}</div>
            <h3>{t('modal.vigilance.header')}</h3>
            <p className="text-sm"><strong>{t('modal.vigilance.regarding')}:</strong> {complaint.id} — {complaint.title}</p>
            <hr className="notice-hr" />
            <p className="text-sm">{t('modal.vigilance.body')}</p>
            <ol className="notice-actions-list">
              <li>{t('modal.vigilance.action1').replace('1. ', '')}</li>
              <li>{t('modal.vigilance.action2').replace('2. ', '')}</li>
              <li>{t('modal.vigilance.action3').replace('3. ', '')}</li>
              <li>{t('modal.vigilance.action4').replace('4. ', '')}</li>
            </ol>
            <div className="notice-warning-box">{t('modal.vigilance.warning')}</div>
            <div className="notice-deadline">{t('modal.vigilance.deadline')}</div>
          </div>
          {sent && (
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              {t('modal.vigilance.sent')}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {!sent ? (
            <button className="btn btn-saffron" onClick={() => setSent(true)}>🔒 Send Vigilance Notice</button>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>{t('modal.close')}</button>
          )}
        </div>
      </div>
    </div>
  );
};
