// Renders one narration clip per scene with macOS `say`, fits each into its scene,
// and records where it plays: public/narration/<scene>.wav + src/narration-timing.json.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(root, 'src/timeline.json'), 'utf8'));
const N = JSON.parse(readFileSync(join(root, 'src/narration.json'), 'utf8'));
const out = join(root, 'public/narration');
mkdirSync(out, { recursive: true });

const barSec = (60 / T.bpm) * 4;
const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

const timing = {};
for (const [scene, text] of Object.entries(N.lines)) {
  const [a, b] = T.sections[scene];
  const room = (b - a) * barSec - N.leadInSec - 0.5;
  const aiff = join(out, `${scene}.aiff`);
  const wav = join(out, `${scene}.wav`);
  // "..." becomes a real breath; the voice keeps a natural pace and only nudges
  // up a few percent to fit. Anything longer is flagged to be trimmed, not rushed.
  const spoken = text.replace(/\.\.\./g, ` [[slnc ${N.pauseMs ?? 400}]] `);
  let rate = N.rate;
  let dur = Infinity;
  for (const r of [N.rate, Math.round(N.rate * 1.03), Math.round(N.rate * 1.06)]) {
    rate = r;
    execFileSync('say', ['-v', N.voice, '-r', String(rate), '-o', aiff, spoken]);
    dur = seconds(aiff);
    if (dur <= room) break;
  }
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', aiff, '-ar', '44100', '-ac', '2', '-af', 'highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,volume=2.5dB', wav]);
  rmSync(aiff);
  timing[scene] = { startSec: a * barSec + N.leadInSec, durSec: dur, rate, fits: dur <= room };
  console.log(`${scene.padEnd(10)} ${dur.toFixed(1)}s of ${room.toFixed(1)}s room @ ${rate} wpm${dur > room ? '  (TOO LONG)' : ''}`);
}
writeFileSync(join(root, 'src/narration-timing.json'), JSON.stringify(timing, null, 2) + '\n');
