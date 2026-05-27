/**
 * Author: Saad Kamal
 * Footer navigation and project attribution.
 */
import { useTranslation } from 'react-i18next';
import './Footer.css';

/** Renders secondary navigation and copyright attribution. */
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-icon">◆</span>
            <span className="footer__logo-text">skywrite</span>
          </div>
          <span className="footer__tagline">// gesture drawing · browser-native · authored by Saad Kamal</span>
        </div>

        <nav className="footer__links">
          <a href="#features"     className="footer__link">features</a>
          <a href="#gestures"     className="footer__link">gestures</a>
          <a href="#how-it-works" className="footer__link">architecture</a>
          <a href="#faq"          className="footer__link">faq</a>
          <a href="https://github.com/saadkamal/skywrite.dev" className="footer__link" target="_blank" rel="noopener noreferrer">github</a>
        </nav>

        <p className="footer__copy">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
