// =====================================================================
// MOTOR DA GELATINA (versão em texto, sem desenhar no canvas)
// ---------------------------------------------------------------------
// Cada letra das sete palavras é um elemento de texto da página. O motor
// calcula, a cada quadro, a posição, o tamanho e a deformação de cada
// letra e aplica tudo com transformações CSS. Não depende de React: recebe
// um elemento, um objeto de opções e eventos de nota.
//
// Ideias centrais (as mesmas do motor anterior):
//  - Cada palavra tem um LUGAR FIXO, calculado uma vez com todas as
//    notas em repouso. Tocar não refaz o arranjo: a palavra cresce no
//    próprio centro e as vizinhas apenas cedem espaço.
//  - Cada letra tem uma mola própria, mole e pouco amortecida. O toque a
//    empurra: a letra achata, estica e entorta, em onda de letra em letra,
//    e treme de leve enquanto a tecla está segurada (igual ao Laboratório).
//  - Nada escapa da tela: a caixa final é presa dentro da margem e,
//    se não couber, a palavra encolhe o necessário.
//
// Novidades do desenho em texto:
//  - Fontes variáveis podem mudar de eixo a cada quadro
//    (font-variation-settings). As "fontes mutáveis" (Kablammo, Shantell Sans,
//    Tilt Warp, as pixel e as de efeito automático, como Hela e Graduate)
//    usam isso como
//    efeito próprio, no lugar de esticar e entortar a letra.
//  - Um canvas fora da tela continua sendo usado só para MEDIR as letras
//    (largura e altura da tinta); ele nunca desenha nada visível.
// =====================================================================

export type RGB = [number, number, number];

/** Efeitos próprios de algumas fontes variáveis */
export type FontEffect = 'kablammo' | 'shantell' | 'tiltwarp' | 'auto' | 'estilos' | 'eixos';

/** Eixo de uma fonte variável (efeito 'auto') */
export interface EixoVariavel { tag: string; min: number; padrao: number; max: number }

export interface GelatinaOptions {
    /** Sete rótulos, na ordem da escala */
    labels: string[];
    /** Sete cores em HEX, na mesma ordem */
    colors: string[];
    /** Cor que a palavra assume quando a nota tocada é sustenido */
    sharpColor: string;
    /** Fundo da projeção */
    ground: string;
    /** Contorno das letras */
    ink: string;
    /** Quanto a cor da nota inativa se mistura ao fundo (0 a 1) */
    wash: number;
    /** Especificação usada para medir e carregar a fonte, ex: 400 100px "Modak" */
    fontSpec: string;
    /** Pilha CSS da fonte, ex: "Modak", sans-serif */
    family: string;
    /** Peso CSS da fonte */
    weight: number;
    /** Efeito próprio da fonte (fontes variáveis), ou nenhum */
    effect?: FontEffect | null;
    /** Eixos da fonte, para o efeito 'auto' (lidos do arquivo no build) */
    axes?: EixoVariavel[];
    /** Fontes sem acentos: a letra base sai da fonte escolhida e o acento sai desta
     *  fonte doadora, escalado e posicionado sobre a base (ver measure) */
    acento?: { familia: string; peso: number } | null;
    /** Efeito 'eixos': cada eixo vai do repouso ao toque, junto com a força do toque */
    eixosToque?: { tag: string; repouso: number; toque: number }[];
    /** Efeito 'estilos': famílias estáticas em ordem (repouso → mais forte) e alternas */
    estilos?: { familias: string[]; alternas?: string[] };
    /** Sistema de nomes. No anglicano (uma letra por nota) o arranjo e a
     *  deformação são próprios; o latino segue o comportamento de sempre. */
    noteSystem?: 'latin' | 'anglican';
    /** Quanto da tela o conjunto ocupa em repouso (0.05 a 1) */
    density: number;
    /** Padding de cada nota, em fração da menor dimensão da tela */
    spacing: number;
    /** Desalinhamento das palavras (0 a 1) */
    randomness: number;
    /** Tamanho da nota pressionada, em relação ao tamanho inativo */
    grow: number;
    /** Sombra das letras; null ou ausente = sem sombra (o padrão do app) */
    sombra?: SombraOpcoes | null;
}

/** Ajustes da sombra das letras */
export interface SombraOpcoes {
    /** Cor em HEX; null segue a cor de contorno do tema (ink) */
    cor: string | null;
    /** Opacidade (0 a 1) */
    opacidade: number;
    /** Distância em fração da altura da letra; SHADOW (0,013) reproduz a sombra fixa de antes */
    distancia: number;
    /** Desfoque em fração da altura da letra; 0 = chapada, como pede o Design System */
    difusao: number;
    /** Para onde a sombra aponta, em graus: 0 = direita, 90 = baixo */
    angulo: number;
}

// ---------- constantes de movimento (as mesmas do Laboratório Gelatina) ----------
const SHRINK = 0.78;   // tamanho das notas relacionadas à pressionada
const MOVE   = 0.40;   // deslocamento, proporcional ao quanto a vizinha cresceu
const LETTER_K = 70, LETTER_D = 7;   // mola de cada letra: mole e pouco amortecida
const WORD_K   = 110, WORD_D  = 13;  // mola do tamanho da palavra (pula e assenta)
const KICK = 5;        // empurrão na mola das letras ao tocar
const WORD_KICK = 5.2; // empurrão na mola da palavra, por unidade de crescimento
const LAG  = 0.07;     // atraso de uma letra para a próxima
const WOBBLE = 0.06;   // tremor enquanto a tecla está segurada
const MAX_STRETCH = 0.35, MAX_SKEW = 18;   // limites: 35% de esticada, 18 graus
const SHADOW = 0.013;  // deslocamento do contorno, em fração da altura

