import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, HEAD, MONO, NUM } from '../theme';
import { Backdrop, Body, clamp, Decode, easeInOut, FadeUp, Kicker, Neon, Onion, Panel, Pill, Scene, Title, Typed, useProgress } from '../components';

type D = { duration: number };

const Traffic: React.FC = () => (
  <div style={{ display: 'flex', gap: 9 }}>
    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
      <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
    ))}
  </div>
);

/** Portal's window chrome: title bar, top nav, accent per role. */
const AppWindow: React.FC<{ accent: string; active: string; children: React.ReactNode; style?: React.CSSProperties; title?: string }> = ({ accent, active, children, style, title = 'Portal' }) => (
  <div style={{ background: C.bg, border: `1px solid ${C.lineStrong}`, borderRadius: 22, overflow: 'hidden', boxShadow: `0 40px 120px -20px rgba(0,0,0,0.8), 0 0 60px -20px ${accent}55`, ...style }}>
    <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 26, padding: '0 22px', borderBottom: `1px solid ${C.line}`, background: C.surface }}>
      <Traffic />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 15, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 16, color: C.bg }}>P</div>
        <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, color: C.fg }}>{title}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {['Wallet', 'Market', 'Send', 'Swap', 'Router'].map((n) => (
          <div key={n} style={{ fontFamily: MONO, fontSize: 17, padding: '6px 16px', borderRadius: 999, color: n === active ? accent : C.muted, background: n === active ? `${accent}1a` : 'transparent', border: `1px solid ${n === active ? `${accent}55` : 'transparent'}` }}>
            {n}
          </div>
        ))}
      </div>
      <Pill color={C.green} style={{ fontSize: 14 }}>● tor</Pill>
    </div>
    <div style={{ position: 'relative' }}>{children}</div>
  </div>
);

export const PortalIntro: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const ring = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <Scene duration={duration}>
      <Backdrop>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <svg width={200} height={200} viewBox="0 0 200 200">
            <circle cx={100} cy={100} r={86} fill="none" stroke={C.azure} strokeWidth={4} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ring} style={{ filter: `drop-shadow(0 0 12px ${C.azure})` }} />
            <circle cx={100} cy={100} r={66} fill={C.azure} opacity={ring} />
            <text x={100} y={124} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={72} fill={C.bg} opacity={ring}>P</text>
          </svg>
          <div style={{ marginTop: 30 }}>
            <Decode text="Meet Portal" at={10} speed={0.9} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 120, color: C.fg }} />
          </div>
          <FadeUp at={30}>
            <Body size={34} style={{ textAlign: 'center' }}>One app for everything OpenSwap.</Body>
          </FadeUp>
          <FadeUp at={44} style={{ display: 'flex', gap: 16, marginTop: 30 }}>
            <Pill color={C.azure}>wallet</Pill>
            <Pill color={C.violet}>router</Pill>
          </FadeUp>
        </AbsoluteFill>
      </Backdrop>
    </Scene>
  );
};

