import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { BEAT, C, DISPLAY, MONO } from '../theme';
import { Card, Chip, clamp, P, Paper, Rise, Scene, useBeat, useSpring } from '../components';

type Mode = {
  number: string;
  name: string;
  tag: string;
  lines: string[];
  Visual: React.FC;
};

const draw = (frame: number, at: number, len = 18) =>
  interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

const TaprootVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const glow = draw(frame, BEAT * 3, 12);
  // Key path lights up; script leaves stay as quiet fallbacks.
  return (
    <svg width={760} height={620} viewBox="0 0 760 620">
      <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round">
        <path d="M380 560 L380 380" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw(frame, 4)} />
        <path d="M380 380 L200 220" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw(frame, 12)} strokeOpacity={0.35} />
        <path d="M380 380 L560 220" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw(frame, 12)} strokeOpacity={0.35} />
      </g>
      <rect x={250} y={500} width={260} height={100} rx={22} fill={glow > 0.5 ? C.ink : C.card} stroke={C.ink} strokeWidth={5} />
      <text x={380} y={562} textAnchor="middle" fontFamily={DISPLAY} fontWeight={600} fontSize={36} fill={glow > 0.5 ? C.paper : C.ink}>
        looks normal
      </text>
      <circle cx={380} cy={380} r={26 + beat * 6} fill={C.orange} stroke={C.ink} strokeWidth={5} />
      {[
        { x: 200, l: 'swap done' },
        { x: 560, l: 'refund' },
      ].map(({ x, l }, i) => (
        <g key={l} opacity={draw(frame, 18 + i * 4)}>
          <rect x={x - 110} y={130} width={220} height={90} rx={20} fill={C.card} stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" />
          <text x={x} y={186} textAnchor="middle" fontFamily={MONO} fontSize={28} fill={C.ink70}>
            {l}
          </text>
        </g>
      ))}
      <text x={380} y={60} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={C.ink45} opacity={glow}>
        to anyone watching, it's just a payment
      </text>
    </svg>
  );
};

const LegacyVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const lock = useSpring(BEAT * 2, { damping: 9 });
  return (
    <svg width={760} height={620} viewBox="0 0 760 620">
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${150 + i * 280} ${200 - (1 - lock) * 40 * (i ? 1 : -1)})`} opacity={draw(frame, i * 5)}>
          <rect x={0} y={80} width={180} height={150} rx={24} fill={C.card} stroke={C.ink} strokeWidth={5} />
          <path d="M40 80 L40 40 A50 50 0 0 1 140 40 L140 80" fill="none" stroke={C.ink} strokeWidth={10} transform={`translate(0 ${(1 - lock) * -30})`} />
          <text x={90} y={170} textAnchor="middle" fontFamily={DISPLAY} fontWeight={600} fontSize={44} fill={C.ink}>
            {i ? 'B' : 'A'}
          </text>
        </g>
      ))}
      <text x={380} y={500} textAnchor="middle" fontFamily={DISPLAY} fontWeight={600} fontSize={44} fill={C.ink} opacity={lock}>
        a shared safe
      </text>
      <g opacity={draw(frame, BEAT * 3)}>
        <rect x={190} y={530} width={380} height={64} rx={32} fill={C.ink} />
        <text x={380} y={573} textAnchor="middle" fontFamily={MONO} fontSize={28} fill={C.paper}>
          refund built in
        </text>
      </g>
    </svg>
  );
};

const PaySwapVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const target = 250000;
  const counted = Math.round(target * Easing.out(Easing.cubic)(draw(frame, 10, 40)));
  const done = frame > 52;
  return (
    <svg width={760} height={620} viewBox="0 0 760 620">
      <path d="M90 310 C 250 120, 480 500, 620 310" fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="16 12" strokeDashoffset={-frame * 3} opacity={draw(frame, 0)} />
      <circle cx={90} cy={310} r={46} fill={C.orange} stroke={C.ink} strokeWidth={5} />
      <text x={90} y={326} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={46}>₿</text>
      <g transform="translate(560 220)">
        <rect width={180} height={180} rx={30} fill={done ? C.ink : C.card} stroke={C.ink} strokeWidth={5} />
        <text x={90} y={100} textAnchor="middle" fontFamily={DISPLAY} fontWeight={600} fontSize={34} fill={done ? C.paper : C.ink}>
          receiver
        </text>
        <text x={90} y={140} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={done ? C.paper : C.ink45}>
          bc1q…7x2m
        </text>
      </g>
      <text x={380} y={520} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={64} fill={C.ink}>
        {counted.toLocaleString('en-US')} sats
      </text>
      <text x={380} y={580} textAnchor="middle" fontFamily={MONO} fontSize={28} fill={done ? C.ink : C.ink45}>
        {done ? '✓ delivered' : 'swapping…'}
      </text>
    </svg>
  );
};

export const MODES: Record<'taproot' | 'legacy' | 'payswap', Mode> = {
  taproot: {
    number: '01',
    name: 'Taproot',
    tag: 'Most private',
    lines: ['Your swap looks like any', 'ordinary payment. And if anything', 'goes wrong, you get your coins back.'],
    Visual: TaprootVisual,
  },
  legacy: {
    number: '02',
    name: 'Legacy',
    tag: 'The original',
    lines: ['Both sides lock their coins', 'in a shared safe. The swap completes,', 'or everyone gets refunded.'],
    Visual: LegacyVisual,
  },
  payswap: {
    number: '03',
    name: 'PaySwap',
    tag: 'Pay anyone',
    lines: ['Send bitcoin to someone', 'via an OpenSwap.'],
    Visual: PaySwapVisual,
  },
};

export const Protocol: React.FC<{ mode: keyof typeof MODES; duration: number }> = ({ mode, duration }) => {
  const m = MODES[mode];
  const frame = useCurrentFrame();
  const beat = useBeat();
  const num = useSpring(0, { damping: 12 });
  const card = useSpring(6, { damping: 13 });
  return (
    <Scene duration={duration}>
      <Paper>
        <div
          style={{
            position: 'absolute',
            right: -40,
            bottom: -120,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 620,
            color: 'transparent',
            WebkitTextStroke: `3px ${C.ink12}`,
            transform: `translateY(${(1 - num) * 200}px)`,
          }}
        >
          {m.number}
        </div>
        <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', padding: '0 110px', gap: 60 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
              <Chip dark>{`mode ${m.number}`}</Chip>
              <Chip style={{ transform: `scale(${1 + beat * 0.04})` }}>{m.tag}</Chip>
            </div>
            <Rise text={m.name} delay={2} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, color: C.ink, letterSpacing: '0.01em' }} />
            <div style={{ marginTop: 26 }}>
              {m.lines.map((l, i) => (
                <P key={i} size={40} style={{ opacity: interpolate(frame, [10 + i * 4, 20 + i * 4], [0, 1], clamp), transform: `translateX(${interpolate(frame, [10 + i * 4, 20 + i * 4], [-30, 0], clamp)}px)` }}>
                  {l}
                </P>
              ))}
            </div>
          </div>
          <Card style={{ width: 800, height: 680, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${(1 - card) * 900}px) rotate(${(1 - card) * 8}deg)` }}>
            <m.Visual />
          </Card>
        </AbsoluteFill>
      </Paper>
    </Scene>
  );
};
