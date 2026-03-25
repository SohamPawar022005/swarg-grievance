import { importantLinks } from '@/data/mockData';

const GovFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-8">
      <div className="gov-saffron-bar" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Important Links</h3>
            <ul className="space-y-1">
              {importantLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.url} className="opacity-80 hover:opacity-100 hover:underline">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <p className="opacity-80">Toll Free: 1800-XXX-XXXX</p>
            <p className="opacity-80">Email: grievance@gov.in</p>
            <p className="opacity-80">Mon–Sat: 9:00 AM – 6:00 PM</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Disclaimer</h3>
            <p className="opacity-80 text-xs leading-relaxed">
              This is a demonstration system built for governance training purposes.
              All data shown is synthetic and does not represent real complaints or officers.
            </p>
          </div>
        </div>
        <div className="border-t border-white/20 mt-6 pt-4 text-center text-xs opacity-60">
          © 2025 Government of India — AI Governance System. All rights reserved.
        </div>
      </div>
      <div className="gov-green-bar" />
    </footer>
  );
};

export default GovFooter;
