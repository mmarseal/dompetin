import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Flag, Wallet } from 'lucide-react';

const C = {
  bg: '#0c0e13',
  green: '#1fba7e',
  greenGlow: '#4ee8a8',
  surface: '#111418',
  border: '#1e2330',
  textPri: '#ffffff',
  textSec: '#8a9bb0',
  textMuted: '#5a6070',
  barTrack: '#1e2128',
};

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    @keyframes _dot-glow {
      0%, 100% { box-shadow: 0 0 4px 1px rgba(31,186,126,0.6); }
      50%       { box-shadow: 0 0 10px 3px rgba(31,186,126,0.9); }
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
    @keyframes _glow-drift-tr {
      0%   { transform: scale(1)    translate(0px,  0px);  }
      50%  { transform: scale(1.08) translate(-8px, 10px); }
      100% { transform: scale(1)    translate(0px,  0px);  }
    }
    @keyframes _glow-drift-bl {
      0%   { transform: scale(1)    translate(0px,   0px); }
      50%  { transform: scale(1.06) translate(10px, -8px); }
      100% { transform: scale(1)    translate(0px,   0px); }
    }
  `;
  document.head.appendChild(style);
}


function anim(name, duration, delay, easing = 'cubic-bezier(0.25,0,0,1)', fill = 'both') {
  if (prefersReducedMotion) return {};
  return {
    animation: `${name} ${duration}ms ${easing} ${delay}ms ${fill}`,
    opacity: 0,
  };
}

const BADGES = [
  { icon: TrendingUp, label: 'Income' },
  { icon: TrendingDown, label: 'Expense' },
  { icon: Flag, label: 'Goals' },
];

export default function SplashScreen() {
  injectKeyframes();

  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [dotPulse, setDotPulse] = useState(false);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const BAR_START = 1200;
  const BAR_DURATION = 1600;
  const NAV_AT = 2800;

  useEffect(() => {
    const dotTimer = setTimeout(() => setDotPulse(true), 200);

    const tick = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;

      if (elapsed >= BAR_START) {
        const pct = Math.min(100, ((elapsed - BAR_START) / BAR_DURATION) * 100);
        setProgress(pct);
      }

      if (elapsed < NAV_AT) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => setExiting(true), 100);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(dotTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: C.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '52px 28px 40px',
      overflow: 'hidden', zIndex: 9999,
      ...(exiting && !prefersReducedMotion
        ? { animation: '_fade-out 200ms ease-out forwards' } : {}),
    }}>

      {/* Outer kanan atas */}
      <div style={{
        position: 'absolute', top: -100, right: -100, zIndex: 0,
        width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle,
          rgba(31,186,126,0.35) 0%,
          rgba(31,186,126,0.18) 35%,
          rgba(31,186,126,0.06) 60%,
          rgba(31,186,126,0.00) 75%)`,
        animation: prefersReducedMotion ? 'none' : '_glow-drift-tr 8s ease-in-out infinite',
      }} />
      {/* Inner core kanan atas */}
      <div style={{
        position: 'absolute', top: -30, right: -30, zIndex: 0,
        width: 160, height: 160, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle,
          rgba(78,232,168,0.22) 0%,
          rgba(31,186,126,0.08) 55%,
          rgba(31,186,126,0.00) 75%)`,
      }} />
      {/* Kiri bawah */}
      <div style={{
        position: 'absolute', bottom: -100, left: -80, zIndex: 0,
        width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle,
          rgba(31,186,126,0.25) 0%,
          rgba(31,186,126,0.10) 45%,
          rgba(31,186,126,0.00) 70%)`,
        animation: prefersReducedMotion ? 'none' : '_glow-drift-bl 10s ease-in-out infinite',
      }} />
      {/* Ambient center */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)', zIndex: 0,
        width: 340, height: 340, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle,
          rgba(31,186,126,0.05) 0%,
          rgba(31,186,126,0.00) 65%)`,
      }} />

      {/* ── TOP: Logo pill + status dot ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
        ...anim('_slide-up', 200, 0),
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: C.surface, border: `0.5px solid ${C.border}`,
          borderRadius: 99, padding: '5px 10px 5px 6px',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 7, background: C.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Wallet size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textPri }}>Dompetin</span>
        </div>

        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: C.green,
          boxShadow: `0 0 6px 2px rgba(31,186,126,0.5)`,
          ...(dotPulse && !prefersReducedMotion
            ? { animation: '_dot-pulse 300ms ease-out forwards, _dot-glow 2s ease-in-out 500ms infinite' }
            : { animation: '_dot-glow 2s ease-in-out infinite' }),
        }} />
      </div>

      {/* HERO */}
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

        <h1 style={{
          fontSize: 76,
          fontWeight: 700,
          color: C.green,
          letterSpacing: '-3px',
          lineHeight: 0.92,
          margin: 0,
          ...anim('_fade-in-up', 300, 600),
        }}>
          Track.
        </h1>

        <h1 style={{
          fontSize: 76,
          fontWeight: 700,
          color: C.textPri,
          letterSpacing: '-3px',
          lineHeight: 0.92,
          margin: '0 0 28px',
          ...anim('_fade-in-up', 300, 800),
        }}>
          Control.
        </h1>

        <div style={{ ...anim('_fade-in', 250, 1000) }}>
          <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.75, margin: 0 }}>
            Your money,{' '}
            <span style={{ color: C.textSec, fontWeight: 600 }}>your rules.</span>
          </p>
          <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.75, margin: 0 }}>
            Start building wealth today.
          </p>
        </div>

      </div>

      {/* BOTTOM */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        <div style={{
          display: 'flex', gap: 8, marginBottom: 20,
          ...anim('_scale-in', 300, 1100),
        }}>
          {BADGES.map(({ icon: Icon, label }) => (
            <div key={label} style={{
              flex: 1, background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 10, padding: '12px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <Icon size={18} color={C.green} strokeWidth={2} />
              <span style={{
                fontSize: 10, fontWeight: 500,
                color: C.textMuted, letterSpacing: '0.3px',
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, height: 3, borderRadius: 99,
            background: C.barTrack, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`, borderRadius: 99,
              background: `linear-gradient(90deg, ${C.green}, ${C.greenGlow})`,
              transition: prefersReducedMotion ? 'none' : 'width 60ms linear',
            }} />
          </div>
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