// Modo tomate: quando o jogador erra uma nota, tomates voam "na cara" de quem
// joga (crescem do fundo da tela até o primeiro plano) e se esborracham,
// deixando manchas que escorrem. As manchas ficam até a próxima rodada
// começar, quando a tela é "limpa".
//
// API: initTomates(container), throwTomatoes(qtd, onSplat) -> Promise,
// clearTomatoes(animado).

let layer = null;
let timers = [];

const rand = (a, b) => a + Math.random() * (b - a);

const TOMATE_SVG = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="56" rx="42" ry="38" fill="#e0302b"/>
  <ellipse cx="50" cy="56" rx="42" ry="38" fill="url(#tg)"/>
  <defs>
    <radialGradient id="tg" cx="35%" cy="35%" r="70%">
      <stop offset="0" stop-color="#ff8a6e" stop-opacity="0.9"/>
      <stop offset="0.45" stop-color="#e0302b" stop-opacity="0"/>
      <stop offset="1" stop-color="#8c1712" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <path d="M50 22 L40 14 L47 21 L34 22 L47 26 L42 34 L50 27 L58 34 L53 26 L66 22 L53 21 L60 14 Z" fill="#2f9a3a"/>
  <rect x="48" y="8" width="4" height="14" rx="2" fill="#2f7a2f"/>
</svg>`;

// Mancha irregular: um contorno de "estrela mole" com raios sorteados,
// suavizado com curvas, mais gotas soltas em volta e sementes.
function blobPath(cx, cy, r, pontas) {
  const pts = [];
  for (let i = 0; i < pontas; i++) {
    const a = (i / pontas) * Math.PI * 2 + rand(-0.12, 0.12);
    const rr = r * (i % 2 === 0 ? rand(0.95, 1.35) : rand(0.55, 0.8));
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % pts.length];
    const mx = (p0[0] + p1[0]) / 2;
    const my = (p0[1] + p1[1]) / 2;
    if (i === 0) d += `M${mx.toFixed(1)} ${my.toFixed(1)} `;
    else d += `Q${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)} `;
  }
  const p0 = pts[0];
  const p1 = pts[1];
  d += `Q${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ${((p0[0] + p1[0]) / 2).toFixed(1)} ${((p0[1] + p1[1]) / 2).toFixed(1)} Z`;
  return d;
}

function splatSvg() {
  let gotas = '';
  for (let i = 0; i < 9; i++) {
    const a = rand(0, Math.PI * 2);
    const dist = rand(52, 78);
    gotas += `<circle cx="${(100 + Math.cos(a) * dist).toFixed(1)}" cy="${(100 + Math.sin(a) * dist).toFixed(1)}" r="${rand(3, 8).toFixed(1)}" fill="#d42a22"/>`;
  }
  let sementes = '';
  for (let i = 0; i < 7; i++) {
    const a = rand(0, Math.PI * 2);
    const dist = rand(4, 26);
    const x = 100 + Math.cos(a) * dist;
    const y = 100 + Math.sin(a) * dist;
    sementes += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.2" ry="1.8" transform="rotate(${Math.round(rand(0, 180))} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#ffd66b" opacity="0.85"/>`;
  }
  // Escorridos: retângulos arredondados que descem do meio da mancha
  let escorridos = '';
  const qtd = Math.round(rand(2, 4));
  for (let i = 0; i < qtd; i++) {
    const x = 100 + rand(-30, 30);
    const w = rand(6, 11);
    const h = rand(60, 95);
    escorridos += `<rect class="tomate-escorrido" x="${(x - w / 2).toFixed(1)}" y="100" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(w / 2).toFixed(1)}" fill="#c9241d" style="--atraso:${Math.round(rand(150, 700))}ms"/>`;
  }
  return `
<svg viewBox="0 0 200 200" aria-hidden="true">
  ${escorridos}
  <path d="${blobPath(100, 100, 52, 16)}" fill="#c9241d"/>
  <path d="${blobPath(100, 100, 40, 12)}" fill="#e0302b"/>
  <path d="${blobPath(94, 94, 20, 10)}" fill="#f2564a" opacity="0.8"/>
  ${gotas}
  ${sementes}
</svg>`;
}

