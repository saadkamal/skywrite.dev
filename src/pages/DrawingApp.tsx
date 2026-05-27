/**
 * Author: Saad Kamal
 * Main drawing surface for Skywrite. It owns camera lifecycle, MediaPipe
 * inference, pointer fallback input, canvas rendering, and PNG export.
 */
import { useEffect, useRef, useState } from 'react';
import type { Hands, NormalizedLandmark, Results } from '@mediapipe/hands';
import { Hand } from '../lib/Hand';
import type { Stroke } from '../lib/Hand';
import { classify } from '../lib/gestures';
import { coverTransform, mapLandmark, dist, lerp, clamp } from '../lib/transform';
import { drawStroke, drawHandSkeleton } from '../lib/canvas';
import {
  DRAW_ARM_FRAMES, EXTEND_POINT_MIN_DIST, WEBCAM_ALPHA,
  MEDIAPIPE_MAX_HANDS,
  MEDIAPIPE_MIN_DETECTION_CONFIDENCE, MEDIAPIPE_MIN_TRACKING_CONFIDENCE,
  ERASE_RADIUS_SCALE, ERASE_RADIUS_MIN, ERASE_RADIUS_MAX,
  WIPE_THRESHOLD_SCALE, WIPE_THRESHOLD_MIN, WIPE_THRESHOLD_MAX,
  WIPE_SPEED_LERP, PALETTE,
} from '../lib/constants';
import './DrawingApp.css';

type CameraStatus = 'on' | 'off' | 'unavailable';
type StartupPhase = 'camera' | 'runtime';
type FrameRequestVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

const TARGET_FPS = 60;
const FRAME_MS   = 1000 / TARGET_FPS;
const MEDIAPIPE_ASSET_BASE = `${import.meta.env.BASE_URL}vendor/mediapipe/hands/`;
const CAMERA_BLOCKED_MESSAGE =
  'Camera permission was blocked. Allow camera access in Chrome, Edge, or Safari, then try again.';
const CAMERA_UNSUPPORTED_MESSAGE =
  'This browser does not expose camera access to web pages. Open this page in Chrome, Edge, or Safari to use hand tracking.';
const HAND_TRACKING_RUNTIME_MESSAGE =
  'Camera access was granted, but the local hand-tracking runtime could not start. Reinstall dependencies or rebuild the app to restore the self-hosted MediaPipe assets.';

/** Resolves self-hosted MediaPipe runtime files copied by Vite during dev/build. */
function locateMediaPipeFile(file: string): string {
  return `${MEDIAPIPE_ASSET_BASE}${file}`;
}

/** Waits until the video has enough data for a first MediaPipe warm-up frame. */
function waitForVideoFrames(video: HTMLVideoElement): Promise<void> {
  return new Promise(resolve => {
    if (video.readyState >= 3) { resolve(); return; }
    const onReady = () => { video.removeEventListener('canplay', onReady); resolve(); };
    video.addEventListener('canplay', onReady);
  });
}

/** Turns camera and hand-tracking startup failures into useful diagnostics. */
function describeCameraError(error: unknown, phase: StartupPhase): string {
  if (phase === 'runtime') {
    return HAND_TRACKING_RUNTIME_MESSAGE;
  }

  if (!(error instanceof DOMException)) {
    return 'Camera could not be started in this browser. Try Chrome, Edge, or Safari with camera permission enabled.';
  }

  if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
    return CAMERA_BLOCKED_MESSAGE;
  }

  if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
    return 'No compatible camera was found. Connect or enable a camera, then try again.';
  }

  if (error.name === 'NotReadableError') {
    return 'The camera is already in use by another app or browser tab.';
  }

  if (error.name === 'AbortError') {
    return `Chrome interrupted camera startup${error.message ? `: ${error.message}` : '.'}`;
  }

  return `Camera startup failed: ${error.name}.`;
}

/** Requests a camera stream with the original Skywrite capture constraints. */
async function requestCameraStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
  });
}

