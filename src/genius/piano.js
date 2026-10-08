// Renderiza um teclado de 25 teclas (estilo AKAI MPK Mini) — C3 (48) a C5 (72).
// API: build(container), flash(midi, durationMs, mode), clearAll().
// Efeito visual: no modo 'player' a tecla fica turquesa e solta estrelas e
// triângulos pelos lados (camada .key-fx-layer, acima de todas as teclas).

const FIRST_MIDI = 48;
const LAST_MIDI = 72;
const BLACK_OFFSETS = new Set([1, 3, 6, 8, 10]);

const keyEls = new Map(); // midi -> element
let fxLayer = null;       // camada das partículas do acerto do jogador

function isBlack(midi) {
  return BLACK_OFFSETS.has(((midi % 12) + 12) % 12);
}

export function buildPiano(container) {
  container.innerHTML = '';
  keyEls.clear();

  const keys = [];
  for (let m = FIRST_MIDI; m <= LAST_MIDI; m++) {
    keys.push({ midi: m, black: isBlack(m) });
  }
  const whiteCount = keys.filter((k) => !k.black).length;
  const whiteW = 100 / whiteCount;
  const blackW = whiteW * 0.6;

  let whiteIdx = 0;
  for (const k of keys) {
    const el = document.createElement('div');
    el.classList.add('key', k.black ? 'black' : 'white');
    el.dataset.midi = String(k.midi);
    if (k.black) {
      el.style.left = `${whiteIdx * whiteW - blackW / 2}%`;
      el.style.width = `${blackW}%`;
    } else {
      el.style.left = `${whiteIdx * whiteW}%`;
      el.style.width = `${whiteW}%`;
      whiteIdx++;
    }
    container.appendChild(el);
    keyEls.set(k.midi, el);
  }

  fxLayer = document.createElement('div');
  fxLayer.className = 'key-fx-layer';
  fxLayer.setAttribute('aria-hidden', 'true');
  container.appendChild(fxLayer);
}

// Estrelas e triângulos turquesa que saem pelos dois lados da tecla tocada.
const rand = (a, b) => a + Math.random() * (b - a);

function burst(el) {
  if (!fxLayer) return;
  const x = el.offsetLeft;
  const y = el.offsetTop;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const unit = Math.max(6, Math.min(w, 120)); // tamanho de referência da peça
  const count = 16;

  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;        // alterna esquerda / direita
    const star = i % 4 < 1 || Math.random() < 0.2;
    const p = document.createElement('span');
    p.className = star ? 'key-fx star' : 'key-fx tri';

    const size = star ? unit * rand(0.22, 0.28) : unit * rand(0.11, 0.14);
    const startX = side < 0 ? x + rand(-0.04, 0.06) * w : x + w - rand(-0.04, 0.06) * w;
    const startY = y + h * rand(0.08, 0.98);

    p.style.left = `${startX}px`;
    p.style.top = `${startY}px`;
    p.style.setProperty('--size', `${size.toFixed(1)}px`);
    p.style.setProperty('--dx', `${(side * unit * rand(0.18, 0.55)).toFixed(1)}px`);
    p.style.setProperty('--dy', `${(-unit * rand(0.05, 0.35)).toFixed(1)}px`);
    p.style.setProperty('--rot0', `${Math.round(rand(-40, 40))}deg`);
    p.style.setProperty('--rot1', `${Math.round(rand(60, 200) * side)}deg`);
    p.style.setProperty('--dur', `${Math.round(rand(780, 1100))}ms`);
    p.style.setProperty('--delay', `${Math.round(rand(0, 120))}ms`);
    p.addEventListener('animationend', () => p.remove(), { once: true });
    fxLayer.appendChild(p);
  }
}

// Mapeia uma nota MIDI qualquer para a tecla visível (transpõe oitavas se sair do range).
function visualKeyFor(midi) {
  let m = midi;
  while (m < FIRST_MIDI) m += 12;
  while (m > LAST_MIDI) m -= 12;
  return keyEls.get(m);
}

const timers = new Map();

export function flash(midi, durationMs, mode = 'demo') {
  const el = visualKeyFor(midi);
  if (!el) return;
  const cls = mode === 'player' ? 'player-pressed' : 'pressed';

  el.classList.add(cls);
  if (mode === 'player') burst(el);
  if (timers.has(el)) clearTimeout(timers.get(el));
  const t = setTimeout(() => {
    el.classList.remove(cls);
    timers.delete(el);
  }, Math.max(80, durationMs));
  timers.set(el, t);
}

export function setPressed(midi, on) {
  const el = visualKeyFor(midi);
  if (!el) return;
  el.classList.toggle('player-pressed', on);
}

export function clearAll() {
  for (const el of keyEls.values()) {
    el.classList.remove('pressed', 'player-pressed');
  }
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  if (fxLayer) fxLayer.innerHTML = '';
}

// Mostra (ou remove, com null) a letra do teclado do computador sobre cada
// tecla correspondente. `labels` é um Map midi -> letra.
export function setKeyLabels(labels) {
  for (const [midi, el] of keyEls) {
    let tag = el.querySelector('.key-label');
    const text = labels ? labels.get(midi) : undefined;
    if (!text) {
      if (tag) tag.remove();
      continue;
    }
    if (!tag) {
      tag = document.createElement('span');
      tag.className = 'key-label';
      el.appendChild(tag);
    }
    tag.textContent = text;
  }
}
