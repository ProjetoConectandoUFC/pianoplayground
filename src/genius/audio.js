// Sintetizador minimalista para a demonstração, ticks de countdown e jingles
// de vitória/derrota. O GarageBand toca o som do que o jogador pressiona.

import vaiaDataUrl from '../assets/genius/vaia-plateia.mp3?inline';

let ctx = null;

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function primeAudio() {
  ensureCtx();
  // Deixa a vaia decodificada antes da primeira derrota (sem atraso no erro)
  preloadBoo();
}

export function playNote(midi, durationMs, opts = {}) {
  const ac = ensureCtx();
  const now = ac.currentTime;
  const dur = Math.max(0.05, durationMs / 1000);
  const peak = opts.peak ?? 0.18;
  const type = opts.type ?? 'triangle';

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = midiToFreq(midi);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.012);
  gain.gain.setValueAtTime(peak, now + Math.max(0.05, dur - 0.1));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

export function playTick(emphasis = false) {
  const ac = ensureCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = emphasis ? 1320 : 880;
  const peak = emphasis ? 0.22 : 0.14;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

export function playWinJingle() {
  // Arpejo ascendente C E G C' e acorde sustentado
  const seq = [60, 64, 67, 72];
  seq.forEach((m, i) => {
    setTimeout(() => playNote(m, 220, { peak: 0.2 }), i * 110);
  });
  const chordDelay = seq.length * 110 + 60;
  setTimeout(() => {
    playNote(60, 1100, { peak: 0.14 });
    playNote(64, 1100, { peak: 0.12 });
    playNote(67, 1100, { peak: 0.12 });
    playNote(72, 1100, { peak: 0.14 });
  }, chordDelay);
}

export function playLoseJingle() {
  // Descida cromática dissonante
  setTimeout(() => playNote(55, 320, { type: 'sawtooth', peak: 0.16 }), 0);
  setTimeout(() => playNote(52, 320, { type: 'sawtooth', peak: 0.16 }), 220);
  setTimeout(() => playNote(48, 720, { type: 'sawtooth', peak: 0.18 }), 440);
}

// ─── Vitória final (estágio 3): jingle triunfal + estouros de fogos ───
//
// Os sons agendados via setTimeout ficam rastreados para que ESC consiga
// cancelá-los a meio caminho.

let celebrationTimers = [];
function scheduleCelebration(fn, delay) {
  const id = setTimeout(() => {
    celebrationTimers = celebrationTimers.filter((x) => x !== id);
    fn();
  }, delay);
  celebrationTimers.push(id);
  return id;
}
export function cancelCelebrationSounds() {
  for (const id of celebrationTimers) clearTimeout(id);
  celebrationTimers = [];
}

export function playChampionJingle() {
  // Arpejo rápido subindo: C5 E5 G5 C6, voz dobrada uma oitava acima para brilho
  const seq = [72, 76, 79, 84];
  seq.forEach((m, i) => {
    scheduleCelebration(() => {
      playNote(m, 220, { peak: 0.2 });
      playNote(m + 12, 220, { peak: 0.07, type: 'sine' });
    }, i * 85);
  });
  // Acento agudo final no E6
  scheduleCelebration(() => {
    playNote(88, 420, { peak: 0.18 });
    playNote(76, 420, { peak: 0.1, type: 'sine' });
  }, seq.length * 85 + 60);
  // Acorde maior sustentado e brilhante
  scheduleCelebration(() => {
    playNote(72, 2200, { peak: 0.13 });
    playNote(76, 2200, { peak: 0.12 });
    playNote(79, 2200, { peak: 0.12 });
    playNote(84, 2200, { peak: 0.15 });
    playNote(88, 2200, { peak: 0.10 });
  }, seq.length * 85 + 460);
}

function makeNoiseBuffer(durationSec) {
  const ac = ensureCtx();
  const size = Math.floor(ac.sampleRate * durationSec);
  const buf = ac.createBuffer(1, size, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function playFireworkBurst() {
  const ac = ensureCtx();
  const now = ac.currentTime;

  // 1) "Boom" grave — sine descendo rápido
  const boom = ac.createOscillator();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(160 + Math.random() * 90, now);
  boom.frequency.exponentialRampToValueAtTime(45, now + 0.18);
  const bGain = ac.createGain();
  const bPeak = 0.20 + Math.random() * 0.06;
  bGain.gain.setValueAtTime(0, now);
  bGain.gain.linearRampToValueAtTime(bPeak, now + 0.004);
  bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
  boom.connect(bGain).connect(ac.destination);
  boom.start(now);
  boom.stop(now + 0.28);

  // 2) Crepitar/sparkle — ruído highpassado decaindo lento
  const noiseSrc = ac.createBufferSource();
  noiseSrc.buffer = makeNoiseBuffer(0.95);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2600 + Math.random() * 1400;
  const nGain = ac.createGain();
  const nPeak = 0.09 + Math.random() * 0.04;
  nGain.gain.setValueAtTime(0, now + 0.05);
  nGain.gain.linearRampToValueAtTime(nPeak, now + 0.09);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
  noiseSrc.connect(hp).connect(nGain).connect(ac.destination);
  noiseSrc.start(now);
  noiseSrc.stop(now + 0.8);
}

export function playFireworks(burstCount = 7) {
  // Estouros espalhados ao longo de ~3s com timing irregular para soar natural
  for (let i = 0; i < burstCount; i++) {
    const base = 200 + i * 380;
    const jitter = (Math.random() - 0.5) * 220;
    scheduleCelebration(playFireworkBurst, base + jitter);
  }
}

// ─── Modo tomate: "splat" de um tomate batendo na tela ───
// Um baque grave curto (seno caindo de tom) somado a um chiado de ruído
// filtrado, que dá a textura molhada do esmagamento.
export function playSplat() {
  const c = ensureCtx();
  const t = c.currentTime;

  const thump = c.createOscillator();
  const thumpGain = c.createGain();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(190, t);
  thump.frequency.exponentialRampToValueAtTime(55, t + 0.16);
  thumpGain.gain.setValueAtTime(0.0001, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.5, t + 0.008);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  thump.connect(thumpGain).connect(c.destination);
  thump.start(t);
  thump.stop(t + 0.25);

  const dur = 0.32;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = Math.pow(1 - i / data.length, 2.2);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const filtro = c.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.setValueAtTime(1400, t);
  filtro.frequency.exponentialRampToValueAtTime(380, t + dur);
  filtro.Q.value = 0.9;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.55;
  noise.connect(filtro).connect(noiseGain).connect(c.destination);
  noise.start(t);
}

// ─── Modo tomate: vaia da plateia ───
// Gravação real de uma plateia vaiando (src/assets/genius/vaia-plateia.mp3):
// os 3 primeiros segundos do áudio enviado pela equipe, com fade no fim.
//
// Toca pelo MESMO AudioContext das notas (Web Audio), não por um <audio>
// separado. O <audio> podia ser bloqueado pela política de autoplay do
// navegador (jogo só pelo teclado MIDI, ou comandado pelo telão), e aí a
// vaia sumia enquanto as notas tocavam. O arquivo vem embutido no código
// (?inline, base64), então também não depende de fetch no Electron (file://).
let vaiaBuffer = null;
let vaiaCarregando = null;
let vaiaFonte = null;

function base64ParaArrayBuffer(dataUrl) {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export function preloadBoo() {
  if (vaiaBuffer) return Promise.resolve(vaiaBuffer);
  if (vaiaCarregando) return vaiaCarregando;
  const c = ensureCtx();
  vaiaCarregando = new Promise((resolve, reject) => {
    // forma com callbacks: funciona em todas as versões do Chromium
    c.decodeAudioData(base64ParaArrayBuffer(vaiaDataUrl), resolve, reject);
  }).then((buf) => {
    vaiaBuffer = buf;
    return buf;
  }).catch((err) => {
    vaiaCarregando = null; // tenta de novo na próxima
    console.warn('[genius] vaia não decodificada', err);
    return null;
  });
  return vaiaCarregando;
}

export function playBoo() {
  const c = ensureCtx(); // também retoma o contexto se estiver suspenso
  stopBoo();
  const tocar = (buf) => {
    if (!buf) return;
    const fonte = c.createBufferSource();
    fonte.buffer = buf;
    const g = c.createGain();
    g.gain.value = 0.9;
    fonte.connect(g).connect(c.destination);
    fonte.onended = () => { if (vaiaFonte === fonte) vaiaFonte = null; };
    fonte.start();
    vaiaFonte = fonte;
  };
  if (vaiaBuffer) tocar(vaiaBuffer);
  else preloadBoo().then(tocar);
}

export function stopBoo() {
  if (vaiaFonte) {
    try { vaiaFonte.stop(); } catch { /* já parou */ }
    vaiaFonte = null;
  }
}
