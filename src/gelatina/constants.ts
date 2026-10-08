import { AppSettings, ThemeName } from './types';

// ==========================================
// Sistemas de Nomenclatura de Notas
// ==========================================

export const ANGLICAN_NOTE_NAMES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const ANGLICAN_NATURAL_NOTE_NAMES: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const LATIN_NOTE_NAMES: string[] = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];
export const LATIN_NATURAL_NOTE_NAMES: string[] = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];

export const NOTE_NAME_SYSTEMS = {
    anglican: { all: ANGLICAN_NOTE_NAMES, natural: ANGLICAN_NATURAL_NOTE_NAMES },
    latin: { all: LATIN_NOTE_NAMES, natural: LATIN_NATURAL_NOTE_NAMES },
};

/** Índice da nota natural (0 a 6) para cada classe de altura cromática natural */
export const NATURAL_BY_PITCH_CLASS: { [pc: number]: number } = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
/** Índice da nota natural que recebe cada sustenido */
export const SHARP_BY_PITCH_CLASS: { [pc: number]: number } = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };


// ==========================================
// Relações entre as notas
// ==========================================
// Ao tocar a nota da linha, as notas listadas encolhem pela metade.
// As demais permanecem no tamanho inativo. A tabela é simétrica e vale
// igual para o sustenido, que aciona a mesma palavra da natural.
// Índices: 0=Dó 1=Ré 2=Mi 3=Fá 4=Sol 5=Lá 6=Si
export const NOTE_RELATIONS: number[][] = [
    [1, 3, 4],       // Dó  encolhe Ré, Fá, Sol
    [0, 2, 4, 5],    // Ré  encolhe Dó, Mi, Sol, Lá
    [1, 5, 6],       // Mi  encolhe Ré, Lá, Si
    [0, 4],          // Fá  encolhe Dó, Sol
    [3, 5, 0, 1],    // Sol encolhe Fá, Lá, Dó, Ré
    [4, 1, 2, 6],    // Lá  encolhe Sol, Ré, Mi, Si
    [5, 2],          // Si  encolhe Lá, Mi
];


// ==========================================
// Identidade visual
// ==========================================

/** Cores da marca Conectando, usadas também na interface de configurações */
export const BRAND = {
    creme: '#F6F6C7',
    tinta: '#443C1A',
    azul: '#1D58A4',
    petroleo: '#0F3D49',
    escuro: '#20274F',   // azul-marinho, o mesmo fundo escuro dos três jogos
    cremeClaro: '#F2EED6',
};

export interface ThemeDef {
    ground: string;   // fundo da projeção
    ink: string;      // contorno das letras
    sharp: string;    // cor da palavra quando a nota é sustenido
    wash: number;     // quanto a cor da nota inativa se mistura ao fundo
}

export const THEMES: { [k in ThemeName]: ThemeDef } = {
    claro:  { ground: BRAND.creme,  ink: BRAND.tinta,      sharp: BRAND.petroleo, wash: 0.16 },
    escuro: { ground: BRAND.escuro, ink: BRAND.cremeClaro, sharp: '#5CC6D8',      wash: 0.30 },
};

/** Cor de cada nota natural, na ordem da escala: Dó Ré Mi Fá Sol Lá Si */
export const NOTE_HIGHLIGHT_COLORS: string[] = [
    '#43B3B4', // Dó  turquesa
    '#F0848F', // Ré  rosa
    '#FBDF53', // Mi  amarelo
    '#E9573B', // Fá  vermelho alaranjado
    '#1D58A4', // Sol azul
    '#2E9E5B', // Lá  verde
    '#CC2936', // Si  vermelho
];


// ==========================================
// Fontes
// ==========================================
// As marcadas com arquivo: true não vêm do @fontsource: os .woff2 ficam em
// public/fontes, declarados no index.html, e uma versão instalada na máquina
// tem prioridade. A lista é contínua, em ordem alfabética.

export interface FontOption {
    key: string;
    name: string;
    family: string;
    weight: number;
    /** true quando o arquivo da fonte fica em public/fontes (o painel avisa se não carregar) */
    arquivo?: boolean;
    /** Fontes variáveis com efeito próprio: os eixos mudam ao tocar,
     *  no lugar de esticar e entortar a letra. */
    effect?: 'kablammo' | 'shantell';
    /** Peso usado para medir a letra (fontes que engordam ao tocar) */
    measureWeight?: number;
    /** Uma linha explicando o efeito próprio, mostrada no painel */
    effectHint?: string;
    /** false quando a fonte não tem ó, é, á: no sistema latino (Dó, Ré, Fá, Lá)
     *  esses caracteres saem de uma fonte reserva. */
    accents?: boolean;
}