// ---------- sistema anglicano (C D E F G A B), só ele usa estes valores ----------
// Cada nota é uma letra só. Em vez de esticar a letra para encher a linha,
// todas ganham o mesmo tamanho, com a proporção original, numa grade folgada.
const ANG_FILL    = 0.90;  // quanto da área do arranjo latino as letras ocupam
const ANG_CELL_W  = 0.70;  // largura da letra dentro da sua célula (o resto é folga)
const ANG_CELL_H  = 0.80;  // altura da letra dentro da sua célula
const ANG_SQUASH  = 0.40;  // quanto a esticada alarga a letra (latino: 0,8)
const ANG_STRETCH = 0.75;  // intensidade da esticada (latino: 1)
const ANG_SIZE_VAR = 0.5;  // quanto do desalinho de tamanho entre notas é mantido
const FS = 100;        // tamanho de referência da letra, em px

// ---------- desalinhamentos de cada palavra ----------
const Q_SIZE = [1.12, 0.86, 1.06, 1.20, 0.90, 1.08, 0.84];
const Q_DY   = [0.05, -0.11, 0.12, -0.06, 0.10, -0.13, 0.03];
const Q_GAP  = [-0.04, 0.05, -0.06, 0.03, -0.05, 0.04, 0.00];
const Q_ROT  = [-0.016, 0.022, -0.010, 0.018, -0.020, 0.012, -0.014];
const LINE_ROT = [-0.010, 0.008, -0.006, 0.011, -0.007];
const GAP_X = 0.14;

