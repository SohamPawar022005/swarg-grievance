import { useState } from 'react';
import { FileText, Search, Phone, Megaphone, ExternalLink } from 'lucide-react';
import { announcements, importantLinks } from '@/data/mockData';

const CitizenPage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', category: 'water', title: '', description: '', location: '' });
  const [submitted, setSubmitted] = useState(false);
  const [trackedComplaint, setTrackedComplaint] = useState<null | { id: string; status: string; level: string }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleTrack = () => {
    if (trackingId.trim()) {
      setTrackedComplaint({
        id: trackingId,
        status: 'Assigned',
        level: 'Local Authority',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="gov-info">
        <div className="flex items-start gap-3">
          <Megaphone className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold text-primary">Government Notice</p>
            <p className="text-sm text-foreground">
              All grievances are addressed as per the Centralised Public Grievance Redress and Monitoring System (CPGRAMS) guidelines.
              Response within 30 days is mandatory.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="#register" className="gov-card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Register Complaint</p>
            <p className="text-xs text-muted-foreground">File a new grievance</p>
          </div>
        </a>
        <a href="#track" className="gov-card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded bg-gov-saffron flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Track Complaint</p>
            <p className="text-xs text-muted-foreground">Check status by ID</p>
          </div>
        </a>
        <a href="tel:1800XXXXXXX" className="gov-card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded bg-gov-green flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Call Support</p>
            <p className="text-xs text-muted-foreground">1800-XXX-XXXX (Toll Free)</p>
          </div>
        </a>
      </div>

      {/* Register Complaint Form */}
      <section id="register" className="gov-card">
        <h2 className="gov-section-title">Register a Complaint / Grievance</h2>
        {submitted ? (
          <div className="gov-info">
            <p className="font-semibold text-primary">Complaint Registered Successfully</p>
            <p className="text-sm">Your complaint ID: <strong>GRV-2025-009</strong>. Please save this for tracking.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                required
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="water">Water Supply</option>
                <option value="roads">Roads & Infrastructure</option>
                <option value="health">Health</option>
                <option value="sanitation">Sanitation</option>
                <option value="electricity">Electricity</option>
                <option value="education">Education</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location / Area *</label>
              <input
                type="text"
                required
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
                placeholder="e.g., Ward 5, Varanasi"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Complaint Title *</label>
              <input
                type="text"
                required
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                required
                rows={4}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="gov-btn-primary">
                Submit Complaint
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Track Complaint */}
      <section id="track" className="gov-card">
        <h2 className="gov-section-title">Track Your Complaint</h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Complaint ID</label>
            <input
              type="text"
              placeholder="e.g., GRV-2025-001"
              className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
          </div>
          <button onClick={handleTrack} className="gov-btn-secondary">
            Track
          </button>
        </div>
        {trackedComplaint && (
          <div className="mt-4 gov-info">
            <p className="text-sm"><strong>Complaint ID:</strong> {trackedComplaint.id}</p>
            <p className="text-sm"><strong>Status:</strong> {trackedComplaint.status}</p>
            <p className="text-sm"><strong>Current Level:</strong> {trackedComplaint.level}</p>
          </div>
        )}
      </section>

      {/* Announcements */}
      <section className="gov-card">
        <h2 className="gov-section-title">Announcements</h2>
        <ul className="space-y-2">
          {announcements.map((a) => (
            <li key={a.id} className="flex items-start gap-2 text-sm">
              <Megaphone className="w-4 h-4 mt-0.5 text-gov-saffron flex-shrink-0" />
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Important Links */}
      <section className="gov-card">
        <h2 className="gov-section-title">Important Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {importantLinks.map((link, i) => (
            <a key={i} href={link.url} className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="w-3.5 h-3.5" />
              {link.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CitizenPage;
