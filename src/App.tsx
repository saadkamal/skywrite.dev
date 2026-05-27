/**
 * Author: Saad Kamal
 * Route shell for the Skywrite marketing page, drawing workspace, tutorial,
 * and calibration flow.
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import languages from './i18n/languages';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { GesturesSection } from './components/GesturesSection';
import { FAQSection } from './components/FAQSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import DrawingApp from './pages/DrawingApp';
import GestureTutorial from './pages/GestureTutorial';
import CameraCalibration from './pages/CameraCalibration';
import './index.css';

/** Renders the public landing page and keeps document language metadata current. */
function LandingPage() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const language = languages.find(item => item.code === i18n.resolvedLanguage) ?? languages[0];
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = language.dir;
  }, [i18n.language, i18n.resolvedLanguage]);

  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <GesturesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

/** Defines the browser routes available in the single-page application. */
function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/draw" element={<DrawingApp />} />
        <Route path="/tutorial" element={<GestureTutorial />} />
        <Route path="/calibrate" element={<CameraCalibration />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
