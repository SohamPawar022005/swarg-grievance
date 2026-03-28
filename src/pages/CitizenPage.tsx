import { useState } from 'react';
import { announcements, importantLinks } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import SchemesDirectory from '@/components/SchemesDirectory';
import ComplaintTracker from '@/components/ComplaintTracker';
import { createComplaint } from '@/services/database';

const CitizenPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '', phone: '', category: 'water', title: '', description: '', location: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdSessionId, setCreatedSessionId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const transcript = [
      `Title: ${formData.title}`,
      `Description: ${formData.description}`,
      `Category: ${formData.category}`,
      `Location: ${formData.location}`,
      `Citizen: ${formData.name}`,
      `Phone: ${formData.phone}`,
    ].join(' | ');

    try {
      const complaint = await createComplaint({
        transcript,
        language_code: 'en',
        language_name: 'English',
        urgency_level: 'medium',
        urgency_score: 0.5,
        keywords: `${formData.category},${formData.location}`,
      });

      if (!complaint) {
        throw new Error('Unable to register complaint. Please try again.');
      }

      setCreatedSessionId(complaint.session_id);
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        category: 'water',
        title: '',
        description: '',
        location: '',
      });
      setTimeout(() => setSubmitted(false), 7000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content space-y">
      <div className="alert alert-info">
        <div className="flex items-start gap-3">
          <span style={{ fontSize: '20px' }}>📢</span>
          <div>
            <p className="font-semibold" style={{ color: 'var(--gov-navy)' }}>{t('citizen.notice.title')}</p>
            <p className="text-sm">{t('citizen.notice.text')}</p>
          </div>
        </div>
      </div>

      <div className="grid-3">
        <a href="#register" className="gov-card quick-action">
          <div className="quick-action-icon navy">📝</div>
          <div>
            <p className="font-semibold text-sm">{t('citizen.register')}</p>
            <p className="text-xs text-muted">{t('citizen.register.desc')}</p>
          </div>
        </a>
        <a href="#track" className="gov-card quick-action">
          <div className="quick-action-icon saffron">🔍</div>
          <div>
            <p className="font-semibold text-sm">{t('citizen.track')}</p>
            <p className="text-xs text-muted">{t('citizen.track.desc')}</p>
          </div>
        </a>
        <a href="tel:1800XXXXXXX" className="gov-card quick-action">
          <div className="quick-action-icon green">📞</div>
          <div>
            <p className="font-semibold text-sm">{t('citizen.call')}</p>
            <p className="text-xs text-muted">{t('citizen.call.desc')}</p>
          </div>
        </a>
      </div>

      <section id="register" className="gov-card">
        <h2 className="gov-section-title">{t('citizen.form.title')}</h2>
        {submitted ? (
          <div className="alert alert-success">
            <p className="font-semibold" style={{ color: 'var(--gov-green)' }}>{t('citizen.form.success')}</p>
            <p className="text-sm">{t('citizen.form.successId')} {createdSessionId ? `(${createdSessionId})` : ''}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div className="alert alert-danger" style={{ marginBottom: '12px' }}>
                <p className="text-sm">{submitError}</p>
              </div>
            )}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('citizen.form.name')}</label>
                <input type="text" required className="form-input" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('citizen.form.phone')}</label>
                <input type="tel" required className="form-input" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('citizen.form.category')}</label>
                <select className="form-select" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="water">{t('citizen.cat.water')}</option>
                  <option value="roads">{t('citizen.cat.roads')}</option>
                  <option value="health">{t('citizen.cat.health')}</option>
                  <option value="sanitation">{t('citizen.cat.sanitation')}</option>
                  <option value="electricity">{t('citizen.cat.electricity')}</option>
                  <option value="education">{t('citizen.cat.education')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('citizen.form.location')}</label>
                <input type="text" required className="form-input" placeholder={t('citizen.form.locationPlaceholder')}
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('citizen.form.complaintTitle')}</label>
              <input type="text" required className="form-input" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('citizen.form.description')}</label>
              <textarea required rows={4} className="form-textarea" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : t('citizen.form.submit')}
            </button>
          </form>
        )}
      </section>

      <section id="track" className="gov-card">
        <ComplaintTracker />
      </section>

      <section className="gov-card">
        <h2 className="gov-section-title">{t('citizen.announcements')}</h2>
        <div className="space-y-sm">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start gap-2 text-sm" style={{ padding: '4px 0' }}>
              <span style={{ color: 'var(--gov-saffron)' }}>●</span>
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gov-card">
        <h2 className="gov-section-title">{t('citizen.links')}</h2>
        <div className="grid-3">
          {importantLinks.map((link, i) => (
            <a key={i} href={link.url} className="text-sm" style={{ color: 'var(--gov-navy)' }}>
              🔗 {link.title}
            </a>
          ))}
        </div>
      </section>

      <SchemesDirectory />
    </div>
  );
};

export default CitizenPage;