export const FONT_OPTIONS: FontOption[] = [
    { key: 'alfa',         name: 'Alfa Slab One',     family: '"Alfa Slab One"',    weight: 400 },
    { key: 'anakgedong',   name: 'Anak Gedong',       family: '"Anak Gedong"',      weight: 400, arquivo: true, accents: false },
    { key: 'bagel',        name: 'Bagel Fat One',     family: '"Bagel Fat One"',    weight: 400 },
    { key: 'baloo',        name: 'Baloo 2',           family: '"Baloo 2"',          weight: 800 },
    { key: 'berkshire',    name: 'Berkshire Swash',   family: '"Berkshire Swash"',  weight: 400, arquivo: true },
    { key: 'bluewinter',   name: 'Blue Winter',       family: '"Blue Winter"',      weight: 400, arquivo: true },
    { key: 'bowlby',       name: 'Bowlby One',        family: '"Bowlby One"',       weight: 400 },
    { key: 'bungee',       name: 'Bungee',            family: '"Bungee"',           weight: 400 },
    { key: 'caprasimo',    name: 'Caprasimo',         family: '"Caprasimo"',        weight: 400, arquivo: true },
    { key: 'cherry',       name: 'Cherry Bomb One',   family: '"Cherry Bomb One"',  weight: 400 },
    { key: 'howdybun',     name: 'Howdybun',          family: '"Howdybun"',         weight: 400, arquivo: true, accents: false },
    { key: 'isometra',     name: 'Isometra',          family: '"Isometra"',         weight: 400, arquivo: true },
    {
        key: 'kablammo', name: 'Kablammo', family: '"Kablammo"', weight: 400, arquivo: true, effect: 'kablammo',
        effectHint: 'Efeito próprio: ao tocar, cada letra troca de desenho e dança (eixo MORF), com mais força quanto mais forte o toque.',
    },
    { key: 'luckiest',     name: 'Luckiest Guy',      family: '"Luckiest Guy"',     weight: 400 },
    { key: 'matcha',       name: 'Matcha Cih',        family: '"Matcha Cih"',       weight: 400, arquivo: true },
    { key: 'matemasie',    name: 'Matemasie',         family: '"Matemasie"',        weight: 400 },
    { key: 'mochiy',       name: 'Mochiy Pop P One',  family: '"Mochiy Pop P One"', weight: 400 },
    { key: 'modak',        name: 'Modak',             family: '"Modak"',            weight: 400 },
    { key: 'playfair',     name: 'Playfair Display',  family: '"Playfair Display"', weight: 400 },
    { key: 'righteous',    name: 'Righteous',         family: '"Righteous"',        weight: 400, arquivo: true },
    {
        key: 'shantell', name: 'Shantell Sans', family: '"Shantell Sans"', weight: 400, measureWeight: 600, arquivo: true, effect: 'shantell',
        effectHint: 'Efeito próprio: ao tocar, as letras quicam, ficam com traço de mão e engordam (eixos BNCE, INFM e peso).',
    },
    { key: 'shrikhand',    name: 'Shrikhand',         family: '"Shrikhand"',        weight: 400 },
    { key: 'titan',        name: 'Titan One',         family: '"Titan One"',        weight: 400 },
];

/** Monta a especificação que o canvas entende, ex: 400 100px "Modak".
 *  Fontes sem acentos ganham uma reserva gorda ("Lilita One", que saiu da
 *  lista mas continua embutida só para isso) para os caracteres que faltam,
 *  em vez da serifa padrão do navegador. */
export const fontSpecOf = (key: string, sizePx = 100): string => {
    const f = fontOf(key);
    return `${f.measureWeight ?? f.weight} ${sizePx}px ${fontStackOf(key)}`;
};

/** A opção de fonte pela chave (a primeira da lista se a chave não existir mais) */
export const fontOf = (key: string): FontOption => FONT_OPTIONS.find(o => o.key === key) || FONT_OPTIONS[0];

/** Pilha CSS da fonte, com reserva para as que não têm acentos */
export const fontStackOf = (key: string): string => {
    const f = fontOf(key);
    const reserva = f.accents === false ? ', "Lilita One", sans-serif' : ', sans-serif';
    return `${f.family}${reserva}`;
};

/** true quando a fonte não tem os acentos usados em Dó, Ré, Fá e Lá */
export const fontLacksAccents = (key: string): boolean =>
    (FONT_OPTIONS.find(o => o.key === key) || FONT_OPTIONS[0]).accents === false;


// ==========================================
// Teclado do computador
// ==========================================
// O mapeamento de teclas agora é o compartilhado pelo Piano Interativo,
// em src/shared/keyboardInput.ts (Q 2 W 3 E R 5 T 6 Y 7 U / Z S X D C V G B H N J M).


// ==========================================
// Controlador MIDI
// ==========================================

export const AKAI_MPK_MINI_KNOBS: { [key: string]: number } = {
    K1: 70, K2: 71, K3: 72, K4: 73,
    K5: 74, K6: 75, K7: 76, K8: 77,
};

/** O que cada knob controla na projeção */
export const KNOB_MAPPINGS: { [key: string]: string } = {
    K1: 'Crescimento da nota',
    K2: 'Densidade',
    K3: 'Espaçamento',
    K4: 'Desalinhamento',
};


// ==========================================
// Configurações padrão
// ==========================================

export const DEFAULT_SETTINGS: AppSettings = {
    fontKey: 'modak',
    theme: 'claro',
    noteSystem: 'latin',
    noteColors: NOTE_HIGHLIGHT_COLORS,
    sharpColor: BRAND.petroleo,
    noteDensity: 1,
    noteSpacing: 0.02,
    noteRandomness: 0.8,
    growAmount: 1.45,
    motorTexto: true,
};

/** Chave usada para lembrar as preferências entre sessões */
export const STORAGE_KEY = 'piano-tipografico-config';