export const Deploy: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const desk = useProgress(20, 18);
  const srv = useProgress(70, 18);
  const link = interpolate(frame, [150, 190], [0, 1], { ...clamp, easing: easeInOut });
  const browser = useProgress(185, 16);
  return (
    <Scene duration={duration}>
      <Backdrop>
        <AbsoluteFill style={{ padding: '100px 0 0 110px' }}>
          <Kicker>Portal</Kicker>
          <Title size={70} style={{ marginTop: 22 }}>Runs where you want it.</Title>
        </AbsoluteFill>
        {/* Desktop */}
        <div style={{ position: 'absolute', left: 110, top: 330, width: 760, opacity: desk, transform: `translateY(${(1 - desk) * 30}px)` }}>
          <AppWindow accent={C.azure} active="Wallet">
            <div style={{ height: 360, padding: 26, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
              <Panel style={{ padding: 22 }}>
                <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.2em', color: C.subtle }}>SPENDABLE BALANCE</div>
                <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 48, color: C.azure, marginTop: 8 }}>1,250,000</div>
                <div style={{ fontFamily: MONO, fontSize: 16, color: C.muted }}>sats</div>
              </Panel>
              <Panel style={{ padding: 22 }}>
                <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.2em', color: C.subtle }}>SWAPS</div>
                <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 48, color: C.fg, marginTop: 8 }}>12</div>
              </Panel>
            </div>
          </AppWindow>
          <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: C.fg }}>Desktop</div>
            <Pill color={C.azure}>macOS</Pill>
            <Pill color={C.azure}>Linux</Pill>
          </div>
        </div>
        {/* Server */}
        <div style={{ position: 'absolute', left: 1000, top: 330, width: 380, opacity: srv, transform: `translateY(${(1 - srv) * 30}px)` }}>
          <Panel accent={C.violet} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 16, color: C.subtle }}>server · terminal</div>
            <div style={{ padding: 20, height: 250, fontSize: 22, lineHeight: 1.7 }}>
              <div><Typed text="$ ./portal-web" at={90} cps={0.9} caret={frame < 110} style={{ color: C.fg }} /></div>
              {frame > 118 && <div style={{ fontFamily: MONO, color: C.green }}>✓ Portal Server running</div>}
              {frame > 130 && <div style={{ fontFamily: MONO, color: C.violet }}>✓ Tor started</div>}
              {frame > 142 && <div style={{ fontFamily: MONO, color: C.muted }}>→ open it from a browser</div>}
            </div>
          </Panel>
          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: C.fg }}>Server</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <Pill color={C.violet}>VPS</Pill>
              <Pill color={C.violet}>Raspberry Pi</Pill>
              <Pill color={C.violet}>Umbrel</Pill>
            </div>
          </div>
        </div>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <Neon d="M 1385 470 C 1470 470, 1470 420, 1540 420" color={C.violet} progress={link} width={2.5} />
        </svg>
        {/* Browser */}
        <div style={{ position: 'absolute', left: 1540, top: 330, width: 290, opacity: browser, transform: `translateY(${(1 - browser) * 30}px)` }}>
          <Panel style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.line}`, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Traffic />
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 13, color: C.muted, background: C.bg, borderRadius: 8, padding: '4px 10px' }}>your-server</div>
            </div>
            <div style={{ height: 200, padding: 18 }}>
              <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.2em', color: C.subtle }}>ROUTER</div>
              <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 34, color: C.violet, marginTop: 6 }}>running</div>
              <div style={{ height: 8, borderRadius: 4, background: C.surface, marginTop: 20, overflow: 'hidden' }}>
                <div style={{ width: `${40 + 50 * browser}%`, height: '100%', background: C.violet }} />
              </div>
            </div>
          </Panel>
          <Body size={22} style={{ marginTop: 18 }}>Reach it from any browser, anywhere.</Body>
        </div>
        <FadeUp at={210} style={{ position: 'absolute', left: 110, bottom: 90, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Onion size={40} />
          <Body size={28} style={{ color: C.fg }}>Tor is built in. Nothing to set up.</Body>
        </FadeUp>
      </Backdrop>
    </Scene>
  );
};

const Toggle: React.FC<{ on: number; color: string }> = ({ on, color }) => (
  <div style={{ width: 74, height: 40, borderRadius: 20, background: on > 0.5 ? color : C.surface, border: `1px solid ${on > 0.5 ? color : C.lineStrong}`, position: 'relative', boxShadow: on > 0.5 ? `0 0 20px -2px ${color}` : 'none', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 4, left: 4 + on * 34, width: 30, height: 30, borderRadius: 15, background: on > 0.5 ? C.bg : C.muted }} />
  </div>
);

const OPTIONS = [
  { name: 'Electrum', line: 'Start in seconds. No node needed.', color: C.azure },
  { name: 'Bitcoin Core', line: 'Your own full node. Trust nobody.', color: C.amber },
];

export const Backend: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const pick = frame < 110 ? 0 : frame < 150 ? 1 : 0;
  const torOn = interpolate(frame, [176, 186], [0, 1], { ...clamp, easing: easeInOut });
  const wire = useProgress(150, 20);
  const cardIn = [useProgress(20, 16), useProgress(32, 16)];
  return (
    <Scene duration={duration}>
      <Backdrop>
        <AbsoluteFill style={{ padding: '100px 0 0 110px' }}>
          <Kicker>Connection</Kicker>
          <Title size={70} style={{ marginTop: 22 }}>Two ways to see the chain.</Title>
        </AbsoluteFill>
        <div style={{ position: 'absolute', left: 110, top: 340, width: 1100, display: 'flex', gap: 30 }}>
          {OPTIONS.map((o, i) => {
            const s = cardIn[i];
            const sel = pick === i;
            return (
              <div key={o.name} style={{ flex: 1, opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
                <Panel accent={sel ? o.color : undefined} glow={sel ? 1 : 0} style={{ padding: '34px 36px', height: 230, boxSizing: 'border-box', borderColor: sel ? `${o.color}88` : C.line }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 44, color: sel ? o.color : C.fg }}>{o.name}</div>
                    <div style={{ width: 30, height: 30, borderRadius: 15, border: `2px solid ${sel ? o.color : C.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sel && <div style={{ width: 14, height: 14, borderRadius: 7, background: o.color }} />}
                    </div>
                  </div>
                  <Body size={28} style={{ marginTop: 18 }}>{o.line}</Body>
                </Panel>
              </div>
            );
          })}
        </div>
        {/* Electrum over Tor */}
        <div style={{ position: 'absolute', left: 110, top: 640, width: 535, opacity: wire }}>
          <Panel accent={torOn > 0.5 ? C.violet : undefined} glow={torOn} style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 24 }}>
            <Toggle on={torOn} color={C.violet} />
            <div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 28, color: C.fg }}>Reach Electrum over Tor</div>
              <Body size={22}>{torOn > 0.5 ? 'On: the server can’t see your IP.' : 'Off'}</Body>
            </div>
          </Panel>
        </div>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <Neon d="M 1420 450 L 1680 450" color={torOn > 0.5 ? C.violet : C.azure} progress={wire} width={3} />
        </svg>
        <div style={{ position: 'absolute', left: 1300, top: 390, opacity: wire }}>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: C.azure, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 50, color: C.bg, boxShadow: `0 0 30px -4px ${C.azure}` }}>P</div>
        </div>
        <div style={{ position: 'absolute', left: 1680, top: 390, opacity: wire }}>
          <Panel style={{ width: 150, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 18, color: C.muted }}>electrum</Panel>
        </div>
        {torOn > 0 &&
          [40, 60, 80].map((r, k) => (
            <div key={r} style={{ position: 'absolute', left: 1550 - r, top: 450 - r, width: r * 2, height: r * 2, borderRadius: r, border: `2px dashed ${C.violet}`, opacity: torOn * (0.8 - k * 0.2), transform: `rotate(${frame * (k % 2 ? -3 : 3)}deg)` }} />
          ))}
        <FadeUp at={200} style={{ position: 'absolute', left: 700, top: 668 }}>
          <Body size={30} style={{ color: C.fg }}>For more security, turn it on.</Body>
        </FadeUp>
      </Backdrop>
    </Scene>
  );
};

