import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Scheme, schemesData, filterSchemes, getUniqueMistries, getUniqueStates, getUniqueSchemeTypes } from '@/data/schemesData';
import { getSchemesBatch } from '@/services/schemes';

const SchemesDirectory = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isComplianceOfficer = user?.role === 'compliance';
  
  const [selectedMinistry, setSelectedMinistry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const [showAddSchemeModal, setShowAddSchemeModal] = useState<boolean>(false);
  const [directorySchemes, setDirectorySchemes] = useState<Scheme[]>(schemesData);
  const [loadingSchemes, setLoadingSchemes] = useState<boolean>(true);
  const [loadingMoreSchemes, setLoadingMoreSchemes] = useState<boolean>(false);
  const [schemesError, setSchemesError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const BATCH_SIZE = 50;
  const PAGE_SIZE = 100;

  useEffect(() => {
    const loadSchemes = async () => {
      setLoadingSchemes(true);
      setSchemesError('');

      try {
        let offset = 0;
        let allSchemes: Scheme[] = [];

        while (true) {
          setLoadingMoreSchemes(offset > 0);
          const batch = await getSchemesBatch(BATCH_SIZE, offset);

          if (batch.length === 0) {
            break;
          }

          allSchemes = [...allSchemes, ...batch];
          setDirectorySchemes(allSchemes);
          offset += BATCH_SIZE;

          if (batch.length < BATCH_SIZE) {
            break;
          }
        }
      } catch {
        setSchemesError('Unable to load schemes from server. Showing local dataset.');
      } finally {
        setLoadingSchemes(false);
        setLoadingMoreSchemes(false);
      }
    };

    loadSchemes();
  }, []);

  const ministries = useMemo(() => getUniqueMistries(directorySchemes), [directorySchemes]);
  const states = useMemo(() => getUniqueStates(directorySchemes), [directorySchemes]);
  const schemeTypes = useMemo(() => getUniqueSchemeTypes(directorySchemes), [directorySchemes]);

  const filteredSchemes = useMemo(
    () => filterSchemes(
      directorySchemes,
      selectedMinistry || undefined,
      selectedState || undefined,
      selectedType || undefined,
      selectedBeneficiary || undefined,
      searchTerm || undefined
    ),
    [directorySchemes, selectedMinistry, selectedState, selectedType, selectedBeneficiary, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredSchemes.length / PAGE_SIZE));

  const paginatedSchemes = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredSchemes.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredSchemes, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMinistry, selectedState, selectedType, selectedBeneficiary, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleReset = () => {
    setSelectedMinistry('');
    setSelectedState('');
    setSelectedType('');
    setSelectedBeneficiary('');
    setSearchTerm('');
  };

  const SchemeCard = ({ scheme }: { scheme: Scheme }) => {
    const isExpanded = expandedScheme === scheme.id;

    return (
      <div className="gov-card schemes-card" style={{ marginBottom: '16px' }}>
        <div onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)} style={{ cursor: 'pointer' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="scheme-badge">{scheme.scheme_type}</span>
                <span className="scheme-badge state-badge">{scheme.state}</span>
              </div>
              <h3 className="scheme-title" style={{ color: 'var(--gov-navy)' }}>
                {scheme.scheme_name}
              </h3>
              <p className="text-sm text-muted" style={{ marginBottom: '8px' }}>
                {scheme.scheme_slug}
              </p>
              <p className="text-sm" style={{ lineHeight: '1.5', marginBottom: '8px', maxHeight: isExpanded ? 'none' : '50px', overflow: 'hidden' }}>
                {scheme.description}
              </p>
              {!isExpanded && (
                <div className="scheme-tags">
                  {scheme.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                  {scheme.tags.length > 3 && <span className="tag">+{scheme.tags.length - 3}</span>}
                </div>
              )}
            </div>
            <div style={{ fontSize: '24px', marginLeft: '16px' }}>
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div className="scheme-details-grid">
              <div className="detail-section">
                <h4 className="detail-title">{t('scheme.benefits')}</h4>
                <p className="detail-text">{scheme.benefits}</p>
              </div>
              <div className="detail-section">
                <h4 className="detail-title">{t('scheme.eligibility')}</h4>
                <p className="detail-text">{scheme.eligibility}</p>
              </div>
              <div className="detail-section">
                <h4 className="detail-title">{t('scheme.applicationProcess')}</h4>
                <p className="detail-text">{scheme.application_process}</p>
              </div>
              <div className="detail-section">
                <h4 className="detail-title">{t('scheme.documentation')}</h4>
                <ul className="detail-list">
                  {scheme.documents_required.map((doc, i) => (
                    <li key={i}>• {doc}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-section">
                <h4 className="detail-title">{t('scheme.targetBeneficiaries')}</h4>
                <p className="detail-text">{scheme.target_beneficiaries}</p>
              </div>
              <div className="detail-section">
                <h4 className="detail-title">{t('scheme.ministry')}</h4>
                <p className="detail-text">{scheme.ministry}</p>
              </div>
            </div>

            {scheme.website_url && (
              <div style={{ marginTop: '16px' }}>
                <a href={scheme.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-navy" style={{ fontSize: '14px' }}>
                  {t('scheme.visitWebsite')} →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    
    <section className="gov-card schemes-directory">
      <h2 className="gov-section-title">{t('scheme.directory')}</h2>

      {/* Filters Section */}
      <div className="filters-section" style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-light)', borderRadius: '8px' }}>
        <div className="flex justify-between items-center mb-3">
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gov-navy)' }}>
            {t('scheme.filterSchemes')}
          </h3>
          {(selectedMinistry || selectedState || selectedType || selectedBeneficiary || searchTerm) && (
            <button onClick={handleReset} className="btn-text" style={{ fontSize: '12px', color: 'var(--gov-saffron)' }}>
              ✕ {t('scheme.clearFilters')}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder={t('scheme.searchPlaceholder')}
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid-4" style={{ gap: '12px' }}>
          {/* Ministry Filter */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px' }}>{t('scheme.filterMinistry')}</label>
            <select
              className="form-select"
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="">{t('scheme.allMinistries')}</option>
              {ministries.map(ministry => (
                <option key={ministry} value={ministry}>{ministry}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px' }}>{t('scheme.filterState')}</label>
            <select
              className="form-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="">{t('scheme.allStates')}</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Scheme Type Filter */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px' }}>{t('scheme.filterSchemeType')}</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="">{t('scheme.allTypes')}</option>
              {schemeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Beneficiary Filter */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px' }}>{t('scheme.filterBeneficiary')}</label>
            <input
              type="text"
              placeholder={t('scheme.beneficiaryPlaceholder')}
              className="form-input"
              value={selectedBeneficiary}
              onChange={(e) => setSelectedBeneficiary(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{ marginBottom: '16px', padding: '8px 0' }}>
        {loadingSchemes && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Loading schemes...
          </p>
        )}
        {schemesError && (
          <p className="text-sm" style={{ color: '#b45309', marginBottom: '8px' }}>
            {schemesError}
          </p>
        )}
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('scheme.showingResults')}: <strong>{filteredSchemes.length}</strong> {t('scheme.of')} <strong>{directorySchemes.length}</strong>
        </p>
      </div>

      {/* Schemes List */}
      <div>
        {filteredSchemes.length > 0 ? (
          paginatedSchemes.map((scheme: Scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))
        ) : (
          <div className="alert alert-info" style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>🔍</p>
            <p className="font-semibold">{t('scheme.noResultsFound')}</p>
            <p className="text-sm text-muted">{t('scheme.tryChangingFilters')}</p>
          </div>
        )}
      </div>

      {filteredSchemes.length > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '12px' }}>
          <button
            className="btn btn-outline"
            style={{ fontSize: '12px' }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Page {currentPage} of {totalPages} (100 schemes per page)
          </p>
          <button
            className="btn btn-outline"
            style={{ fontSize: '12px' }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Compliance Officer Add Scheme Button */}
      {isComplianceOfficer && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9f3e6', borderRadius: '8px', border: '2px solid var(--gov-saffron)' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--gov-navy)' }}>
            🔐 {t('scheme.complianceOfficerAccess') || 'Compliance Officer Access'}
          </div>
          <button
            onClick={() => setShowAddSchemeModal(true)}
            style={{
              backgroundColor: 'var(--gov-saffron)',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            + {t('scheme.addNewScheme') || 'Add New Scheme'}
          </button>
        </div>
      )}

      {/* Add Scheme Modal - Only for Compliance Officers */}
      {isComplianceOfficer && showAddSchemeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--gov-navy)', margin: 0 }}>
                🔐 {t('scheme.addNewScheme') || 'Add New Scheme'}
              </h3>
              <button
                onClick={() => setShowAddSchemeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            
            <ComplianceOfficerSchemeForm
              onClose={() => setShowAddSchemeModal(false)}
              onSubmit={() => setShowAddSchemeModal(false)}
              t={t}
            />
          </div>
        </div>
      )}

      {/* Unauthorized Message for Non-Compliance Officers */}
      {!isComplianceOfficer && user && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '8px', border: '1px solid #ddd' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            ℹ️ {t('scheme.onlyComplianceCanAdd') || 'Only Compliance Officers can add or manage schemes.'}
          </p>
        </div>
      )}
    </section>
  );
};

interface ComplianceOfficerSchemeFormProps {
  onClose: () => void;
  onSubmit: () => void;
  t: (key: string) => string;
}

const ComplianceOfficerSchemeForm: React.FC<ComplianceOfficerSchemeFormProps> = ({ onClose, onSubmit, t }) => {
  const [formData, setFormData] = useState({
    scheme_name: '',
    scheme_slug: '',
    ministry: '',
    state: '',
    scheme_type: 'Business & Entrepreneurship',
    description: '',
    benefits: '',
    eligibility: '',
    application_process: '',
    documents_required: '',
    target_beneficiaries: '',
    website_url: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scheme_name || !formData.scheme_slug || !formData.ministry || !formData.state) {
      alert('Please fill all required fields');
      return;
    }
    alert('✅ Scheme added successfully!\n\nNote: Currently showing mock submission.\nConnect to Neon PostgreSQL for persistence.');
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Scheme Name *</label>
        <input
          type="text"
          name="scheme_name"
          required
          className="form-input"
          value={formData.scheme_name}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Scheme Slug *</label>
          <input
            type="text"
            name="scheme_slug"
            required
            className="form-input"
            value={formData.scheme_slug}
            onChange={handleInputChange}
            style={{ fontSize: '13px', width: '100%' }}
            placeholder="e.g., LRSGD"
          />
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>State *</label>
          <input
            type="text"
            name="state"
            required
            className="form-input"
            value={formData.state}
            onChange={handleInputChange}
            style={{ fontSize: '13px', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Ministry *</label>
          <input
            type="text"
            name="ministry"
            required
            className="form-input"
            value={formData.ministry}
            onChange={handleInputChange}
            style={{ fontSize: '13px', width: '100%' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Scheme Type *</label>
          <select
            name="scheme_type"
            className="form-select"
            value={formData.scheme_type}
            onChange={handleInputChange}
            style={{ fontSize: '13px', width: '100%' }}
          >
            <option>Business & Entrepreneurship</option>
            <option>Social Welfare</option>
            <option>Skills & Employment</option>
            <option>Banking & Finance</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Description *</label>
        <textarea
          name="description"
          required
          className="form-textarea"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Benefits *</label>
        <textarea
          name="benefits"
          required
          className="form-textarea"
          rows={2}
          value={formData.benefits}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Eligibility *</label>
        <textarea
          name="eligibility"
          required
          className="form-textarea"
          rows={2}
          value={formData.eligibility}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Application Process *</label>
        <textarea
          name="application_process"
          required
          className="form-textarea"
          rows={2}
          value={formData.application_process}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Required Documents</label>
        <textarea
          name="documents_required"
          className="form-textarea"
          rows={2}
          placeholder="Separate documents with commas"
          value={formData.documents_required}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Target Beneficiaries</label>
        <input
          type="text"
          name="target_beneficiaries"
          className="form-input"
          value={formData.target_beneficiaries}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>Official Website URL</label>
        <input
          type="url"
          name="website_url"
          className="form-input"
          value={formData.website_url}
          onChange={handleInputChange}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--gov-navy)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          Add Scheme
        </button>
      </div>
    </form>
  );
};

export default SchemesDirectory;

const styles = `
  .schemes-directory {
    max-width: 100%;
  }

  .filters-section {
    border: 1px solid var(--border-color);
  }

  .scheme-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .schemes-card {
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
  }

  .schemes-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .scheme-badge {
    display: inline-block;
    padding: 4px 8px;
    background-color: var(--gov-navy);
    color: white;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
    margin-right: 4px;
  }

  .scheme-badge.state-badge {
    background-color: var(--gov-saffron);
  }

  .scheme-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .tag {
    display: inline-block;
    padding: 3px 8px;
    background-color: #f0f0f0;
    color: #666;
    font-size: 11px;
    border-radius: 3px;
    border: 1px solid #ddd;
  }

  .scheme-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .detail-section {
    padding: 12px 0;
  }

  .detail-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--gov-navy);
    margin: 0 0 8px 0;
    text-transform: uppercase;
  }

  .detail-text {
    font-size: 13px;
    line-height: 1.6;
    color: #333;
    margin: 0;
  }

  .detail-list {
    font-size: 13px;
    line-height: 1.8;
    color: #333;
    margin: 0;
    padding-left: 0;
    list-style: none;
  }

  .detail-list li {
    margin: 4px 0;
  }

  .btn-text {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-weight: 600;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  @media (max-width: 768px) {
    .scheme-details-grid {
      grid-template-columns: 1fr;
    }

    .grid-4 {
      grid-template-columns: 1fr;
    }
  }
`;

// Append styles to document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}