/** Renders the full-screen drawing app and owns all drawing-session state. */
export default function DrawingApp() {
  const videoRef         = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef  = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const uiCanvasRef      = useRef<HTMLCanvasElement>(null);

  const handsRef         = useRef<Hands | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const sendLoopRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopSendRef      = useRef<(() => void) | null>(null);
  const sendingRef       = useRef(false);

  const handsStateRef    = useRef<[Hand, Hand]>([new Hand('Left'), new Hand('Right')]);
  const strokesRef       = useRef<Stroke[]>([]);
  const pointerStrokeRef = useRef<Stroke | null>(null);
  const pointerActiveRef = useRef(false);

  const colorRef         = useRef('#00f0ff');
  const thicknessRef     = useRef(8);
  const glowRef          = useRef(50);
  const cameraStatusRef  = useRef<CameraStatus>('off');

  const fpsRef           = useRef(0);
  const lastSendTimeRef  = useRef(0);
  const hudDataRef       = useRef<{ handedness: string; mode: string; armCount: number; visible: boolean }[]>([]);

  const animFrameRef     = useRef<number>(0);

  const [loading,      setLoading]      = useState(true);
  const [loadingText,  setLoadingText]  = useState('Initializing...');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('off');
  const [cameraError,  setCameraError]  = useState<string | null>(null);
  const [color,        setColor]        = useState('#00f0ff');
  const [thickness,    setThickness]    = useState(8);
  const [glow,         setGlow]         = useState(50);
  const [showHelp,     setShowHelp]     = useState(false);

  useEffect(() => { colorRef.current        = color;        }, [color]);
  useEffect(() => { thicknessRef.current    = thickness;    }, [thickness]);
  useEffect(() => { glowRef.current         = glow;         }, [glow]);
  useEffect(() => { cameraStatusRef.current = cameraStatus; }, [cameraStatus]);

  /** Commits an active hand stroke before the hand disappears or the camera stops. */
  function commitCurrentStroke(hand: Hand) {
    if (!hand.current) return;
    strokesRef.current = [...strokesRef.current, hand.current];
    hand.current = null;
  }

  /** Clears transient hand state while preserving completed artwork. */
  function resetHands() {
    for (const hand of handsStateRef.current) {
      commitCurrentStroke(hand);
      hand.reset();
    }
    hudDataRef.current = [];
  }

  /** Resizes all canvas layers in CSS pixels while retaining sharp DPR backing stores. */
  function resizeCanvases() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    for (const ref of [cameraCanvasRef, drawingCanvasRef, uiCanvasRef]) {
      const c = ref.current;
      if (!c) continue;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width        = W * dpr;
      c.height       = H * dpr;
      c.style.width  = W + 'px';
      c.style.height = H + 'px';
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /** Draws camera, artwork, hand overlays, and HUD every animation frame. */
  function renderLoop() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const hands = handsStateRef.current;

    const camCtx = cameraCanvasRef.current?.getContext('2d');
    const video  = videoRef.current;
    if (camCtx) {
      if (cameraStatusRef.current === 'on' && video && video.readyState >= 2 && video.videoWidth > 0) {
        const tf = coverTransform(video.videoWidth, video.videoHeight, W, H);
        camCtx.clearRect(0, 0, W, H);
        camCtx.save();
        camCtx.globalAlpha = WEBCAM_ALPHA;
        camCtx.translate(W, 0);
        camCtx.scale(-1, 1);
        camCtx.drawImage(video, tf.ox, tf.oy, tf.dw, tf.dh);
        camCtx.restore();
      } else if (cameraStatusRef.current !== 'on') {
        camCtx.clearRect(0, 0, W, H);
      }
    }

    const drawCtx = drawingCanvasRef.current?.getContext('2d');
    if (drawCtx) {
      drawCtx.clearRect(0, 0, W, H);
      for (const s of strokesRef.current) drawStroke(drawCtx, s);
      for (const h of hands) { if (h.current) drawStroke(drawCtx, h.current); }
      if (pointerStrokeRef.current) drawStroke(drawCtx, pointerStrokeRef.current);
    }

    const uiCtx = uiCanvasRef.current?.getContext('2d');
    if (uiCtx) {
      uiCtx.clearRect(0, 0, W, H);
      for (const hand of hands) {
        if (!hand.visible || hand.landmarks.length === 0) continue;
        const skeletonColor =
          hand.mode === 'draw'  ? colorRef.current :
          hand.mode === 'move'  ? '#ffd700' :
          hand.mode === 'erase' ? '#ff4d6b' :
          'rgba(255,255,255,0.4)';
        drawHandSkeleton(uiCtx, hand.landmarks, skeletonColor);
        if (hand.mode !== 'erase') {
          uiCtx.strokeStyle = skeletonColor;
          uiCtx.lineWidth = 2;
          uiCtx.beginPath();
          uiCtx.arc(hand.cursor.x, hand.cursor.y, 12, 0, Math.PI * 2);
          uiCtx.stroke();
          uiCtx.fillStyle = skeletonColor;
          uiCtx.beginPath();
          uiCtx.arc(hand.cursor.x, hand.cursor.y, 3, 0, Math.PI * 2);
          uiCtx.fill();
          if (hand.mode === 'draw' && hand.armCount > 0 && hand.armCount <= DRAW_ARM_FRAMES) {
            const progress = hand.armCount / DRAW_ARM_FRAMES;
            uiCtx.strokeStyle = colorRef.current;
            uiCtx.lineWidth = 3;
            uiCtx.beginPath();
            uiCtx.arc(hand.cursor.x, hand.cursor.y, 18,
              -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
            uiCtx.stroke();
          }
        } else if (hand.wiping) {
          uiCtx.fillStyle = 'rgba(255, 77, 107, 0.25)';
          for (const lm of hand.landmarks) {
            const r = clamp(
              dist(hand.landmarks[0], hand.landmarks[9]) * ERASE_RADIUS_SCALE,
              ERASE_RADIUS_MIN, ERASE_RADIUS_MAX
            );
            uiCtx.beginPath();
            uiCtx.arc(lm.x, lm.y, r, 0, Math.PI * 2);
            uiCtx.fill();
          }
        }
      }

      const hud = hudDataRef.current;
      uiCtx.font = '600 13px Inter, system-ui, sans-serif';
      let y = 16;
      for (const h of hud) {
        if (!h.visible) continue;
        const isArming = h.armCount > 0 && h.armCount <= DRAW_ARM_FRAMES;
        const label = isArming ? 'Get ready…' : h.mode;
        const icon  = h.mode === 'draw' ? '☝️' : h.mode === 'move' ? '✌️' : h.mode === 'erase' ? '🖐️' : '✊';
        uiCtx.fillStyle = 'rgba(255,255,255,0.85)';
        uiCtx.fillText(`${icon}  ${h.handedness}: ${label}`, 16, y);
        y += 22;
      }
      if (fpsRef.current > 0) {
        uiCtx.font = '11px monospace';
        uiCtx.fillStyle = 'rgba(255,255,255,0.3)';
        uiCtx.fillText(`${fpsRef.current} FPS`, 16, y + 4);
      }
    }

    animFrameRef.current = requestAnimationFrame(renderLoop);
  }

  const handleResultsRef = useRef((results: Results) => {
    if (pointerActiveRef.current) return;

    const now = performance.now();
    const delta = now - lastSendTimeRef.current;
    if (delta > 0) fpsRef.current = Math.round(1000 / delta);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const video = videoRef.current;
    if (!video) return;

    const tf = coverTransform(video.videoWidth || 640, video.videoHeight || 480, W, H);
    const [leftHand, rightHand] = handsStateRef.current;
    const handByKey: Record<string, Hand> = { Left: leftHand, Right: rightHand };
    const seenKeys = new Set<string>();

    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((lms: NormalizedLandmark[], i: number) => {
        let key: string = results.multiHandedness?.[i]?.label ?? (i === 0 ? 'Right' : 'Left');
        if (seenKeys.has(key)) key = key === 'Left' ? 'Right' : 'Left';
        seenKeys.add(key);
        const hand = handByKey[key];
        if (!hand) return;

        hand.landmarks = lms.map(lm => mapLandmark(lm, tf));
        hand.visible   = true;
        hand.updateCursor(hand.landmarks[8]);

        const raw = classify(hand.landmarks);
        hand.prevMode = hand.mode;
        hand.mode     = hand.stabilize(raw);

        if (hand.mode === 'draw') {
          if (hand.prevMode !== 'draw') {
            hand.armCount = 1;
          } else if (hand.armCount > 0) {
            hand.armCount++;
            if (hand.armCount > DRAW_ARM_FRAMES) {
              hand.armCount = 0;
              if (!hand.current) {
                hand.current = {
                  color: colorRef.current, thickness: thicknessRef.current,
                  glow: glowRef.current, points: [{ ...hand.cursor }],
                };
              }
            }
          } else if (hand.current) {
            const last = hand.current.points[hand.current.points.length - 1];
            if (dist(hand.cursor, last) > EXTEND_POINT_MIN_DIST) {
              hand.current.points.push({ ...hand.cursor });
            }
          }
        } else {
          if (hand.current) {
            strokesRef.current = [...strokesRef.current, hand.current];
            hand.current = null;
          }
          hand.armCount = 0;
        }

        if (hand.mode === 'move') {
          if (!hand.moveAnchor) {
            hand.moveAnchor = { ...hand.cursor };
          } else {
            const dx = hand.cursor.x - hand.moveAnchor.x;
            const dy = hand.cursor.y - hand.moveAnchor.y;
            strokesRef.current = strokesRef.current.map(s => ({
              ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })),
            }));
            for (const h of handsStateRef.current) {
              if (h.current) h.current.points = h.current.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
            }
            if (pointerStrokeRef.current) {
              pointerStrokeRef.current.points = pointerStrokeRef.current.points.map(
                p => ({ x: p.x + dx, y: p.y + dy })
              );
            }
            hand.moveAnchor = { ...hand.cursor };
          }
        } else {
          hand.moveAnchor = null;
        }

        if (hand.mode === 'erase') {
          const palm  = hand.landmarks[9];
          const moved = hand.lastPalm ? dist(palm, hand.lastPalm) : 0;
          hand.wipeSpeed = lerp(hand.wipeSpeed, moved, WIPE_SPEED_LERP);
          const radius    = clamp(dist(hand.landmarks[0], hand.landmarks[9]) * ERASE_RADIUS_SCALE, ERASE_RADIUS_MIN, ERASE_RADIUS_MAX);
          const threshold = clamp(radius * WIPE_THRESHOLD_SCALE, WIPE_THRESHOLD_MIN, WIPE_THRESHOLD_MAX);
          hand.wiping = hand.wipeSpeed > threshold;
          if (hand.wiping) {
            strokesRef.current = strokesRef.current.filter(stroke =>
              !stroke.points.some(p => hand.landmarks.some(lm => dist(p, lm) < radius))
            );
          }
          hand.lastPalm = { ...palm };
        } else {
          hand.lastPalm  = null;
          hand.wipeSpeed = 0;
          hand.wiping    = false;
        }
      });
    }

    for (const [key, hand] of Object.entries(handByKey)) {
      if (!seenKeys.has(key)) {
        commitCurrentStroke(hand);
        hand.reset();
      }
    }

    hudDataRef.current = handsStateRef.current.map(h => ({
      handedness: h.handedness, mode: h.mode,
      armCount: h.armCount, visible: h.visible,
    }));
  });

  /** Starts a throttled frame loop that sends video frames to MediaPipe. */
  function startSendLoop(video: HTMLVideoElement) {
    let stopped = false;

    async function sendFrame() {
      if (stopped) return;
      if (
        cameraStatusRef.current === 'on' &&
        !sendingRef.current &&
        handsRef.current &&
        video.readyState >= 2 &&
        video.videoWidth > 0
      ) {
        sendingRef.current = true;
        const t0 = performance.now();
        try {
          await handsRef.current.send({ image: video });
        } catch {
          // A single failed frame should not stop the drawing session.
        }
        lastSendTimeRef.current = t0;
        sendingRef.current = false;
      }
      scheduleNext();
    }

    function scheduleNext() {
      if (stopped) return;
      const frameVideo = video as FrameRequestVideo;
      if (frameVideo.requestVideoFrameCallback) {
        frameVideo.requestVideoFrameCallback(() => { void sendFrame(); });
      } else {
        sendLoopRef.current = setTimeout(sendFrame, FRAME_MS);
      }
    }

    scheduleNext();
    return () => {
      stopped = true;
      if (sendLoopRef.current) clearTimeout(sendLoopRef.current);
    };
  }

  /** Releases camera hardware and MediaPipe resources while keeping the canvas intact. */
  function stopCamera() {
    stopSendRef.current?.();
    stopSendRef.current = null;
    sendingRef.current = false;

    if (handsRef.current) {
      void handsRef.current.close();
      handsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video) video.srcObject = null;

    resetHands();
    setLoading(false);
    setCameraStatus('off');
  }

  /** Requests camera permission, warms MediaPipe, and starts real-time tracking. */
  async function startCamera() {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable');
      setCameraError(CAMERA_UNSUPPORTED_MESSAGE);
      return;
    }

    stopCamera();
    setLoading(true);
    let startupPhase: StartupPhase = 'camera';

    try {
      setLoadingText('Starting camera...');
      const stream = await requestCameraStream();
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error('Video element is not mounted.');
      video.srcObject = stream;
      await video.play().catch(() => undefined);

      setLoadingText('Warming up...');
      await waitForVideoFrames(video);

      startupPhase = 'runtime';
      setLoadingText('Loading hand model...');
      const hands = new window.Hands({ locateFile: locateMediaPipeFile });
      hands.setOptions({
        maxNumHands:            MEDIAPIPE_MAX_HANDS,
        modelComplexity:        0,
        minDetectionConfidence: MEDIAPIPE_MIN_DETECTION_CONFIDENCE,
        minTrackingConfidence:  MEDIAPIPE_MIN_TRACKING_CONFIDENCE,
      });
      handsRef.current = hands;

      await hands.initialize();

      hands.onResults(result => handleResultsRef.current(result));
      try {
        await hands.send({ image: video });
      } catch {
        // Warm-up can fail on slow devices; the send loop gets the next frame.
      }

      setCameraStatus('on');
      setLoading(false);
      stopSendRef.current = startSendLoop(video);
    } catch (error) {
      console.warn('Skywrite camera startup failed', error);
      stopCamera();
      setCameraError(describeCameraError(error, startupPhase));
      setCameraStatus('unavailable');
      setLoading(false);
    }
  }

  useEffect(() => {
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable');
      setCameraError(CAMERA_UNSUPPORTED_MESSAGE);
    }

    try {
      if (!localStorage.getItem('skywrite-help-shown')) {
        setShowHelp(true);
        localStorage.setItem('skywrite-help-shown', 'true');
      }
    } catch {
      setShowHelp(true);
    }

    const cameraStartId = window.setTimeout(() => {
      void startCamera();
    }, 0);

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.clearTimeout(cameraStartId);
      window.removeEventListener('resize', resizeCanvases);
      cancelAnimationFrame(animFrameRef.current);
      stopCamera();
    };
    // Session bootstrap intentionally runs once; refs carry live camera/canvas state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = uiCanvasRef.current;
    if (!canvas) return;
    function onPointerDown(e: PointerEvent) {
      pointerActiveRef.current = true;
      pointerStrokeRef.current = {
        color: colorRef.current, thickness: thicknessRef.current,
        glow: glowRef.current, points: [{ x: e.clientX, y: e.clientY }],
      };
    }
    function onPointerMove(e: PointerEvent) {
      if (!pointerActiveRef.current || !pointerStrokeRef.current) return;
      pointerStrokeRef.current.points.push({ x: e.clientX, y: e.clientY });
    }
    function onPointerUp() {
      if (pointerStrokeRef.current) {
        strokesRef.current = [...strokesRef.current, pointerStrokeRef.current];
        pointerStrokeRef.current = null;
      }
      pointerActiveRef.current = false;
    }
    canvas.addEventListener('pointerdown',   onPointerDown);
    canvas.addEventListener('pointermove',   onPointerMove);
    canvas.addEventListener('pointerup',     onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave',  onPointerUp);
    return () => {
      canvas.removeEventListener('pointerdown',   onPointerDown);
      canvas.removeEventListener('pointermove',   onPointerMove);
      canvas.removeEventListener('pointerup',     onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave',  onPointerUp);
    };
  }, []);

  /** Removes the latest committed stroke. */
  function handleUndo()  { strokesRef.current = strokesRef.current.slice(0, -1); }

  /** Clears all artwork and transient input state. */
  function handleClear() {
    strokesRef.current = [];
    for (const h of handsStateRef.current) h.current = null;
    pointerStrokeRef.current = null;
  }

  /** Starts or fully stops the camera, including hardware tracks. */
  function handleToggleCamera() {
    if (cameraStatusRef.current === 'on') {
      stopCamera();
    } else {
      void startCamera();
    }
  }

  /** Composites the latest camera frame and strokes into a downloadable PNG. */
  function handleSave() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Offscreen canvas at CSS pixel size (no DPR scaling needed —
    // we draw the source canvases using their CSS dimensions via drawImage,
    // which ignores the internal DPR transform and just blits the pixels).
    const off = document.createElement('canvas');
    off.width  = W;
    off.height = H;
    const ctx = off.getContext('2d')!;

    // 1. Dark background
    ctx.fillStyle = '#05060a';
    ctx.fillRect(0, 0, W, H);

    // 2. Camera layer — draw the video directly so we get the live frame,
    //    mirrored and cover-fitted exactly as the render loop does.
    const video = videoRef.current;
    if (video && cameraStatusRef.current === 'on' && video.readyState >= 2 && video.videoWidth > 0) {
      const tf = coverTransform(video.videoWidth, video.videoHeight, W, H);
      ctx.save();
      ctx.globalAlpha = WEBCAM_ALPHA;
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, tf.ox, tf.oy, tf.dw, tf.dh);
      ctx.restore();
    }

    // 3. Drawing layer — re-render all strokes at CSS resolution so glow/
    //    shadow scales correctly (avoids the DPR double-scale issue).
    for (const s of strokesRef.current) drawStroke(ctx, s);
    if (pointerStrokeRef.current) drawStroke(ctx, pointerStrokeRef.current);

    // 4. Export
    off.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skywrite-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return (
    <div className="drawing-app">
      <video ref={videoRef} className="drawing-app__video-source" autoPlay playsInline muted />

      <canvas ref={cameraCanvasRef}  className="drawing-app__canvas drawing-app__canvas--camera"  />
      <canvas ref={drawingCanvasRef} className="drawing-app__canvas drawing-app__canvas--drawing" />
      <canvas ref={uiCanvasRef}      className="drawing-app__canvas drawing-app__canvas--ui"      />

      {loading && (
        <div className="drawing-app__loading">
          <div className="drawing-app__loading-logo">✦ Skywrite</div>
          <div className="drawing-app__loading-bar">
            <div className="drawing-app__loading-fill" />
          </div>
          <div className="drawing-app__loading-text">{loadingText}</div>
        </div>
      )}

      <div className={`drawing-app__cam-indicator drawing-app__cam-indicator--${cameraStatus}`}>
        <div className="drawing-app__cam-dot" />
        <span>{cameraStatus === 'on' ? 'Camera ON' : cameraStatus === 'off' ? 'Camera OFF' : 'No Camera'}</span>
      </div>

      {cameraError && (
        <div className="drawing-app__camera-error" role="status">
          <strong>Camera unavailable</strong>
          <p>{cameraError}</p>
        </div>
      )}

      <div className="drawing-app__toolbar">
        <div className="drawing-app__palette">
          {PALETTE.map(c => (
            <button key={c}
              className={`drawing-app__swatch ${color === c ? 'drawing-app__swatch--active' : ''}`}
              style={{ background: c }} onClick={() => setColor(c)} title={c} />
          ))}
        </div>
        <div className="drawing-app__toolbar-divider" />
        <label className="drawing-app__slider-label">
          <span>Size {thickness}px</span>
          <input type="range" min={2} max={32} value={thickness}
            onChange={e => setThickness(Number(e.target.value))} />
        </label>
        <label className="drawing-app__slider-label">
          <span>Glow {glow}%</span>
          <input type="range" min={0} max={100} value={glow}
            onChange={e => setGlow(Number(e.target.value))} />
        </label>
        <div className="drawing-app__toolbar-divider" />
        <button className="drawing-app__btn" onClick={handleUndo}>Undo</button>
        <button className="drawing-app__btn" onClick={handleClear}>Clear</button>
        <button className="drawing-app__btn" onClick={handleToggleCamera}>
          {cameraStatus === 'on' ? 'Stop Camera' : cameraStatus === 'unavailable' ? 'Try Camera Again' : 'Start Camera'}
        </button>
        <button className="drawing-app__btn" onClick={handleSave}>Save PNG</button>
        <button className="drawing-app__btn drawing-app__btn--help" onClick={() => setShowHelp(true)}>?</button>
      </div>

      {showHelp && (
        <div className="drawing-app__help-backdrop" onClick={() => setShowHelp(false)}>
          <div className="drawing-app__help-panel" onClick={e => e.stopPropagation()}>
            <h2 className="drawing-app__help-title">Gesture Guide</h2>
            <div className="drawing-app__help-items">
              {[
                ['☝️','Draw','Index finger extended — hold ~0.5s to arm, then move to paint'],
                ['✌️','Move','Index + middle extended — drag to pan your entire canvas'],
                ['🖐️','Erase','3+ fingers extended — swipe to erase (motion-gated)'],
                ['✊','Idle','Fist — pause drawing without leaving a mark'],
              ].map(([emoji, title, desc]) => (
                <div key={title} className="drawing-app__help-item">
                  <span className="drawing-app__help-emoji">{emoji}</span>
                  <div><strong>{title}</strong><p>{desc}</p></div>
                </div>
              ))}
            </div>
            <p className="drawing-app__help-fallback">No camera? Draw with mouse or touch!</p>
            <button className="drawing-app__btn drawing-app__btn--full"
              onClick={() => setShowHelp(false)}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
