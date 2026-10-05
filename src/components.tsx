import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { BEAT, BODY, C, DISPLAY, MONO } from './theme';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 1 on the beat, decaying to 0 before the next one. */
export const useBeat = (offset = 0) => {
  const f = useCurrentFrame() - offset;
  const phase = ((f % BEAT) + BEAT) % BEAT;
  return Math.exp(-phase / 3.2);
};

export const useSpring = (delay = 0, config: Parameters<typeof spring>[0]['config'] = { damping: 14, mass: 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

/** The site's cream drafting paper. */
export const Paper: React.FC<{ drift?: boolean; children?: React.ReactNode }> = ({ drift = true, children }) => {
  const frame = useCurrentFrame();
  const shift = drift ? (frame * 0.35) % 144 : 0;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 14% 12%, rgba(0,0,0,0.05), transparent 30%),
          linear-gradient(180deg, #f8f3e9 0%, #f3ecdf 48%, #ede4d3 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
          backgroundSize: '36px 36px, 36px 36px, 144px 144px, 144px 144px',
          backgroundPosition: `${shift}px ${shift}px, ${shift}px ${shift}px, ${shift - 1}px ${shift - 1}px, ${shift - 1}px ${shift - 1}px`,
          opacity: 0.55,
        }}
      />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 260px rgba(80,60,20,0.16)' }} />
      {children}
    </AbsoluteFill>
  );
};

/** The yin-yang mark from openswap-bw.svg, drawn inline so it can spin. */
export const Logo: React.FC<{ size: number; rotate?: number; invert?: boolean; style?: React.CSSProperties }> = ({
  size,
  rotate = 0,
  invert = false,
  style,
}) => {
  const a = invert ? '#000000' : '#ffffff';
  const b = invert ? '#ffffff' : '#000000';
  return (
    <svg width={size} height={size} viewBox="0 0 960 960" style={{ transform: `rotate(${rotate}deg)`, ...style }}>
      <circle cx="479.5" cy="479.5" r="467.5" fill={a} />
      <path
        fill={b}
        d="M 479.5 12 A 467.5 467.5 0 0 1 479.5 947 L 479.5 935.8 A 228.3 228.3 0 0 1 479.5 479.2 L 479.5 479.8 A 228.3 228.3 0 0 0 479.5 23.2 L 479.5 12 Z"
      />
      <circle cx="479.5" cy="251.5" r="59.75" fill={b} />
      <circle cx="479.5" cy="707.5" r="59.75" fill={a} />
      <circle cx="479.5" cy="479.5" r="461.5" fill="none" stroke={b} strokeWidth="12" />
    </svg>
  );
};

/** Words rise in one by one from behind a mask. */
export const Rise: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties;
}> = ({ text, delay = 0, stagger = 3, style, wordStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'inherit', gap: '0 0.26em', ...style }}>
      {text.split(' ').map((w, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 15, mass: 0.7 } });
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - s) * 105}%) rotate(${(1 - s) * 6}deg)`,
                ...wordStyle?.(i),
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Characters type in like a terminal. */
export const Typed: React.FC<{ text: string; delay?: number; cps?: number; style?: React.CSSProperties; caret?: boolean }> = ({
  text,
  delay = 0,
  cps = 1.4,
  style,
  caret = true,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - delay) * cps)));
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={{ fontFamily: MONO, ...style }}>
      {text.slice(0, n)}
      {caret && frame >= delay && <span style={{ opacity: blink ? 1 : 0 }}>▍</span>}
    </span>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ children, dark, style }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 22,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '8px 18px',
      borderRadius: 999,
      border: `2px solid ${C.ink}`,
      background: dark ? C.ink : 'rgba(255,255,255,0.45)',
      color: dark ? C.paper : C.ink,
      display: 'inline-block',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

/** Ink card with the site's hard offset shadow. */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: C.card,
      border: `3px solid ${C.ink}`,
      borderRadius: 28,
      boxShadow: `10px 10px 0 ${C.ink}`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Scene envelope: scale-in on entry, punch-out on exit. */
export const Scene: React.FC<{ duration: number; children: React.ReactNode; out?: number }> = ({ duration, children, out = 8 }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [1.04, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const exit = interpolate(frame, [duration - out, duration], [1, 0.94], { ...clamp, easing: Easing.in(Easing.cubic) });
  const opacity = interpolate(frame, [duration - out, duration], [1, 0], clamp);
  return <AbsoluteFill style={{ transform: `scale(${enter * exit})`, opacity }}>{children}</AbsoluteFill>;
};

/** Ink bar sweeping across the cut, on the downbeat. */
export const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 14], [-120, 120], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  if (frame > 14) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          bottom: '-20%',
          width: '60%',
          left: `${20 + x}%`,
          background: C.ink,
          transform: 'skewX(-14deg)',
        }}
      />
    </AbsoluteFill>
  );
};

export const H: React.FC<{ size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, children, style }) => (
  <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: size, lineHeight: 1.02, color: C.ink, letterSpacing: '0.01em', ...style }}>
    {children}
  </div>
);

export const P: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 34, children, style }) => (
  <div style={{ fontFamily: BODY, fontSize: size, lineHeight: 1.4, color: C.ink70, ...style }}>{children}</div>
);
