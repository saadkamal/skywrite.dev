/**
 * Author: Saad Kamal
 * Landing-page hero that explains Skywrite's local hand-tracking workflow and
 * offers entry points into drawing, calibration, and tutorial flows.
 */
import { Link } from 'react-router-dom';
import './HeroSection.css';

/** Renders the high-level product introduction and non-interactive demo art. */
export function HeroSection() {
  return (
    <section className="hero" id="hero">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__orb hero__orb--cyan"    aria-hidden="true" />
      <div className="hero__orb hero__orb--magenta" aria-hidden="true" />
      <div className="hero__orb hero__orb--lime"    aria-hidden="true" />

      {/* Meta row */}
      <div className="hero__meta">
        <span className="hero__tag hero__tag--highlight">Computer Vision</span>
        <span className="hero__tag-sep">/</span>
        <span className="hero__tag">MediaPipe Hands</span>
        <span className="hero__tag-sep">/</span>
        <span className="hero__tag">WebRTC · Canvas API</span>
        <span className="hero__tag-sep">/</span>
        <span className="hero__tag">30 FPS · No Backend</span>
      </div>

      {/* Heading */}
      <div className="hero__heading">
        <h1 className="hero__title">Real-time hand tracking</h1>
        <p className="hero__title-sub">for in-air gesture drawing.</p>
      </div>

      {/* Abstract */}
      <div className="hero__abstract">
        <p className="hero__abstract-label">Abstract</p>
        <p className="hero__abstract-text">
          Skywrite uses MediaPipe's 21-landmark hand skeleton model to classify
          four discrete gesture states — idle, draw, move, erase — at up to 30 fps
          in the browser after static assets load. No plugins, no backend uploads, no stylus required.
        </p>
      </div>

      {/* CTAs */}
      <div className="hero__ctas">
        <Link to="/draw" className="btn-primary">
          Launch app →
        </Link>
        <Link to="/calibrate" className="btn-secondary">
          Camera setup
        </Link>
        <Link to="/tutorial" className="btn-secondary">
          Gesture guide
        </Link>
      </div>

      {/* Metrics */}
      <div className="hero__metrics">
        <div className="hero__metric">
          <span className="hero__metric-value glow-cyan">21</span>
          <span className="hero__metric-label">landmarks / hand</span>
        </div>
        <div className="hero__metric">
          <span className="hero__metric-value">30 fps</span>
          <span className="hero__metric-label">inference target</span>
        </div>
        <div className="hero__metric">
          <span className="hero__metric-value">4</span>
          <span className="hero__metric-label">gesture states</span>
        </div>
        <div className="hero__metric">
          <span className="hero__metric-value glow-lime">0</span>
          <span className="hero__metric-label">frame uploads</span>
        </div>
      </div>

      {/* Demo panels */}
      <div className="hero__demo" aria-hidden="true">
        {/* Terminal */}
        <div className="hero__terminal">
          <div className="hero__terminal-bar">
            <div className="hero__terminal-dot" style={{ background: '#ff5f57' }} />
            <div className="hero__terminal-dot" style={{ background: '#febc2e' }} />
            <div className="hero__terminal-dot" style={{ background: '#28c840' }} />
            <span className="hero__terminal-title">gesture_classifier.ts</span>
          </div>
          <div className="hero__terminal-body">
            <div className="hero__terminal-line">
              <span className="hero__terminal-comment">// landmark indices</span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-key">const</span>
              <span className="hero__terminal-cmd"> TIP  = [4, 8, 12, 16, 20]</span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-key">const</span>
              <span className="hero__terminal-cmd"> PIP  = [3, 6, 10, 14, 18]</span>
            </div>
            <div className="hero__terminal-line">&nbsp;</div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-key">function</span>
              <span className="hero__terminal-cmd"> classify(lms) {'{'}</span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-out">
                <span className="hero__terminal-key">const</span> ext = fingers.filter(
              </span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-out">
                &nbsp;&nbsp;i =&gt; dist(lms[TIP[i]], wrist) &gt; dist(lms[PIP[i]], wrist)
              </span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-out">)</span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-out">
                <span className="hero__terminal-key">if</span> (ext === <span className="hero__terminal-val">1</span>) <span className="hero__terminal-key">return</span> <span className="hero__terminal-val">'draw'</span>
              </span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-out">
                <span className="hero__terminal-key">if</span> (ext === <span className="hero__terminal-val">2</span>) <span className="hero__terminal-key">return</span> <span className="hero__terminal-val">'move'</span>
              </span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-out">
                <span className="hero__terminal-key">if</span> (ext &gt;= <span className="hero__terminal-val">3</span>) <span className="hero__terminal-key">return</span> <span className="hero__terminal-val">'erase'</span>
              </span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-out">
                <span className="hero__terminal-key">return</span> <span className="hero__terminal-val">'idle'</span>
              </span>
            </div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-cmd">{'}'}</span>
            </div>
            <div className="hero__terminal-line">&nbsp;</div>
            <div className="hero__terminal-line">
              <span className="hero__terminal-prompt">▶</span>
              <span className="hero__terminal-cmd"> classify(landmarks)</span>
              <span className="hero__terminal-cursor" />
            </div>
          </div>
        </div>

        {/* Canvas preview */}
        <div className="hero__canvas-frame">
          <div className="hero__canvas-header">
            <div className="hero__canvas-dot" style={{ background: '#ff5f57' }} />
            <div className="hero__canvas-dot" style={{ background: '#febc2e' }} />
            <div className="hero__canvas-dot" style={{ background: '#28c840' }} />
            <span className="hero__canvas-title">drawing_canvas — live preview</span>
          </div>
          <div className="hero__canvas-body">
            <svg viewBox="0 0 400 300" className="hero__canvas-svg" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="gc"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="gm"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {/* S-curve */}
              <path d="M 50 60 Q 110 40 110 90 Q 110 140 50 140 Q -10 140 -10 190 Q -10 240 50 220" stroke="#00d4ff" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#gc)" />
              {/* K shape */}
              <path d="M 150 50 L 150 220" stroke="#c026d3" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#gm)" />
              <path d="M 150 135 L 210 50"  stroke="#c026d3" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#gm)" />
              <path d="M 150 135 L 210 220" stroke="#c026d3" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#gm)" />
              {/* Y shape */}
              <path d="M 260 50 L 300 130 L 340 50"  stroke="#22c55e" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#gl)" />
              <path d="M 300 130 L 300 220" stroke="#22c55e" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#gl)" />
              {/* Cursor ring */}
              <circle cx="355" cy="80" r="10" stroke="#00d4ff" strokeWidth="1.5" fill="none" opacity="0.7" />
              <circle cx="355" cy="80" r="2.5" fill="#00d4ff" opacity="0.9" />
              <path d="M 355 66 A 14 14 0 0 1 369 80" stroke="#00d4ff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            </svg>
            <div className="hero__hud">
              <div className="hero__hud-row">
                <span className="hero__hud-key">gesture</span>
                <span className="hero__hud-val hero__hud-val--cyan">draw</span>
              </div>
              <div className="hero__hud-row">
                <span className="hero__hud-key">hand</span>
                <span className="hero__hud-val">Right</span>
              </div>
              <div className="hero__hud-row">
                <span className="hero__hud-key">fps</span>
                <span className="hero__hud-val hero__hud-val--green">30</span>
              </div>
            </div>
            <div className="hero__cam-indicator">
              <div className="hero__cam-dot" />
              <span>cam:on</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
