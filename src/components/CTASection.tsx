/**
 * Author: Saad Kamal
 * Closing call-to-action section for launching the app or setup flows.
 */
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './CTASection.css';

/** Renders the final landing-page action panel. */
export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="cta-section" id="cta">
      <div className="section">
        <div className="cta-card glass">
          <div className="cta-card__orb cta-card__orb--left" />
          <div className="cta-card__orb cta-card__orb--right" />
          <div className="cta-card__content">
            <div className="cta-card__left">
              <p className="cta-card__eyebrow">// ready to run</p>
              <h2 className="cta-card__title">{t('cta.title')}</h2>
              <p className="cta-card__subtitle">{t('cta.subtitle')}</p>
            </div>
            <div className="cta-card__actions">
              <Link to="/draw" className="btn-primary cta-card__btn">
                {t('cta.button')}
              </Link>
              <Link to="/calibrate" className="btn-secondary cta-card__btn">
                Camera setup
              </Link>
              <Link to="/tutorial" className="btn-secondary cta-card__btn">
                Gesture guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
