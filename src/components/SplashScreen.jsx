import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Flag, Wallet } from 'lucide-react';

// ─── Colour tokens (exact brand values) ────────────────────────────────────
const C = {
  bg:        '#0c0e13',
  green:     '#1fba7e',
  surface:   '#161a22',
  border:    '#2a2d35',
  textPri:   '#ffffff',
  textSec:   '#8a9bb0',
  textMuted: '#5a6070',
  barTrack:  '#1e2128',
};

// ─── Reduced-motion detection ───────────────────────────────────────────────
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Keyframe injector (runs once) ─────────────────────────────────────────
let _keyframesInjected = false;
function injectKeyframes() {
  if (_keyframesInjected || typeof document === 'undefined') return;
  _keyframesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes _dot-pulse {
      0%   { transform: scale(1);   opacity: 1; }
      50%  { transform: scale(1.4); opacity: 0.7; }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes _fade-in-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes _fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes _scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes _slide-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes _fade-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Helper: build animation style string ──────────────────────────────────
function anim(name, duration, delay, easing = 'cubic-bezier(0.25,0,0,1)', fill = 'both') {
  if (prefersReducedMotion) return {};
  return {
    animation: `${name} ${duration}ms ${easing} ${delay}ms ${fill}`,
    opacity: 0,
  };
}

// ─── Feature badge data ─────────────────────────────────────────────────────
const BADGES = [
  { icon: TrendingUp,   label: 'Income'  },
  { icon: TrendingDown, label: 'Expense' },
  { icon: Flag,         label: 'Goals'   },
];

// ═══════════════════════════════════════════════════════════════════════════
// SplashScreen component
// ═══════════════════════════════════════════════════════════════════════════
export default function SplashScreen() {
  injectKeyframes();

  const [progress, setProgress]   = useState(0);
  const [exiting, setExiting]     = useState(false);
  const [dotPulse, setDotPulse]   = useState(false);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Progress bar animation: 0 → 100% over 1600ms, starting at t=1200ms
  const BAR_START    = 1200;  // ms
  const BAR_DURATION = 1600;  // ms → reaches 100% at 2800ms
  const NAV_AT       = 2800;  // ms → trigger navigation
  const MAX_WAIT     = 5000;  // ms → timeout for slow cold start

  useEffect(() => {
    // Dot pulse at 200ms
    const dotTimer = setTimeout(() => setDotPulse(true), 200);

    const tick = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;

      if (elapsed >= BAR_START) {
        const barElapsed = elapsed - BAR_START;
        const pct = Math.min(100, (barElapsed / BAR_DURATION) * 100);
        setProgress(pct);
      }

      if (elapsed < NAV_AT) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        // small delay so 100% is visible, then exit
        setTimeout(() => setExiting(true), 100);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(dotTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Styles ────────────────────────────────────────────────────────────────

  const containerStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: C.bg,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '52px 28px 40px',
    overflow: 'hidden',
    zIndex: 9999,
    ...(exiting && !prefersReducedMotion
      ? { animation: `_fade-out 200ms ease-out forwards` }
      : {}),
  };

  return (
    <div style={containerStyle}>

      {/* ── Decorative blur circles (behind everything) ── */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 180, height: 180, borderRadius: '50%',
        background: C.green, opacity: 0.07, pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -40,
        width: 150, height: 150, borderRadius: '50%',
        background: C.green, opacity: 0.05, pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── TOP ROW: Logo pill + status dot ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
        ...anim('_slide-up', 200, 0),
      }}>
        {/* Logo pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 99,
          padding: '5px 10px 5px 6px',
        }}>
          {/* Wallet icon box */}
          <div style={{
            width: 22, height: 22, borderRadius: 7,
            background: C.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Wallet size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textPri, letterSpacing: 0 }}>
            Dompetin
          </span>
        </div>

        {/* Status dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: C.green,
          ...(dotPulse && !prefersReducedMotion
            ? { animation: '_dot-pulse 300ms ease-out forwards' }
            : {}),
        }} />
      </div>

      {/* ── CENTER / HERO SECTION ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <p style={{
          fontSize: 10, fontWeight: 600, color: C.green,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          marginBottom: 16, lineHeight: 1,
          ...anim('_fade-in', 300, 400),
        }}>
          Your Finance App
        </p>

        {/* Headline line 1 — Track. */}
        <h1 style={{
          fontSize: 52, fontWeight: 600, color: C.green,
          letterSpacing: '-1.5px', lineHeight: 1.05,
          margin: 0,
          ...anim('_fade-in-up', 300, 600),
        }}>
          Track.
        </h1>

        {/* Headline line 2 — Control. */}
        <h1 style={{
          fontSize: 52, fontWeight: 600, color: C.textPri,
          letterSpacing: '-1.5px', lineHeight: 1.05,
          margin: '0 0 20px',
          ...anim('_fade-in-up', 300, 800),
        }}>
          Control.
        </h1>

        {/* Subtext */}
        <div style={{ ...anim('_fade-in', 250, 1000) }}>
          <p style={{
            fontSize: 12, fontWeight: 400, color: C.textMuted,
            lineHeight: 1.7, margin: 0,
          }}>
            Your money,{' '}
            <span style={{ color: C.textSec, fontWeight: 600 }}>your rules.</span>
          </p>
          <p style={{
            fontSize: 12, fontWeight: 400, color: C.textMuted,
            lineHeight: 1.7, margin: 0,
          }}>
            Start building wealth today.
          </p>
        </div>
      </div>

      {/* ── BOTTOM SECTION ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Feature badges */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 20,
          ...anim('_scale-in', 300, 1100),
        }}>
          {BADGES.map(({ icon: Icon, label }) => (
            <div key={label} style={{
              flex: 1,
              background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 10,
              padding: '8px 10px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
            }}>
              <Icon size={16} color={C.green} strokeWidth={2} />
              <span style={{
                fontSize: 9, fontWeight: 500,
                color: C.textMuted, letterSpacing: '0.3px',
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Track */}
          <div style={{
            flex: 1, height: 2, borderRadius: 99,
            background: C.barTrack, overflow: 'hidden',
          }}>
            {/* Fill */}
            <div style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: 99,
              background: C.green,
              transition: prefersReducedMotion ? 'none' : 'width 60ms linear',
            }} />
          </div>
          {/* Loading label */}
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: C.border, letterSpacing: '1px',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            LOADING...
          </span>
        </div>
      </div>
    </div>
  );
}