// Posição aleatória fora do miolo da tela, onde aparece o cartão de
// resultado (os botões continuam legíveis e clicáveis).
// Também tenta manter distância das manchas já jogadas na mesma saraivada,
// para a sujeira se espalhar pela tela em vez de empilhar num canto.
function posicaoLivre(usadas) {
  let melhor = null;
  let melhorDist = -1;
  for (let i = 0; i < 40; i++) {
    const x = rand(6, 94);
    const y = rand(10, 90);
    if (Math.abs(x - 50) <= 30 && Math.abs(y - 50) <= 38) continue;
    // distância em "tela 16:9": o eixo x pesa mais
    const dist = usadas.length
      ? Math.min(...usadas.map((u) => Math.hypot((x - u.x) * 1.6, y - u.y)))
      : 999;
    if (dist > melhorDist) { melhor = { x, y }; melhorDist = dist; }
    if (dist > 34) break;
  }
  return melhor || { x: rand(4, 16), y: rand(10, 90) };
}

export function initTomates(container) {
  layer = container;
}

export function throwTomatoes(qtd = 4, onSplat) {
  if (!layer) return Promise.resolve();
  layer.classList.remove('hidden', 'limpando');
  const VOO = 520; // ms do arremesso até o impacto
  // Com muitos tomates, a saraivada fica mais rápida e as manchas, menores
  const INTERVALO = qtd > 4 ? 170 : 260;
  const usadas = [];
  return new Promise((resolve) => {
    for (let i = 0; i < qtd; i++) {
      const t = setTimeout(() => {
        const { x, y } = posicaoLivre(usadas);
        usadas.push({ x, y });
        const tam = qtd > 4 ? rand(230, 360) : rand(300, 440); // px da mancha
        const tomate = document.createElement('div');
        tomate.className = 'tomate-voo';
        tomate.style.left = `${x}%`;
        tomate.style.top = `${y}%`;
        tomate.style.setProperty('--voo', `${VOO}ms`);
        tomate.style.setProperty('--giro', `${Math.round(rand(-260, 260))}deg`);
        tomate.style.setProperty('--de-x', `${Math.round(rand(-35, 35))}vw`);
        tomate.style.setProperty('--de-y', `${Math.round(rand(20, 45))}vh`);
        tomate.innerHTML = TOMATE_SVG;
        layer.appendChild(tomate);

        const t2 = setTimeout(() => {
          tomate.remove();
          const mancha = document.createElement('div');
          mancha.className = 'tomate-mancha';
          mancha.style.left = `${x}%`;
          mancha.style.top = `${y}%`;
          mancha.style.width = `${tam}px`;
          mancha.style.height = `${tam}px`;
          mancha.style.setProperty('--rot', `${Math.round(rand(0, 360))}deg`);
          mancha.innerHTML = splatSvg();
          layer.appendChild(mancha);
          // Tranco na tela a cada impacto
          layer.classList.remove('tranco');
          void layer.offsetWidth;
          layer.classList.add('tranco');
          if (onSplat) onSplat(i);
          if (i === qtd - 1) resolve();
        }, VOO);
        timers.push(t2);
      }, i * INTERVALO);
      timers.push(t);
    }
  });
}

export function clearTomatoes(animado = true) {
  for (const t of timers) clearTimeout(t);
  timers = [];
  if (!layer || !layer.childElementCount) return;
  if (!animado) {
    layer.innerHTML = '';
    return;
  }
  layer.classList.add('limpando');
  const alvo = layer;
  setTimeout(() => {
    if (alvo.classList.contains('limpando')) {
      alvo.innerHTML = '';
      alvo.classList.remove('limpando');
    }
  }, 450);
}