const mix = (a: RGB, b: RGB, t: number): RGB =>
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const rgbStr = (c: RGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const f3 = (n: number) => n.toFixed(3);

export const hexToRgb = (hex: string): RGB => {
    const h = hex.replace('#', '').trim();
    const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(f, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Gerador pseudoaleatório com semente, para que o desalinho seja sempre o mesmo */
function seeded(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

interface Letra {
    ch: string; left: number; w: number; asc: number; desc: number;
    lsx: number; lsy: number; dy0: number; rot0: number; gap: number;
    tint: number; ph: number; ph2: number; spd: number; side: number;
    // mola da letra (0 repouso, 1 tocada), com atraso em onda. Deforma a letra
    // nas fontes comuns e move os eixos nas fontes com efeito próprio.
    ax: number; axv: number; axT: number;
    el: HTMLSpanElement;
    /** Família em uso (efeito 'estilos'), para só trocar quando muda */
    fam?: string;
}

interface Glifo {
    l: Letra; sx: number; sy: number; dy: number; skew: number; skx: number; rotw: number; cx: number; byTop: number;
}

interface Cluster { g: Glifo[]; w: number; asc: number; desc: number; }

interface Home { cx: number; cy: number; sx: number; sy: number; rot: number; size: number; }

interface Nota {
    label: string;
    hue: RGB; rest: RGB; live: RGB;
    holds: number; sharpHolds: number;
    a: number; v: number; sh: number;
    dx: number; dy: number; grow: number; gv: number; growT: number;
    vel: number; hitAt: number; relAt: number;
    letters: Letra[];
    nom: Cluster | null;
    home: Home | null;
    cl: Cluster | null;
    cur: { cx: number; cy: number; sx: number; sy: number; rot: number } | null;
    el: HTMLDivElement;
}

export interface Gelatina {
    /** Aplica novas opções. Remede as letras e refaz os lugares quando necessário. */
    update(opts: GelatinaOptions): void;
    noteOn(idx: number, sharp: boolean, velocity: number): void;
    noteOff(idx: number, sharp: boolean): void;
    allOff(): void;
    destroy(): void;
}

export function createGelatina(host: HTMLElement, opts: GelatinaOptions, relations: number[][]): Gelatina {
    const doc = host.ownerDocument;
    const win = doc.defaultView || window;
    const reduced = !!win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // palco: um elemento que ocupa todo o espaço do pai
    const stage = doc.createElement('div');
    stage.className = 'gel-palco';
    stage.setAttribute('aria-hidden', 'true');
    Object.assign(stage.style, {
        position: 'absolute', inset: '0', overflow: 'hidden', pointerEvents: 'none',
    } as CSSStyleDeclaration);
    host.appendChild(stage);

    // canvas só para medir (nunca é anexado à página)
    const meter = doc.createElement('canvas').getContext('2d');
    if (!meter) throw new Error('Sem contexto 2D para medir as letras');

    let o: GelatinaOptions = { ...opts };
    let GROUND = hexToRgb(o.ground);
    let INK = hexToRgb(o.ink);
    let SHARP_COL = hexToRgb(o.sharpColor);
    let baseline = FS * 0.8;   // distância do topo da caixa de texto até a linha de base

    // LINK[j][i]: tocar a nota j encolhe a nota i
    let LINK: boolean[][] = [];
    const buildLinks = () => {
        LINK = o.labels.map((_, j) => o.labels.map((__, i) => (relations[j] || []).indexOf(i) >= 0));
    };

    const state: Nota[] = o.labels.map((label, i) => {
        const el = doc.createElement('div');
        Object.assign(el.style, {
            position: 'absolute', left: '0', top: '0', transformOrigin: '0 0',
        } as CSSStyleDeclaration);
        stage.appendChild(el);
        return {
            label,
            hue: hexToRgb(o.colors[i] || '#888888'),
            rest: [0, 0, 0], live: [0, 0, 0],
            holds: 0, sharpHolds: 0,
            a: 0, v: 0, sh: 0,
            dx: 0, dy: 0, grow: 1, gv: 0, growT: 1,
            vel: 0.8, hitAt: -99, relAt: -99,
            letters: [], nom: null, home: null, cl: null, cur: null,
            el,
        } as Nota;
    });

    let W = 0, H = 0, CW = 0, CH = 0, PAD = 10;
    let clock = 0, last = 0, raf = 0, vivo = true;

    const refreshColors = () => {
        state.forEach((s, i) => {
            s.hue = hexToRgb(o.colors[i] || '#888888');
            s.rest = mix(s.hue, GROUND, o.wash);
            s.live = s.hue;
        });
    };

    /** Estilo de texto comum a todas as letras */
    const applyFontStyle = (el: HTMLElement) => {
        el.style.fontFamily = o.family;
        el.style.fontWeight = String(o.weight);
        el.style.fontSize = `${FS}px`;
        el.style.lineHeight = 'normal';
    };

    /** Onde fica a linha de base dentro da caixa de texto, para a fonte atual */
    function measureBaseline() {
        const probe = doc.createElement('div');
        Object.assign(probe.style, { position: 'absolute', left: '0', top: '0', visibility: 'hidden', whiteSpace: 'pre' } as CSSStyleDeclaration);
        applyFontStyle(probe);
        const txt = doc.createElement('span');
        txt.textContent = 'DóRé';
        const mark = doc.createElement('span');
        Object.assign(mark.style, { display: 'inline-block', width: '1px', height: '0', verticalAlign: 'baseline' } as CSSStyleDeclaration);
        probe.append(txt, mark);
        stage.appendChild(probe);
        baseline = mark.offsetTop || FS * 0.8;
        probe.remove();
    }

    // ---------- acentos compostos (fontes sem acentos) ----------
    // A letra acentuada é escrita como base (o, e, a) na fonte escolhida mais o
    // acento solto (´ ` ^ ~ ¨) da fonte doadora. O acento é escalado pela altura-x
    // das duas fontes (mantém a proporção que ele tem na doadora), centrado sobre
    // a tinta da base e posto acima dela com a mesma folga que tem na doadora.
    const ACENTOS: Record<string, string> = {
        '\u0301': '\u00B4', '\u0300': '\u0060', '\u0302': '\u02C6', '\u0303': '\u02DC', '\u0308': '\u00A8',
    };
    /** Distância do topo da caixa de texto até a linha de base, para uma fonte qualquer */
    function linhaBase(familia: string, peso: number, tamanho: number): number {
        const probe = doc.createElement('div');
        Object.assign(probe.style, {
            position: 'absolute', left: '0', top: '0', visibility: 'hidden', whiteSpace: 'pre',
            fontFamily: familia, fontWeight: String(peso), fontSize: `${tamanho}px`, lineHeight: 'normal',
        } as CSSStyleDeclaration);
        const txt = doc.createElement('span');
        txt.textContent = 'Hxo\u00B4';
        const mark = doc.createElement('span');
        Object.assign(mark.style, { display: 'inline-block', width: '1px', height: '0', verticalAlign: 'baseline' } as CSSStyleDeclaration);
        probe.append(txt, mark);
        stage.appendChild(probe);
        const v = mark.offsetTop;
        probe.remove();
        return v;
    }
    interface AcentoComposto { base: string; el: HTMLSpanElement; left: number; w: number; asc: number; desc: number }
    function comporAcento(ch: string): AcentoComposto | null {
        const ac = o.acento;
        if (!ac) return null;
        const nfd = ch.normalize('NFD');
        if (nfd.length !== 2 || !ACENTOS[nfd[1]]) return null;
        const base = nfd[0], marca = ACENTOS[nfd[1]];
        const fam = `"${ac.familia}"`;
        const fd = (t: number) => `${ac.peso} ${t}px ${fam}`;
        const m = (font: string, t: string) => { meter.font = font; return meter.measureText(t); };
        const b = m(o.fontSpec, base);
        const xa = m(o.fontSpec, 'x').actualBoundingBoxAscent || FS * 0.5;
        const dx = m(fd(FS), 'x').actualBoundingBoxAscent || FS * 0.5;
        const dob = m(fd(FS), base).actualBoundingBoxAscent || dx;
        const a1 = m(fd(FS), marca);
        const esc = xa / dx;
        const tam = FS * esc;
        const a = m(fd(tam), marca);
        const bAsc = b.actualBoundingBoxAscent ?? FS * 0.5;
        // folga da doadora (fundo do acento até o topo da base), com um mínimo
        const folgaDoadora = (-(a1.actualBoundingBoxDescent ?? 0) - dob) * esc;
        const fundo = bAsc + Math.max(folgaDoadora, bAsc * 0.1, FS * 0.04);
        const aL = a.actualBoundingBoxLeft ?? 0, aR = a.actualBoundingBoxRight ?? a.width;
        const bL = b.actualBoundingBoxLeft ?? 0, bR = b.actualBoundingBoxRight ?? b.width;
        const centroB = (bR - bL) / 2, centroA = (aR - aL) / 2;
        const x0 = centroB - centroA;                       // origem do acento, no eixo da base
        const elevar = fundo + (a.actualBoundingBoxDescent ?? 0); // linha de base do acento acima da base
        const el = doc.createElement('span');
        el.textContent = marca;
        Object.assign(el.style, {
            position: 'absolute', left: `${x0.toFixed(2)}px`,
            top: `${(baseline - linhaBase(fam, ac.peso, tam) - elevar).toFixed(2)}px`,
            fontFamily: fam, fontWeight: String(ac.peso), fontSize: `${tam.toFixed(2)}px`,
            lineHeight: 'normal', fontVariationSettings: 'normal',
        } as CSSStyleDeclaration);
        meter.font = o.fontSpec;
        const left = Math.max(bL, aL - x0);
        const right = Math.max(bR, x0 + aR);
        return {
            base, el, left, w: left + right,
            asc: Math.max(bAsc, elevar + (a.actualBoundingBoxAscent ?? 0)),
            desc: b.actualBoundingBoxDescent ?? 0,
        };
    }

    // ---------- métricas, molas e elementos, um por letra ----------
    function measure() {
        meter.font = o.fontSpec;
        meter.textBaseline = 'alphabetic';
        measureBaseline();
        state.forEach((s, i) => {
            const r = seeded(9173 + i * 1277);
            const old = s.letters;
            s.label = o.labels[i];
            s.el.textContent = '';
            s.letters = Array.from(s.label).map((ch, k) => {
                const comp = comporAcento(ch);
                meter.font = o.fontSpec;
                const mm = meter.measureText(comp ? comp.base : ch);
                const left = comp ? comp.left : (mm.actualBoundingBoxLeft ?? 0);
                const right = mm.actualBoundingBoxRight ?? mm.width;
                const prev = old[k];
                const el = doc.createElement('span');
                el.textContent = comp ? comp.base : ch;
                Object.assign(el.style, {
                    position: 'absolute', left: '0', top: '0', transformOrigin: '0 0', whiteSpace: 'pre',
                } as CSSStyleDeclaration);
                applyFontStyle(el);
                if (comp) el.appendChild(comp.el);
                s.el.appendChild(el);
                return {
                    ch, left,
                    w: comp ? comp.w : left + right,
                    asc: comp ? comp.asc : (mm.actualBoundingBoxAscent ?? 72),
                    desc: comp ? comp.desc : (mm.actualBoundingBoxDescent ?? 0),
                    lsx: 0.88 + r() * 0.34,
                    lsy: 0.88 + r() * 0.34,
                    dy0: (r() - 0.5) * 20,
                    rot0: (r() - 0.5) * 0.09,
                    gap: 0.012 + r() * 0.022,
                    tint: r() * 0.14,
                    ph: r() * Math.PI * 2,
                    ph2: r() * Math.PI * 2,
                    spd: 0.86 + r() * 0.32,
                    side: r() < 0.5 ? -1 : 1,
                    ax: prev ? prev.ax : 0, axv: prev ? prev.axv : 0, axT: prev ? prev.axT : 0,
                    el,
                } as Letra;
            });
        });
    }

    // ---------- mola de cada letra ----------
    // A letra k entra (e sai) k * LAG depois da primeira, formando uma onda.
    function springs(dt: number) {
        for (const s of state) {
            const held = s.holds > 0;
            s.letters.forEach((l, k) => {
                if (held && clock - s.hitAt >= k * LAG) l.axT = 1;
                if (!held && clock - s.relAt >= k * LAG) l.axT = 0;
                if (reduced) { l.ax = l.axT; l.axv = 0; return; }
                l.axv += (LETTER_K * (l.axT - l.ax) - LETTER_D * l.axv) * dt;
                l.ax += l.axv * dt;
            });
        }
    }

    // ---------- monta a palavra letra a letra ----------
    // Deformação igual à do Laboratório Gelatina: o empurrão do toque achata e
    // estica a letra (conforme a velocidade da mola) e a entorta para lados
    // alternados; enquanto a tecla está segurada, ela treme de leve. Em repouso
    // a letra fica parada. Tudo acontece em torno do centro da letra.
    // Nas fontes com efeito próprio a letra não deforma: quem mexe são os eixos.
    function cluster(s: Nota, t: number, _energy: number, neutral: boolean): Cluster {
        const g: Glifo[] = [];
        const L = s.letters;
        const still = neutral || !!o.effect || reduced;
        const compact = isCompact();
        const desal = 0.35 + 0.65 * o.randomness;   // desalinho próprio das letras
        let cursor = 0;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (let k = 0; k < L.length; k++) {
            const l = L[k];
            let stretch = 0, skewDeg = 0;
            if (!still) {
                const e = clamp(l.ax, 0, 1);
                stretch = clamp(-l.axv * 0.03 + WOBBLE * e * Math.sin(t * 9 + k * 1.3), -MAX_STRETCH, MAX_STRETCH);
                skewDeg = clamp(l.axv * 1.6 * (k % 2 ? 1 : -1), -MAX_SKEW, MAX_SKEW);
            }
            // anglicano: mesma escala nos dois sentidos (nada de letra larga e achatada)
            // e deformação mais contida, para a letra não parecer gorda
            const lsu = compact ? 1 + ((l.lsx + l.lsy) / 2 - 1.05) * 0.3 : 0;
            const lsx = compact ? lsu : l.lsx;
            const lsy = compact ? lsu : l.lsy;
            if (compact) stretch *= ANG_STRETCH;
            const sy = lsy * (1 + stretch);
            const sx = lsx * (1 - stretch * (compact ? ANG_SQUASH : 0.8));
            const skew = -Math.tan(skewDeg * Math.PI / 180);
            const rotw = l.rot0 * desal;
            // centro da tinta, acima da linha de base: a letra estica e entorta em torno dele
            const half = (l.asc - l.desc) / 2;
            const dy = l.dy0 * desal + lsy * half * stretch;
            const skx = -skew * half * sy;

            // bordas da letra, medidas nos quatro cantos já deformados.
            // Para o espaçamento conta só parte da inclinação, senão o
            // canto vazio de uma letra tombada abriria um buraco.
            const hw = l.w * sx / 2, ty = -l.asc * sy, by = l.desc * sy;
            const cr = Math.cos(rotw), sr = Math.sin(rotw);
            let lo = Infinity, hi = -Infinity, tp = Infinity, bt = -Infinity;
            let nlo = Infinity, nhi = -Infinity;
            for (let q = 0; q < 4; q++) {
                const ox = (q & 1) ? hw : -hw;
                const oy = (q & 2) ? by : ty;
                const px = ox - skew * oy;
                const rx = px * cr - oy * sr;
                const ry = px * sr + oy * cr;
                if (rx < lo) lo = rx;
                if (rx > hi) hi = rx;
                if (ry < tp) tp = ry;
                if (ry > bt) bt = ry;
                const nx2 = (ox - skew * 0.45 * oy) * cr - oy * sr;
                if (nx2 < nlo) nlo = nx2;
                if (nx2 > nhi) nhi = nx2;
            }

            const gap = k ? l.gap * 100 * sx : 0;
            const cx = cursor + gap - nlo;
            cursor = cx + nhi;

            g.push({ l, sx, sy, dy, skew, skx, rotw, cx, byTop: 0 });
            if (cx + lo < minX) minX = cx + lo;
            if (cx + hi > maxX) maxX = cx + hi;
            if (dy + tp < minY) minY = dy + tp;
            if (dy + bt > maxY) maxY = dy + bt;
        }

        for (const gl of g) { gl.cx -= minX; gl.byTop = gl.dy - minY; }
        return { g, w: maxX - minX, asc: -minY, desc: maxY };
    }

    // ---------- quebra em linhas de peso equilibrado ----------
    function partition(weights: number[], L: number): number[][] {
        const n = weights.length;
        let best: number[][] | null = null, bestCost = Infinity;
        const target = weights.reduce((a, b) => a + b, 0) / L;
        const cuts: number[] = [];
        (function walk(start: number, depth: number) {
            if (depth === L - 1) {
                const groups: number[][] = []; let prev = 0, cost = 0;
                for (const c of cuts) { groups.push([prev, c]); prev = c; }
                groups.push([prev, n]);
                for (const [a, b] of groups) {
                    let w = 0;
                    for (let i = a; i < b; i++) w += weights[i];
                    cost += (w - target) * (w - target);
                }
                if (cost < bestCost) { bestCost = cost; best = groups; }
                return;
            }
            for (let c = start + 1; c <= n - (L - 1 - depth); c++) {
                cuts.push(c); walk(c, depth + 1); cuts.pop();
            }
        })(0, 0);
        return best || [[0, n]];
    }

    // ---------- lugares fixos ----------
    function buildHomes() {
        for (const s of state) s.nom = cluster(s, 0, 0, true);

        const n = state.length;
        const desal = o.randomness;
        const sc = Q_SIZE.slice(0, n);
        const wu = state.map((s, i) => sc[i] * (s.nom as Cluster).w / 100);
        const hu = state.map((s, i) => sc[i] * ((s.nom as Cluster).asc + (s.nom as Cluster).desc) / 100);
        const gapU = (i: number, j: number) => (GAP_X + Q_GAP[i] * desal) * (sc[i] + sc[j]) / 2;

        // a densidade define quanto da área disponível o conjunto ocupa
        const fill = 0.45 + 0.55 * clamp(o.density, 0.05, 1);
        const AW = W * fill, AH = H * fill;
        const X0 = PAD + (W - AW) / 2, Y0 = PAD + (H - AH) / 2;

        const wsum = sc.reduce((a, b) => a + b, 0);
        const A = wu.reduce((a, b) => a + b, 0) + GAP_X * wsum * 0.75;
        let avgH = 0;
        for (let i = 0; i < n; i++) avgH += sc[i] * hu[i];
        avgH /= wsum;

        let L = Math.round(Math.sqrt((A * AH) / (AW * avgH * 1.05)));
        L = clamp(L, 1, Math.min(n, 5));

        const groups = partition(wu.map((w, i) => w + GAP_X * sc[i]), L);
        const lines = groups.map(([a, b]) => {
            let sum = 0;
            for (let i = a; i < b; i++) { sum += wu[i]; if (i < b - 1) sum += gapU(i, i + 1); }
            const fixed = (b - a - 1) * PAD;
            const f = Math.max(1e-3, (AW - fixed) / sum);
            let h = 0;
            for (let i = a; i < b; i++) h = Math.max(h, f * hu[i]);
            return { a, b, f, h };
        });

        const natural = lines.reduce((t, l) => t + l.h, 0);
        const gapY = 0.045 * (natural / L);
        const kv = Math.max(1e-3, (AH - (L - 1) * PAD) / (natural + gapY * (L - 1)));

        let y = Y0;
        lines.forEach((ln, li) => {
            const lh = ln.h * kv;
            const ang = LINE_ROT[li % LINE_ROT.length] * desal;
            const ccx = CW / 2, ccy = y + lh / 2;
            const cos = Math.cos(ang), sin = Math.sin(ang);
            let x = X0;
            for (let i = ln.a; i < ln.b; i++) {
                const s = state[i];
                const nom = s.nom as Cluster;
                const sx = ln.f * sc[i] / 100;
                const sy = sx * kv;
                const inkW = nom.w * sx;
                const inkH = (nom.asc + nom.desc) * sy;
                let wy = y + (lh - inkH) / 2 + Q_DY[i] * desal * lh * 0.5;
                wy = clamp(wy, PAD, Math.max(PAD, CH - PAD - inkH));
                const px = x + inkW / 2 - ccx, py = wy + inkH / 2 - ccy;
                const rx = ccx + px * cos - py * sin, ry = ccy + px * sin + py * cos;
                s.home = { cx: rx, cy: ry, sx, sy, rot: ang + Q_ROT[i] * desal, size: (inkW + inkH) / 2 };
                s.cur = null;
                if (i < ln.b - 1) x += inkW + ln.f * gapU(i, i + 1) + PAD;
            }
            y += lh + gapY * kv + PAD;
        });
    }

    const isCompact = () => o.noteSystem === 'anglican';

    // ---------- lugares fixos do sistema anglicano ----------
    // Grade folgada: 4 letras em cima e 3 embaixo, intercaladas (3 linhas em
    // tela em pé). Uma única escala para todas, dada pela letra mais larga,
    // com a proporção original da fonte.
    function buildHomesCompact() {
        for (const s of state) s.nom = cluster(s, 0, 0, true);
        const n = state.length;
        const desal = o.randomness;
        const sc = Q_SIZE.slice(0, n).map(q => 1 + (q - 1) * ANG_SIZE_VAR);

        const fill = (0.45 + 0.55 * clamp(o.density, 0.05, 1)) * ANG_FILL;
        const AW = W * fill, AH = H * fill;
        const X0 = PAD + (W - AW) / 2, Y0 = PAD + (H - AH) / 2;

        const L = CW >= CH * 0.9 ? 2 : (CW >= CH * 0.55 ? 3 : 4);
        const groups: number[][] = [];
        let start = 0;
        for (let li = 0; li < L; li++) {
            const cnt = Math.ceil((n - start) / (L - li));
            groups.push([start, start + cnt]);
            start += cnt;
        }
        const maxPer = Math.max(...groups.map(([a, b]) => b - a));
        const cellW = AW / maxPer, cellH = AH / L;

        let f = Infinity;
        state.forEach((s, i) => {
            const nm = s.nom as Cluster;
            f = Math.min(f, cellW * ANG_CELL_W / Math.max(1, nm.w * sc[i]), cellH * ANG_CELL_H / Math.max(1, (nm.asc + nm.desc) * sc[i]));
        });

        groups.forEach(([a, b], li) => {
            const cnt = b - a;
            const x0 = X0 + (AW - cellW * cnt) / 2;
            const cy0 = Y0 + cellH * (li + 0.5);
            const ang = LINE_ROT[li % LINE_ROT.length] * desal;
            for (let i = a; i < b; i++) {
                const s = state[i];
                const nm = s.nom as Cluster;
                const sx = f * sc[i], sy = sx;
                const inkW = nm.w * sx, inkH = (nm.asc + nm.desc) * sy;
                const cx = x0 + cellW * (i - a + 0.5) + Q_GAP[i] * desal * cellW * 0.6;
                const cy = cy0 + Q_DY[i] * desal * cellH * 0.35;
                s.home = { cx, cy, sx, sy, rot: ang + Q_ROT[i] * desal * 1.5, size: (inkW + inkH) / 2 };
                s.cur = null;
            }
        });
    }

    const homes = () => (isCompact() ? buildHomesCompact() : buildHomes());

    function resize() {
        const rect = stage.getBoundingClientRect();
        CW = Math.max(1, Math.round(rect.width || stage.clientWidth || 1));
        CH = Math.max(1, Math.round(rect.height || stage.clientHeight || 1));
        PAD = Math.max(4, Math.round(clamp(o.spacing, 0, 0.08) * Math.min(CW, CH)));
        W = CW - PAD * 2;
        H = CH - PAD * 2;
        measure();
        homes();
    }

    // ---------- tamanho e lugar de cada nota, a cada quadro ----------
    function crowd() {
        for (let i = 0; i < state.length; i++) {
            const s = state[i];
            let dx = 0, dy = 0, squeeze = 1;
            for (let j = 0; j < state.length; j++) {
                if (j === i) continue;
                const aj = clamp(state[j].a, 0, 1);
                if (aj < 0.01) continue;

                if (LINK[j] && LINK[j][i] && state[j].holds > 0) squeeze = Math.min(squeeze, SHRINK);

                const gj = 1 + (o.grow - 1) * aj;
                const hj = state[j].home, hi = s.home;
                if (!hj || !hi) continue;
                const hx = hi.cx - hj.cx;
                const hy = hi.cy - hj.cy;
                const d = Math.hypot(hx, hy) || 1;
                const sz = hj.size;
                const fall = clamp(1 - d / (2.6 * sz), 0, 1);
                const push = MOVE * (gj - 1) * sz * fall;
                dx += hx / d * push;
                dy += hy / d * push;
            }
            const cap = 0.10 * Math.min(CW, CH);
            const dd = Math.hypot(dx, dy);
            if (dd > cap) { dx = dx / dd * cap; dy = dy / dd * cap; }
            s.dx = dx; s.dy = dy;
            // alvo muda na hora; quem suaviza (com pulo) é a mola da palavra
            const alvo = s.holds > 0 ? 1 + (o.grow - 1) * (0.75 + 0.25 * s.vel) : 1;
            s.growT = alvo * squeeze;
        }
    }

    // ---------- eixos das fontes com efeito próprio ----------
    function axesFor(s: Nota, i: number, k: number, l: Letra): string {
        const e = clamp(l.ax, 0, 1.25);
        if (o.effect === 'kablammo') {
            // MORF: a letra troca de desenho e "dança" enquanto a tecla está segurada
            const amp = 0.55 + 0.45 * s.vel;
            const morf = clamp(e * amp * (32 + 28 * Math.sin(clock * 8.5 + k * 1.2 + i)), 0, 60);
            return `"MORF" ${morf.toFixed(2)}`;
        }
        if (o.effect === 'shantell') {
            // BNCE: quique alternado; INFM: traço irregular; wght: engorda
            const bnce = clamp(100 * e * Math.sin(clock * 10 + k * 1.7), -100, 100);
            const infm = 100 * clamp(l.ax, 0, 1);
            const wght = 400 + 400 * clamp(l.ax, 0, 1);
            return `"BNCE" ${bnce.toFixed(1)}, "INFM" ${infm.toFixed(1)}, "wght" ${wght.toFixed(0)}`;
        }
        // As de baixo voltam ao desenho original com a tecla solta (a = 0)
        const a = clamp(l.ax, 0, 1);
        if (o.effect === 'tiltwarp') {
            // XROT e YROT: a letra gira em 3D, cada uma num tempo
            const xrot = clamp(40 * e * Math.sin(clock * 6 + k * 0.9 + i * 0.5), -45, 45);
            const yrot = clamp(40 * e * Math.cos(clock * 5 + k * 1.1), -45, 45);
            return `"XROT" ${xrot.toFixed(1)}, "YROT" ${yrot.toFixed(1)}`;
        }
        if (o.effect === 'eixos' && o.eixosToque) {
            // contínuo: sem vai e vem, cada eixo acompanha a mola da letra
            return o.eixosToque.map(x => `"${x.tag}" ${(x.repouso + (x.toque - x.repouso) * a).toFixed(2)}`).join(', ');
        }
        if (o.effect === 'auto' && o.axes && o.axes.length) {
            // Efeito automático para qualquer fonte variável: cada eixo sai do valor
            // padrão rumo ao lado com mais espaço, num ritmo lento e próprio, e volta
            // ao padrão quando a tecla é solta. Peso só engorda; tamanho óptico fica.
            return o.axes.map((ax, j) => {
                const acima = ax.max - ax.padrao;
                const abaixo = ax.padrao - ax.min;
                const span = acima >= abaixo ? acima : -abaixo;
                const onda = 0.5 + 0.5 * Math.sin(clock * (1.4 + 0.35 * j) + k * 1.1 + i * 0.5 + j * 1.7);
                let v: number;
                if (ax.tag === 'opsz') v = ax.padrao;
                else if (ax.tag === 'wght') v = ax.padrao + span * 0.85 * a;
                else v = ax.padrao + span * a * (0.35 + 0.65 * onda);
                v = clamp(v, Math.min(ax.min, ax.max), Math.max(ax.min, ax.max));
                return `"${ax.tag}" ${v.toFixed(2)}`;
            }).join(', ');
        }
        return '';
    }

    // ---------- estilos das fontes estáticas (efeito 'estilos') ----------
    // A força do toque escolhe o estilo: repouso no primeiro, toque forte no último.
    // Segurando, a letra oscila um passo para cá e para lá, e as alternas (itálicos)
    // entram e saem, cada letra no seu tempo.
    function familiaPara(s: Nota, i: number, k: number, l: Letra): string {
        const est = o.estilos;
        if (!est || !est.familias.length) return o.family;
        const n = est.familias.length;
        const a = clamp(l.ax, 0, 1);
        let idx = Math.round(a * (n - 1));
        if (a > 0.5) idx += Math.round(0.55 * Math.sin(clock * 4 + k * 1.1 + i * 0.8));
        idx = Math.max(0, Math.min(n - 1, idx));
        let fam = est.familias[idx];
        if (est.alternas && a > 0.4 && Math.sin(clock * 3.2 + k * 1.3 + i * 0.5) > 0) {
            fam = est.alternas[Math.min(idx, est.alternas.length - 1)] ?? fam;
        }
        return `"${fam}", ${o.family}`;
    }

    // ---------- quadro ----------
    function frame(now: number) {
        if (!vivo) return;
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        clock += dt;

        for (const s of state) {
            const target = s.holds > 0 ? 1 : 0;
            if (reduced) {
                s.a += (target - s.a) * (1 - Math.exp(-18 * dt));
                s.v = 0;
            } else {
                const stiff = target ? 105 : 68;
                const damp = target ? 12.5 : 14.5;
                s.v += ((target - s.a) * stiff - s.v * damp) * dt;
                s.a += s.v * dt;
            }
            s.sh += ((s.sharpHolds > 0 ? 1 : 0) - s.sh) * (1 - Math.exp(-9 * dt));
        }
        springs(dt);
        crowd();

        for (const s of state) {
            if (reduced) { s.grow += (s.growT - s.grow) * (1 - Math.exp(-18 * dt)); s.gv = 0; continue; }
            s.gv += (WORD_K * (s.growT - s.grow) - WORD_D * s.gv) * dt;
            s.grow += s.gv * dt;
        }

        for (const s of state) s.cl = cluster(s, clock, 0, false);

        const k = 1 - Math.exp(-(reduced ? 40 : 11) * dt);
        const order = state.map((_, i) => i).sort((a, b) => state[a].a - state[b].a);
        // Sombra: calculada uma vez por quadro. Sem sombra, as letras ficam sem text-shadow
        // e o confinamento não reserva espaço para ela.
        const sb = o.sombra ?? null;
        const sbCor = sb?.cor ? hexToRgb(sb.cor) : INK;
        const sbStr = sb ? `rgba(${sbCor[0] | 0},${sbCor[1] | 0},${sbCor[2] | 0},${clamp(sb.opacidade, 0, 1).toFixed(3)})` : '';
        const sbAng = ((sb?.angulo ?? 45) * Math.PI) / 180;
        const sbCos = Math.cos(sbAng), sbSin = Math.sin(sbAng);

        order.forEach((i, rank) => {
            const s = state[i], hm = s.home, cl = s.cl;
            if (!hm || !cl) return;
            const t = {
                cx: hm.cx + s.dx, cy: hm.cy + s.dy,
                sx: hm.sx, sy: hm.sy, rot: hm.rot,
            };
            if (!s.cur) s.cur = { ...t };
            else {
                s.cur.cx += (t.cx - s.cur.cx) * k;
                s.cur.cy += (t.cy - s.cur.cy) * k;
                s.cur.sx += (t.sx - s.cur.sx) * k;
                s.cur.sy += (t.sy - s.cur.sy) * k;
                s.cur.rot += (t.rot - s.cur.rot) * k;
            }

            const lit = clamp(s.a, 0, 1);
            const base = mix(s.rest, s.live, lit);
            const inkW = cl.w * s.cur.sx;
            const inkH = (cl.asc + cl.desc) * s.cur.sy;

            const g = Math.max(0.2, s.grow);
            const popY = g, popX = g;
            // Comprimento da sombra: a conta da sombra fixa de antes (limitada entre 1,5 e
            // 12 px), escalada pela distância escolhida. O fator raiz de 2 faz o padrão
            // (0,013 a 45 graus) cair exatamente no deslocamento antigo, sd em x e sd em y.
            const sd = sb ? clamp(inkH * SHADOW * g, 1.5, 12) * (sb.distancia / SHADOW) * Math.SQRT2 : 0;
            const desfoque = sb ? inkH * Math.max(0, sb.difusao) * g : 0;
            const margemSombra = sd + desfoque;

            // confinamento: nada escapa da margem
            const ca = Math.abs(Math.cos(s.cur.rot)), sa = Math.abs(Math.sin(s.cur.rot));
            // folga: a letra deformada (ou trocada de estilo/eixo) pode passar um pouco
            // da caixa medida; a folga garante que nada saia da tela
            const folga = o.effect ? 1.16 : 1.08;
            const hw0 = inkW * popX / 2 * folga, hh0 = inkH * popY / 2 * folga;
            const bw0 = hw0 * ca + hh0 * sa + margemSombra, bh0 = hw0 * sa + hh0 * ca + margemSombra;
            const room = Math.min(
                1,
                (CW - 2 * PAD) / Math.max(1, 2 * bw0),
                (CH - 2 * PAD) / Math.max(1, 2 * bh0),
            );
            const bw = bw0 * room, bh = bh0 * room;
            const ncx = clamp(s.cur.cx, PAD + bw, CW - PAD - bw);
            const ncy = clamp(s.cur.cy, PAD + bh, CH - PAD - bh);

            const sxTot = Math.max(1e-4, s.cur.sx * popX * room);
            const syTot = Math.max(1e-4, s.cur.sy * popY * room);
            // A sombra é desenhada no espaço da letra, que está girado e escalado: o vetor
            // da tela é girado de volta pela rotação da palavra e dividido pela escala,
            // para o ângulo escolhido valer na tela e a distância não crescer com a letra.
            const vx = sd * sbCos, vy = sd * sbSin;
            const cr = Math.cos(s.cur.rot), sr = Math.sin(s.cur.rot);
            const ox = (vx * cr + vy * sr) / sxTot, oy = (-vx * sr + vy * cr) / syTot;
            const blurBase = desfoque / Math.sqrt(sxTot * syTot);

            // palavra: mesma sequência de transformações do desenho no canvas
            s.el.style.zIndex = String(rank);
            s.el.style.transform =
                `translate(${ncx.toFixed(2)}px, ${ncy.toFixed(2)}px) rotate(${f3(s.cur.rot)}rad) ` +
                `scale(${f3(popX * room)}, ${f3(popY * room)}) translate(${(-inkW / 2).toFixed(2)}px, ${(-inkH / 2).toFixed(2)}px) ` +
                `scale(${s.cur.sx.toFixed(4)}, ${s.cur.sy.toFixed(4)})`;

            cl.g.forEach((gl, n) => {
                const l = gl.l;
                let c = mix(base, GROUND, l.tint * (1 - lit * 0.6));
                if (s.sh > 0.01) c = mix(c, SHARP_COL, s.sh * 0.92);
                const el = l.el;
                el.style.color = rgbStr(c);
                // sombra deslocada, compensada pela escala da letra (ou nenhuma, se desligada)
                el.style.textShadow = sb
                    ? `${(ox / gl.sx).toFixed(2)}px ${(oy / gl.sy).toFixed(2)}px ${(blurBase / Math.sqrt(gl.sx * gl.sy)).toFixed(2)}px ${sbStr}`
                    : 'none';
                el.style.transform =
                    `translate(${(gl.cx + gl.skx).toFixed(2)}px, ${gl.byTop.toFixed(2)}px) rotate(${f3(gl.rotw)}rad) ` +
                    `matrix(1, 0, ${f3(-gl.skew)}, 1, 0, 0) scale(${f3(gl.sx)}, ${f3(gl.sy)}) ` +
                    `translate(${(l.left - l.w / 2).toFixed(2)}px, ${(-baseline).toFixed(2)}px)`;
                if (o.effect === 'estilos') {
                    const fam = familiaPara(s, i, n, l);
                    if (fam !== l.fam) { l.fam = fam; el.style.fontFamily = fam; }
                } else if (o.effect) el.style.fontVariationSettings = axesFor(s, i, n, l);
            });
        });

        raf = win.requestAnimationFrame(frame);
    }

    // remede quando uma fonte termina de carregar (as medidas mudam)
    const onFontsLoaded = () => { if (vivo) { measure(); homes(); } };
    (doc as any).fonts?.addEventListener?.('loadingdone', onFontsLoaded);

    const api: Gelatina = {
        update(next: GelatinaOptions) {
            const antes = o;
            o = { ...next };
            GROUND = hexToRgb(o.ground);
            INK = hexToRgb(o.ink);
            SHARP_COL = hexToRgb(o.sharpColor);
            buildLinks();
            refreshColors();
            const mudouTexto = antes.fontSpec !== o.fontSpec || antes.family !== o.family
                || antes.acento?.familia !== o.acento?.familia
                || (antes.axes ?? []).map(x => x.tag).join() !== (o.axes ?? []).map(x => x.tag).join()
                || antes.labels.join('|') !== o.labels.join('|') || antes.effect !== o.effect
                || antes.noteSystem !== o.noteSystem;
            const mudouArranjo = mudouTexto
                || antes.density !== o.density
                || antes.spacing !== o.spacing
                || antes.randomness !== o.randomness;
            if (mudouTexto) { measure(); homes(); }
            else if (mudouArranjo) { resize(); }
        },
        noteOn(idx, sharp, velocity) {
            const s = state[idx];
            if (!s) return;
            if (s.holds === 0) s.hitAt = clock;
            s.holds++;
            s.vel = clamp(velocity / 127, 0.15, 1);
            if (sharp) s.sharpHolds++;
            if (!reduced) {
                // o toque empurra as molas: as letras achatam e a palavra dá um pulo
                s.letters.forEach(l => { l.axv += KICK * s.vel; });
                s.gv += WORD_KICK * s.vel * Math.max(0.1, o.grow - 1);
            }
        },
        noteOff(idx, sharp) {
            const s = state[idx];
            if (!s) return;
            s.holds = Math.max(0, s.holds - 1);
            if (s.holds === 0) s.relAt = clock;
            if (sharp) s.sharpHolds = Math.max(0, s.sharpHolds - 1);
        },
        allOff() {
            for (const s of state) {
                if (s.holds > 0) s.relAt = clock;
                s.holds = 0; s.sharpHolds = 0;
            }
        },
        destroy() {
            vivo = false;
            win.cancelAnimationFrame(raf);
            ro?.disconnect();
            win.removeEventListener('resize', resize);
            (doc as any).fonts?.removeEventListener?.('loadingdone', onFontsLoaded);
            stage.remove();
        },
    };

    // ---------- início ----------
    buildLinks();
    refreshColors();
    resize();
    last = win.performance.now();
    raf = win.requestAnimationFrame(frame);

    let ro: ResizeObserver | null = null;
    if (typeof (win as any).ResizeObserver !== 'undefined') {
        ro = new (win as any).ResizeObserver(() => resize());
        ro!.observe(stage);
    }
    win.addEventListener('resize', resize);

    return api;
}
