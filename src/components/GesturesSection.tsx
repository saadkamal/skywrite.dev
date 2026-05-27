/**
 * Author: Saad Kamal
 * Gesture reference section for the four drawing modes.
 */
import { useTranslation } from 'react-i18next';
import './GesturesSection.css';

const GESTURE_COLORS = ['rgba(255,255,255,0.3)', '#00d4ff', '#f59e0b', '#ef4444'];
const STATES = ['state::idle', 'state::draw', 'state::move', 'state::erase'];

/** Renders the gesture-state cards used by the landing page. */
export function GesturesSection() {
  const { t } = useTranslation();
  const items = t('gestures.items', { returnObjects: true }) as Array<{
    emoji: string; name: string; pose: string; desc: string;
  }>;

  return (
    <section className="gestures-section" id="gestures">
      <div className="section">
        <div className="gestures-section__header">
          <span className="section-label">{t('gestures.label')}</span>
          <h2 className="section-title">{t('gestures.title')}</h2>
          <p className="section-subtitle">{t('gestures.subtitle')}</p>
        </div>

        <div className="gestures-grid">
          {items.map((item, i) => (
            <div key={i} className="gesture-card"
              style={{ '--gcolor': GESTURE_COLORS[i] } as React.CSSProperties}>
              <div className="gesture-card__indicator" />
              <span className="gesture-card__state">{STATES[i]}</span>
              <div className="gesture-card__emoji">{item.emoji}</div>
              <div className="gesture-card__name" style={{ color: GESTURE_COLORS[i] }}>{item.name}</div>
              <div className="gesture-card__pose">{item.pose}</div>
              <p className="gesture-card__desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
