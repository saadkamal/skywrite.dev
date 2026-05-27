/**
 * Author: Saad Kamal
 * Interactive gesture tutorial that explains and rehearses the four Skywrite
 * hand poses before users launch the drawing surface.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './GestureTutorial.css';

interface GestureStep {
  id: string;
  emoji: string;
  name: string;
  pose: string;
  color: string;
  description: string;
  tip: string;
  svgFingers: boolean[];  // [index, middle, ring, pinky] extended
  thumb: boolean;
}

const STEPS: GestureStep[] = [
  {
    id: 'idle',
    emoji: '✊',
    name: 'Idle',
    pose: 'Closed fist',
    color: 'rgba(255,255,255,0.6)',
    description: 'Make a fist to pause. Your hand is visible but nothing is drawn. Use this to reposition without leaving marks.',
    tip: 'Start here — get comfortable holding a fist before trying other gestures.',
    svgFingers: [false, false, false, false],
    thumb: false,
  },
  {
    id: 'draw',
    emoji: '☝️',
    name: 'Draw',
    pose: 'Index finger extended',
    color: '#00f0ff',
    description: 'Extend only your index finger. Hold the pose for ~0.5 seconds — you\'ll see an arming ring fill around the cursor. Then move to paint.',
    tip: 'Keep your other fingers curled tight. The arming delay prevents accidental strokes.',
    svgFingers: [true, false, false, false],
    thumb: false,
  },
  {
    id: 'move',
    emoji: '✌️',
    name: 'Move',
    pose: 'Index + middle extended',
    color: '#ffd700',
    description: 'Extend your index and middle fingers like a peace sign. Move your hand to pan the entire canvas — all strokes shift together.',
    tip: 'Great for repositioning your artwork after drawing. Works with both hands independently.',
    svgFingers: [true, true, false, false],
    thumb: false,
  },
  {
    id: 'erase',
    emoji: '🖐️',
    name: 'Erase',
    pose: '3+ fingers extended',
    color: '#ff4d6b',
    description: 'Open your palm with 3 or more fingers extended. Erase is motion-gated — only activates while your hand is actively moving. A still palm does nothing.',
    tip: 'Swipe quickly for large erases. The erase radius scales with your hand size.',
    svgFingers: [true, true, true, true],
    thumb: true,
  },
];

/** Draws a lightweight hand illustration for the currently selected gesture. */
function HandSVG({ fingers, thumb, color, animated }: {
  fingers: boolean[];
  thumb: boolean;
  color: string;
  animated: boolean;
}) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setPhase(p => (p + 1) % 60), 50);
    return () => clearInterval(id);
  }, [animated]);

  const waveY = animated ? Math.sin(phase * 0.2) * 4 : 0;

  // Finger positions: [index, middle, ring, pinky]
  const fingerDefs = [
    { x: 90,  tipY: 30, pipY: 70,  mcpY: 110 },
    { x: 115, tipY: 20, pipY: 62,  mcpY: 105 },
    { x: 140, tipY: 25, pipY: 67,  mcpY: 108 },
    { x: 163, tipY: 40, pipY: 78,  mcpY: 112 },
  ];

  return (
    <svg viewBox="0 0 240 220" className="gesture-tutorial__hand-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`glow-${color.replace('#','')}`}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Palm */}
      <ellipse cx="125" cy="145" rx="55" ry="45" fill="rgba(16,18,28,0.9)" stroke={color} strokeWidth="2" opacity="0.9" />

      {/* Thumb */}
      {thumb ? (
        <g transform={`translate(0, ${waveY})`}>
          <line x1="72" y1="130" x2="52" y2="100" stroke={color} strokeWidth="10" strokeLinecap="round" />
          <circle cx="52" cy="100" r="7" fill={color} opacity="0.9" />
        </g>
      ) : (
        <line x1="72" y1="130" x2="68" y2="118" stroke="rgba(255,255,255,0.3)" strokeWidth="8" strokeLinecap="round" />
      )}

      {/* Fingers */}
      {fingerDefs.map((f, i) => {
        const ext = fingers[i];
        const dy = animated && ext ? waveY : 0;
        return ext ? (
          <g key={i} transform={`translate(0, ${dy})`}>
            <line x1={f.x} y1={f.mcpY} x2={f.x} y2={f.pipY} stroke={color} strokeWidth="10" strokeLinecap="round" />
            <line x1={f.x} y1={f.pipY} x2={f.x} y2={f.tipY} stroke={color} strokeWidth="9" strokeLinecap="round" />
            <circle cx={f.x} cy={f.tipY} r="6" fill={color} opacity="0.9" />
            {animated && (
              <circle cx={f.x} cy={f.tipY} r="10" stroke={color} strokeWidth="1.5" fill="none" opacity={0.3 + Math.sin(phase * 0.15 + i) * 0.2} />
            )}
          </g>
        ) : (
          <g key={i}>
            <line x1={f.x} y1={f.mcpY} x2={f.x} y2={f.pipY + 10} stroke="rgba(255,255,255,0.25)" strokeWidth="9" strokeLinecap="round" />
          </g>
        );
      })}

      {/* Wrist */}
      <rect x="90" y="180" width="70" height="30" rx="8" fill="rgba(16,18,28,0.9)" stroke={color} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

/** Renders the full gesture tutorial and quick-reference interaction. */
export default function GestureTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [practicing, setPracticing] = useState(false);
  const [practiceTimer, setPracticeTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = STEPS[activeStep];

  /** Starts a short practice countdown and marks the active gesture complete. */
  function startPractice() {
    setPracticing(true);
    setPracticeTimer(3);
    timerRef.current = setInterval(() => {
      setPracticeTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPracticing(false);
          setCompleted(prev => new Set([...prev, step.id]));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /** Advances to the next tutorial step when available. */
  function goNext() {
    if (activeStep < STEPS.length - 1) setActiveStep(s => s + 1);
  }
  /** Moves to the previous tutorial step when available. */
  function goPrev() {
    if (activeStep > 0) setActiveStep(s => s - 1);
  }

  return (
    <div className="gesture-tutorial">
      {/* Background */}
      <div className="gesture-tutorial__bg" />

      {/* Header */}
      <header className="gesture-tutorial__header">
        <Link to="/" className="gesture-tutorial__back">← Back</Link>
        <div className="gesture-tutorial__title-group">
          <span className="gesture-tutorial__label">Interactive Guide</span>
          <h1 className="gesture-tutorial__title">Gesture Tutorial</h1>
        </div>
        <Link to="/draw" className="gesture-tutorial__launch">Launch App →</Link>
      </header>

      {/* Progress bar */}
      <div className="gesture-tutorial__progress">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`gesture-tutorial__progress-step ${i === activeStep ? 'active' : ''} ${completed.has(s.id) ? 'done' : ''}`}
            onClick={() => setActiveStep(i)}
            style={{ '--step-color': s.color } as React.CSSProperties}
          >
            <span className="gesture-tutorial__progress-emoji">{s.emoji}</span>
            <span className="gesture-tutorial__progress-name">{s.name}</span>
            {completed.has(s.id) && <span className="gesture-tutorial__progress-check">✓</span>}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="gesture-tutorial__main">
        {/* Hand visualization */}
        <div className="gesture-tutorial__visual" style={{ '--step-color': step.color } as React.CSSProperties}>
          <div className="gesture-tutorial__visual-glow" />
          <HandSVG
            fingers={step.svgFingers}
            thumb={step.thumb}
            color={step.color}
            animated={practicing || completed.has(step.id)}
          />
          <div className="gesture-tutorial__visual-label" style={{ color: step.color }}>
            {step.pose}
          </div>
        </div>

        {/* Info panel */}
        <div className="gesture-tutorial__info">
          <div className="gesture-tutorial__info-badge" style={{ color: step.color, borderColor: step.color + '40', background: step.color + '10' }}>
            {step.emoji} {step.name}
          </div>
          <h2 className="gesture-tutorial__info-heading">{step.description}</h2>
          <div className="gesture-tutorial__tip">
            <span className="gesture-tutorial__tip-icon">💡</span>
            <p>{step.tip}</p>
          </div>

          {/* Practice button */}
          <div className="gesture-tutorial__practice-area">
            {!practicing && !completed.has(step.id) && (
              <button
                className="gesture-tutorial__practice-btn"
                style={{ '--step-color': step.color } as React.CSSProperties}
                onClick={startPractice}
              >
                Practice this gesture
              </button>
            )}
            {practicing && (
              <div className="gesture-tutorial__countdown">
                <div className="gesture-tutorial__countdown-ring" style={{ '--step-color': step.color } as React.CSSProperties}>
                  <span>{practiceTimer}</span>
                </div>
                <p>Hold the pose…</p>
              </div>
            )}
            {!practicing && completed.has(step.id) && (
              <div className="gesture-tutorial__done-badge">
                <span>✓</span> Gesture practiced!
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="gesture-tutorial__nav">
            <button
              className="gesture-tutorial__nav-btn"
              onClick={goPrev}
              disabled={activeStep === 0}
            >
              ← Previous
            </button>
            {activeStep < STEPS.length - 1 ? (
              <button
                className="gesture-tutorial__nav-btn gesture-tutorial__nav-btn--primary"
                style={{ '--step-color': step.color } as React.CSSProperties}
                onClick={goNext}
              >
                Next gesture →
              </button>
            ) : (
              <Link to="/draw" className="gesture-tutorial__nav-btn gesture-tutorial__nav-btn--launch">
                Start Drawing →
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* All gestures quick reference */}
      <section className="gesture-tutorial__reference">
        <h3 className="gesture-tutorial__reference-title">Quick Reference</h3>
        <div className="gesture-tutorial__reference-grid">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`gesture-tutorial__ref-card ${i === activeStep ? 'active' : ''}`}
              style={{ '--step-color': s.color } as React.CSSProperties}
              onClick={() => setActiveStep(i)}
            >
              <span className="gesture-tutorial__ref-emoji">{s.emoji}</span>
              <span className="gesture-tutorial__ref-name" style={{ color: s.color }}>{s.name}</span>
              <span className="gesture-tutorial__ref-pose">{s.pose}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
