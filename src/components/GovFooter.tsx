import { importantLinks } from '@/data/mockData';

const GovFooter = () => (
  <footer className="gov-footer">
    <div className="saffron-bar" />
    <div className="gov-footer-inner">
      <div>
        <h3>Important Links</h3>
        <ul>
          {importantLinks.map((link, i) => (
            <li key={i}><a href={link.url}>{link.title}</a></li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Contact</h3>
        <p style={{ opacity: 0.8 }}>Toll Free: 1800-XXX-XXXX</p>
        <p style={{ opacity: 0.8 }}>Email: grievance@gov.in</p>
        <p style={{ opacity: 0.8 }}>Mon–Sat: 9:00 AM – 6:00 PM</p>
      </div>
      <div>
        <h3>Disclaimer</h3>
        <p style={{ opacity: 0.8, fontSize: '11px', lineHeight: '1.6' }}>
          This is a demonstration system built for governance training purposes.
          All data shown is synthetic and does not represent real complaints or officers.
        </p>
      </div>
    </div>
    <div className="gov-footer-bottom">
      © 2025 Government of India — AI Governance System. All rights reserved.
    </div>
    <div className="green-bar" />
  </footer>
);

export default GovFooter;
