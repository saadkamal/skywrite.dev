/**
 * Author: Saad Kamal
 * Capability cards describing Skywrite's browser-native drawing features.
 */
import { useTranslation } from 'react-i18next';
import './FeaturesSection.css';

const ICONS = ['◎', '▣', '⌖', '⬡', '⊞', '◈'];
const ACCENTS = [
  'var(--accent-cyan)', 'var(--accent-magenta)', 'var(--accent-lime)',
  'var(--accent-blue)', 'var(--accent-gold)',    'var(--accent-purple)',
];

/** Renders feature cards from the translation catalog. */
export function FeaturesSection() {
  const { t } = useTranslation();
  const items = t('features.items', { returnObjects: true }) as Array<{ title: string; desc: string }>;

  return (
    <section className="features-section" id="features">
      <div className="section">
        <div className="features-section__header">
          <span className="section-label">{t('features.label')}</span>
          <h2 className="section-title">{t('features.title')}</h2>
          <p className="section-subtitle">{t('features.subtitle')}</p>
        </div>

        <div className="features-grid">
          {items.map((item, i) => (
            <div key={i} className="feature-card"
              style={{ '--accent': ACCENTS[i] } as React.CSSProperties}>
              <span className="feature-card__index">[ {String(i + 1).padStart(2, '0')} ]</span>
              <span className="feature-card__icon">{ICONS[i]}</span>
              <h3 className="feature-card__title">{item.title}</h3>
              <p className="feature-card__desc">{item.desc}</p>
              <div className="feature-card__accent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
