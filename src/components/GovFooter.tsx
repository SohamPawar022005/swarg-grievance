import { importantLinks } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

const GovFooter = () => {
  const { t } = useLanguage();
  return (
    <footer className="gov-footer">
      <div className="saffron-bar" />
      <div className="gov-footer-inner">
        <div>
          <h3>{t('footer.links')}</h3>
          <ul>
            {importantLinks.map((link, i) => (
              <li key={i}><a href={link.url}>{link.title}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3>{t('footer.contact')}</h3>
          <p style={{ opacity: 0.8 }}>{t('footer.tollFree')}</p>
          <p style={{ opacity: 0.8 }}>{t('footer.email')}</p>
          <p style={{ opacity: 0.8 }}>{t('footer.hours')}</p>
        </div>
        <div>
          <h3>{t('footer.disclaimer')}</h3>
          <p style={{ opacity: 0.8, fontSize: '11px', lineHeight: '1.6' }}>
            {t('footer.disclaimerText')}
          </p>
        </div>
      </div>
      <div className="gov-footer-bottom">
        {t('footer.copyright')}
      </div>
      <div className="green-bar" />
    </footer>
  );
};

export default GovFooter;
