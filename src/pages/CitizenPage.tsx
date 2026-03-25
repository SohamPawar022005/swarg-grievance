import { useState } from 'react';
import { announcements, importantLinks } from '@/data/mockData';

const CitizenPage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', category: 'water', title: '', description: '', location: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [trackedComplaint, setTrackedComplaint] = useState<null | { id: string; status: string; level: string }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleTrack = () => {
    if (trackingId.trim()) {
      setTrackedComplaint({ id: trackingId, status: 'Assigned', level: 'Local Authority' });
    }
  };

  return (
    <div className="page-content space-y">
      {/* Banner */}
      <div className="alert alert-info">
        <div className="flex items-start gap-3">
          <span style={{ fontSize: '20px' }}>📢</span>
          <div>
            <p className="font-semibold" style={{ color: 'var(--gov-navy)' }}>Government Notice</p>
            <p className="text-sm">
              All grievances are addressed as per the Centralised Public Grievance Redress and Monitoring System (CPGRAMS) guidelines.
              Response within 30 days is mandatory.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-3">
        <a href="#register" className="gov-card quick-action">
          <div className="quick-action-icon navy">📝</div>
          <div>
            <p className="font-semibold text-sm">Register Complaint</p>
            <p className="text-xs text-muted">File a new grievance</p>
          </div>
        </a>
        <a href="#track" className="gov-card quick-action">
          <div className="quick-action-icon saffron">🔍</div>
          <div>
            <p className="font-semibold text-sm">Track Complaint</p>
            <p className="text-xs text-muted">Check status by ID</p>
          </div>
        </a>
        <a href="tel:1800XXXXXXX" className="gov-card quick-action">
          <div className="quick-action-icon green">📞</div>
          <div>
            <p className="font-semibold text-sm">Call Support</p>
            <p className="text-xs text-muted">1800-XXX-XXXX (Toll Free)</p>
          </div>
        </a>
      </div>

      {/* Register Form */}
      <section id="register" className="gov-card">
        <h2 className="gov-section-title">Register a Complaint / Grievance</h2>
        {submitted ? (
          <div className="alert alert-success">
            <p className="font-semibold" style={{ color: 'var(--gov-green)' }}>Complaint Registered Successfully</p>
            <p className="text-sm">Your complaint ID: <strong>GRV-2025-009</strong>. Please save this for tracking.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" required className="form-input" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input type="tel" required className="form-input" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="water">Water Supply</option>
                  <option value="roads">Roads & Infrastructure</option>
                  <option value="health">Health</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="electricity">Electricity</option>
                  <option value="education">Education</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location / Area *</label>
                <input type="text" required className="form-input" placeholder="e.g., Ward 5, Varanasi"
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Complaint Title *</label>
              <input type="text" required className="form-input" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea required rows={4} className="form-textarea" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Submit Complaint</button>
          </form>
        )}
      </section>

      {/* Track */}
      <section id="track" className="gov-card">
        <h2 className="gov-section-title">Track Your Complaint</h2>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="form-label">Complaint ID</label>
            <input type="text" placeholder="e.g., GRV-2025-001" className="form-input"
              value={trackingId} onChange={(e) => setTrackingId(e.target.value)} />
          </div>
          <button onClick={handleTrack} className="btn btn-saffron" style={{ marginTop: '20px' }}>Track</button>
        </div>
        {trackedComplaint && (
          <div className="alert alert-info" style={{ marginTop: '16px' }}>
            <p className="text-sm"><strong>Complaint ID:</strong> {trackedComplaint.id}</p>
            <p className="text-sm"><strong>Status:</strong> {trackedComplaint.status}</p>
            <p className="text-sm"><strong>Current Level:</strong> {trackedComplaint.level}</p>
          </div>
        )}
      </section>

      {/* Announcements */}
      <section className="gov-card">
        <h2 className="gov-section-title">📢 Announcements</h2>
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

      {/* Links */}
      <section className="gov-card">
        <h2 className="gov-section-title">Important Links</h2>
        <div className="grid-3">
          {importantLinks.map((link, i) => (
            <a key={i} href={link.url} className="text-sm" style={{ color: 'var(--gov-navy)' }}>
              🔗 {link.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CitizenPage;
