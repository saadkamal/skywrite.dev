/**
 * Author: Saad Kamal
 * Responsive landing-page header and navigation.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Header.css';

/** Renders the sticky header, desktop nav, mobile menu, and launch CTA. */
export function Header() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    /** Keeps the header compact after the user begins scrolling. */
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#features',     label: 'features' },
    { href: '#how-it-works', label: 'architecture' },
    { href: '#gestures',     label: 'gestures' },
    { href: '#faq',          label: 'faq' },
  ];

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <a href="#" className="header__logo">
          <span className="header__logo-icon">◆</span>
          <span className="header__logo-text">skywrite</span>
          <span className="header__logo-version">v0.1</span>
        </a>

        <nav className="header__nav">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className="header__nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <Link to="/draw" className="btn-primary header__cta">
            {t('nav.tryNow')}
          </Link>
          <button
            className="header__burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
          >
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="header__mobile-menu" id="site-mobile-menu">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className="header__mobile-link"
              onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link to="/draw" className="btn-primary" onClick={() => setMenuOpen(false)}>
            {t('nav.tryNow')}
          </Link>
        </div>
      )}
    </header>
  );
}
