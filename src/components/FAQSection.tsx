/**
 * Author: Saad Kamal
 * Frequently asked questions with a small accessible disclosure interaction.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FAQSection.css';

/** Renders expandable FAQ content from the translation catalog. */
export function FAQSection() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq-section" id="faq">
      <div className="section">
        <div className="faq-section__header">
          <span className="section-label">{t('faq.label')}</span>
          <h2 className="section-title">{t('faq.title')}</h2>
        </div>

        <div className="faq-list">
          {items.map((item, i) => (
            <div
              key={i}
              className={`faq-item glass ${open === i ? 'faq-item--open' : ''}`}
            >
              <button
                className="faq-item__question"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <span className="faq-item__chevron">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="faq-item__answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