export const Cta: React.FC<D> = ({ duration }) => (
  <Scene duration={duration}>
    <Backdrop>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Decode text="Try Portal" at={2} speed={0.8} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 130, color: C.fg }} />
        <FadeUp at={16}>
          <Panel accent={C.azure} glow={1} style={{ marginTop: 40, padding: '26px 50px', display: 'flex', alignItems: 'center', gap: 26 }}>
            <svg width={56} height={56} viewBox="0 0 56 56" fill="none" stroke={C.azure} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M28 8 V36 M16 25 L28 37 L40 25 M12 46 H44" />
            </svg>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.2em', color: C.subtle }}>DOWNLOAD</div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 52, color: C.azure }}>openswap.live/portal</div>
            </div>
          </Panel>
        </FadeUp>
        <FadeUp at={30} style={{ display: 'flex', gap: 14, marginTop: 34 }}>
          <Pill color={C.azure}>macOS</Pill>
          <Pill color={C.azure}>Linux</Pill>
          <Pill color={C.violet}>server</Pill>
        </FadeUp>
        <FadeUp at={48} style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: C.green, boxShadow: `0 0 12px ${C.green}` }} />
          <Body size={26}>routers are live on mainnet: openswap.live/market</Body>
        </FadeUp>
      </AbsoluteFill>
    </Backdrop>
  </Scene>
);
