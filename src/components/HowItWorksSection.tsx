/**
 * Author: Saad Kamal
 * Architecture explainer for the capture, inference, classification, and render pipeline.
 */
import { useTranslation } from 'react-i18next';
import './HowItWorksSection.css';

/** Renders the pipeline steps and canvas layering diagram. */
export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = t('howItWorks.steps', { returnObjects: true }) as Array<{ num: string; title: string; desc: string }>;

  return (
    <section className="hiw-section" id="how-it-works">
      <div className="section">
        <div className="hiw-section__header">
          <span className="section-label">{t('howItWorks.label')}</span>
          <h2 className="section-title">{t('howItWorks.title')}</h2>
          <p className="section-subtitle">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="hiw-steps">
          {steps.map((step, i) => (
            <div key={i} className="hiw-step">
              <div className="hiw-step__connector" />
              <span className="hiw-step__num">step_{String(i + 1).padStart(2, '0')}</span>
              <h3 className="hiw-step__title">{step.title}</h3>
              <p className="hiw-step__desc">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="hiw-diagram">
          <div className="hiw-layer hiw-layer--ui">
            <span className="hiw-layer__label">ui_canvas</span>
            <span className="hiw-layer__desc">hand skeleton · cursor ring · HUD overlay</span>
            <span className="hiw-layer__z">z-index: 3</span>
          </div>
          <div className="hiw-layer hiw-layer--drawing">
            <span className="hiw-layer__label">drawing_canvas</span>
            <span className="hiw-layer__desc">committed strokes · active path</span>
            <span className="hiw-layer__z">z-index: 2</span>
          </div>
          <div className="hiw-layer hiw-layer--camera">
            <span className="hiw-layer__label">camera_canvas</span>
            <span className="hiw-layer__desc">webcam feed · α = 0.5 · mirrored</span>
            <span className="hiw-layer__z">z-index: 1</span>
          </div>
        </div>
      </div>
    </section>
  );
}
