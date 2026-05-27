/**
 * Author: Saad Kamal
 * Camera calibration and diagnostics page for validating browser, camera, and
 * hand-tracking readiness before a drawing session.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Camera } from '@mediapipe/camera_utils';
import type { Hands, NormalizedLandmark, Results } from '@mediapipe/hands';
import { Link, useNavigate } from 'react-router-dom';
import './CameraCalibration.css';

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

interface CheckItem {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'fail' | 'skip';
}

const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
const MEDIAPIPE_ASSET_BASE = `${import.meta.env.BASE_URL}vendor/mediapipe/hands/`;

/** Resolves self-hosted MediaPipe runtime files copied by Vite during dev/build. */
function locateMediaPipeFile(file: string): string {
  return `${MEDIAPIPE_ASSET_BASE}${file}`;
}

/** Renders the guided camera diagnostics page. */
export default function CameraCalibration() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const landmarksRef = useRef<NormalizedLandmark[][]>([]);
  const lastSendTimeRef = useRef<number>(0);

  const [permission, setPermission] = useState<PermissionState>('idle');
  const [checks, setChecks] = useState<CheckItem[]>([
    { id: 'browser',    label: 'Browser supports WebRTC',      status: 'pending' },
    { id: 'mediapipe',  label: 'MediaPipe Hands loaded',        status: 'pending' },
    { id: 'camera',     label: 'Camera access granted',         status: 'pending' },
    { id: 'resolution', label: 'Video resolution ≥ 640×480',    status: 'pending' },
    { id: 'fps',        label: 'Frame rate ≥ 15 FPS',           status: 'pending' },
    { id: 'tracking',   label: 'Hand tracking active',          status: 'pending' },
  ]);
  const [fps, setFps] = useState(0);
  const [resolution, setResolution] = useState({ w: 0, h: 0 });
  const [handDetected, setHandDetected] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const fpsFramesRef = useRef<number[]>([]);

  /** Updates one diagnostic checklist item without disturbing the others. */
  function updateCheck(id: string, status: CheckItem['status']) {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  // ── Overlay render ───────────────────────────────────────────────────────────
  const renderOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);

    if (!showOverlay) { animRef.current = requestAnimationFrame(renderOverlay); return; }

    ctx.strokeStyle = 'rgba(0,240,255,0.12)';
    ctx.lineWidth = 1;
    const cols = 6, rows = 4;
    for (let i = 1; i < cols; i++) {
      ctx.beginPath(); ctx.moveTo(W * i / cols, 0); ctx.lineTo(W * i / cols, H); ctx.stroke();
    }
    for (let i = 1; i < rows; i++) {
      ctx.beginPath(); ctx.moveTo(0, H * i / rows); ctx.lineTo(W, H * i / rows); ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0,240,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W/2 - 20, H/2); ctx.lineTo(W/2 + 20, H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2, H/2 - 20); ctx.lineTo(W/2, H/2 + 20); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,240,255,0.3)';
    ctx.beginPath(); ctx.arc(W/2, H/2, 40, 0, Math.PI * 2); ctx.stroke();

    const bSize = 24, bThick = 3;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = bThick;
    const corners = [[0,0],[W,0],[0,H],[W,H]];
    corners.forEach(([cx, cy]) => {
      const sx = cx === 0 ? 1 : -1;
      const sy = cy === 0 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(cx + sx * 12, cy + sy * 12); ctx.lineTo(cx + sx * 12 + sx * bSize, cy + sy * 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + sx * 12, cy + sy * 12); ctx.lineTo(cx + sx * 12, cy + sy * 12 + sy * bSize); ctx.stroke();
    });

    if (landmarksRef.current.length > 0) {
      landmarksRef.current.forEach((lms: NormalizedLandmark[]) => {
        const CONNECTIONS: [number,number][] = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
        ctx.strokeStyle = 'rgba(0,240,255,0.7)';
        ctx.lineWidth = 2;
        CONNECTIONS.forEach(([a, b]) => {
          const la = lms[a], lb = lms[b];
          ctx.beginPath();
          ctx.moveTo((1 - la.x) * W, la.y * H);
          ctx.lineTo((1 - lb.x) * W, lb.y * H);
          ctx.stroke();
        });
        lms.forEach((lm: NormalizedLandmark, i: number) => {
          const r = [4,8,12,16,20].includes(i) ? 5 : 3;
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc((1 - lm.x) * W, lm.y * H, r, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }

    ctx.fillStyle = 'rgba(0,240,255,0.7)';
    ctx.font = '12px monospace';
    ctx.fillText(`${fps} FPS`, 12, H - 12);
    if (resolution.w > 0) ctx.fillText(`${resolution.w}×${resolution.h}`, W - 80, H - 12);

    animRef.current = requestAnimationFrame(renderOverlay);
  }, [showOverlay, fps, resolution]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(renderOverlay);
    return () => cancelAnimationFrame(animRef.current);
  }, [renderOverlay]);

  // ── Run checks ───────────────────────────────────────────────────────────────
  /** Runs browser capability, camera, FPS, and hand-tracking checks in sequence. */
  async function runChecks() {
    stopDiagnostics();
    setPermission('requesting');

    updateCheck('browser', 'checking');
    await delay(300);
    if (!navigator.mediaDevices?.getUserMedia) {
      updateCheck('browser', 'fail');
      setPermission('unavailable');
      return;
    }
    updateCheck('browser', 'pass');

    updateCheck('mediapipe', 'checking');
    await delay(400);
    updateCheck('mediapipe', 'pass');

    updateCheck('camera', 'checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await new Promise<void>(res => { video.onloadeddata = () => res(); });
      setPermission('granted');
      updateCheck('camera', 'pass');

      updateCheck('resolution', 'checking');
      await delay(300);
      const w = video.videoWidth, h = video.videoHeight;
      setResolution({ w, h });
      updateCheck('resolution', w >= 640 && h >= 480 ? 'pass' : 'fail');

      updateCheck('fps', 'checking');
      const measuredFps = await measureFPS();
      setFps(measuredFps);
      updateCheck('fps', measuredFps >= 15 ? 'pass' : 'fail');

      updateCheck('tracking', 'checking');
      await initMediaPipe(video);
    } catch {
      setPermission('denied');
      updateCheck('camera', 'fail');
      updateCheck('resolution', 'skip');
      updateCheck('fps', 'skip');
      updateCheck('tracking', 'skip');
    }
  }

  /** Estimates visible camera frame cadence using requestAnimationFrame. */
  async function measureFPS(): Promise<number> {
    return new Promise(resolve => {
      const times: number[] = [];
      let count = 0;
      function frame() {
        times.push(performance.now());
        count++;
        if (count < 30) requestAnimationFrame(frame);
        else {
          const elapsed = times[times.length - 1] - times[0];
          resolve(Math.round((times.length - 1) / (elapsed / 1000)));
        }
      }
      requestAnimationFrame(frame);
    });
  }

  /** Starts a short MediaPipe session so users can confirm hand tracking works. */
  async function initMediaPipe(video: HTMLVideoElement) {
    const hands = new window.Hands({ locateFile: locateMediaPipeFile });
    hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    hands.onResults((results: Results) => {
      const now = performance.now();
      fpsFramesRef.current.push(now);
      if (fpsFramesRef.current.length > 30) fpsFramesRef.current.shift();
      if (fpsFramesRef.current.length > 1) {
        const elapsed = now - fpsFramesRef.current[0];
        setFps(Math.round((fpsFramesRef.current.length - 1) / (elapsed / 1000)));
      }
      if (results.multiHandLandmarks?.length > 0) {
        landmarksRef.current = results.multiHandLandmarks;
        setHandDetected(true);
        updateCheck('tracking', 'pass');
      } else {
        landmarksRef.current = [];
        setHandDetected(false);
      }
    });
    handsRef.current = hands;
    const camera = new window.Camera(video, {
      onFrame: async () => {
        // ── Throttle to TARGET_FPS ──────────────────────────────────────────
        const now = performance.now();
        if (now - lastSendTimeRef.current < FRAME_INTERVAL_MS) return;
        lastSendTimeRef.current = now;
        // ───────────────────────────────────────────────────────────────────
        if (handsRef.current) await handsRef.current.send({ image: video });
      },
    });
    cameraRef.current = camera;
    await camera.start();
  }

  /** Stops diagnostic camera, tracking, and media resources. */
  function stopDiagnostics() {
    cameraRef.current?.stop();
    cameraRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (handsRef.current) void handsRef.current.close();
    handsRef.current = null;
    landmarksRef.current = [];
    setHandDetected(false);
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      stopDiagnostics();
    };
  }, []);

  const allPassed = checks.every(c => c.status === 'pass' || c.status === 'skip');
  const anyFailed = checks.some(c => c.status === 'fail');

  return (
    <div className="cam-cal">
      <div className="cam-cal__bg" />

      <header className="cam-cal__header">
        <Link to="/" className="cam-cal__back">← Back</Link>
        <div className="cam-cal__title-group">
          <span className="cam-cal__label">Setup</span>
          <h1 className="cam-cal__title">Camera Calibration</h1>
        </div>
        <Link to="/tutorial" className="cam-cal__nav-link">Gesture Guide →</Link>
      </header>

      <div className="cam-cal__body">
        <div className="cam-cal__preview-col">
          <div className="cam-cal__preview-frame">
            <video
              ref={videoRef}
              className="cam-cal__video"
              autoPlay
              playsInline
              muted
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
            />
            <canvas ref={overlayCanvasRef} className="cam-cal__overlay" />

            {permission === 'idle' && (
              <div className="cam-cal__preview-placeholder">
                <div className="cam-cal__preview-icon">📷</div>
                <p>Camera preview will appear here</p>
              </div>
            )}
            {permission === 'denied' && (
              <div className="cam-cal__preview-placeholder cam-cal__preview-placeholder--error">
                <div className="cam-cal__preview-icon">🚫</div>
                <p>Camera access denied</p>
                <p className="cam-cal__preview-hint">Check your browser permissions and reload</p>
              </div>
            )}
            {permission === 'unavailable' && (
              <div className="cam-cal__preview-placeholder cam-cal__preview-placeholder--warn">
                <div className="cam-cal__preview-icon">⚠️</div>
                <p>No camera detected</p>
                <p className="cam-cal__preview-hint">You can still use mouse/touch drawing</p>
              </div>
            )}

            {permission === 'granted' && (
              <button
                className="cam-cal__overlay-toggle"
                onClick={() => setShowOverlay(v => !v)}
              >
                {showOverlay ? 'Hide overlay' : 'Show overlay'}
              </button>
            )}

            {handDetected && (
              <div className="cam-cal__hand-badge">
                <span className="cam-cal__hand-dot" />
                Hand detected ✓
              </div>
            )}
          </div>

          {permission === 'granted' && (
            <div className="cam-cal__adjustments">
              <label className="cam-cal__adj-label">
                <span>Brightness {brightness}%</span>
                <input type="range" min={50} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))} />
              </label>
              <label className="cam-cal__adj-label">
                <span>Contrast {contrast}%</span>
                <input type="range" min={50} max={150} value={contrast} onChange={e => setContrast(Number(e.target.value))} />
              </label>
            </div>
          )}
        </div>

        <div className="cam-cal__checks-col">
          <h2 className="cam-cal__checks-title">System Checks</h2>

          <div className="cam-cal__checks-list">
            {checks.map(check => (
              <div key={check.id} className={`cam-cal__check cam-cal__check--${check.status}`}>
                <div className="cam-cal__check-icon">
                  {check.status === 'pending'  && <span className="cam-cal__check-dot cam-cal__check-dot--pending" />}
                  {check.status === 'checking' && <span className="cam-cal__check-spinner" />}
                  {check.status === 'pass'     && <span>✓</span>}
                  {check.status === 'fail'     && <span>✗</span>}
                  {check.status === 'skip'     && <span>—</span>}
                </div>
                <span className="cam-cal__check-label">{check.label}</span>
                {check.id === 'fps' && check.status === 'pass' && (
                  <span className="cam-cal__check-value">{fps} fps</span>
                )}
                {check.id === 'resolution' && check.status === 'pass' && (
                  <span className="cam-cal__check-value">{resolution.w}×{resolution.h}</span>
                )}
              </div>
            ))}
          </div>

          {permission === 'granted' && checks.find(c => c.id === 'tracking')?.status === 'checking' && !handDetected && (
            <div className="cam-cal__tracking-prompt">
              <div className="cam-cal__tracking-hand">✋</div>
              <p>Show your hand to the camera to test tracking</p>
            </div>
          )}

          {allPassed && (
            <div className="cam-cal__status cam-cal__status--success">
              <span>🎉</span>
              <div>
                <strong>All checks passed!</strong>
                <p>Your setup is ready for gesture drawing.</p>
              </div>
            </div>
          )}
          {anyFailed && !allPassed && permission !== 'idle' && permission !== 'requesting' && (
            <div className="cam-cal__status cam-cal__status--warn">
              <span>⚠️</span>
              <div>
                <strong>Some checks failed</strong>
                <p>You can still use mouse/touch drawing as a fallback.</p>
              </div>
            </div>
          )}

          <div className="cam-cal__actions">
            {permission === 'idle' && (
              <button className="cam-cal__btn cam-cal__btn--primary" onClick={runChecks}>
                <span>📷</span> Start Camera Test
              </button>
            )}
            {permission === 'requesting' && (
              <button className="cam-cal__btn cam-cal__btn--primary" disabled>
                <span className="cam-cal__btn-spinner" /> Checking…
              </button>
            )}
            {(permission === 'granted' || permission === 'denied' || permission === 'unavailable') && (
              <>
                <button className="cam-cal__btn cam-cal__btn--secondary" onClick={runChecks}>
                  Re-run checks
                </button>
                <button
                  className="cam-cal__btn cam-cal__btn--primary"
                  onClick={() => navigate('/draw')}
                >
                  {allPassed ? '🎨 Start Drawing' : '🖱️ Draw with Mouse'}
                </button>
              </>
            )}
          </div>

          <div className="cam-cal__tips">
            <h3 className="cam-cal__tips-title">Tips for best tracking</h3>
            <ul className="cam-cal__tips-list">
              <li>Ensure your face and hands are well-lit from the front</li>
              <li>Keep your hand 40–80 cm from the camera</li>
              <li>Avoid busy or moving backgrounds</li>
              <li>Use Chrome or Edge for best MediaPipe performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pauses sequential diagnostics long enough for users to perceive progress. */
function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}
