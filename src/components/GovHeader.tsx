import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';

const GovHeader = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { path: '/', label: 'Citizen Services' },
    { path: '/admin', label: 'Admin Dashboard' },
    { path: '/compliance', label: 'Compliance & Audit' },
  ];

  return (
    <header>
      <div className="gov-saffron-bar" />
      <div className="gov-header">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                भा
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold leading-tight">
                  AI-Powered Governance System
                </h1>
                <p className="text-xs opacity-80">Government of India — GIGW Compliant</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-1.5">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search by ID, keyword, location..."
                className="bg-transparent border-none outline-none text-sm placeholder-white/60 w-48 sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 pb-2">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`gov-nav-link ${
                  location.pathname === item.path ? 'bg-white/20 font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <div className="gov-green-bar" />
    </header>
  );
};

export default GovHeader;
