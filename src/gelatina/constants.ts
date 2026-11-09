import eixosLidos from 'virtual:eixos-fontes';
import { AppSettings, ThemeName } from './types';
import { LACOS_OPACIDADE_PADRAO } from '../shared/ui/LacosFundo';

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

/** Cores do Design System Conectando (tokens/colors.css). São o ponto de partida:
 *  tudo continua editável no painel. */
export const BRAND = {
    azul: '#1666B0',
    azulProfundo: '#0E5395',
    azulBrilho: '#3D8AD1',
    amarelo: '#FCE051',
    amareloSuave: '#FFF3B0',
    coral: '#EB5F3E',
    coralSuave: '#FBDDD4',
    ground: '#FCFAF1',   // creme do Design System, fundo de página do tema claro
    tinta: '#10263F',    // n12, texto e o fundo escuro dos três jogos
    ok: '#0E7A56',
    atencao: '#9A6A08',
    erro: '#B0261B',
};

export interface ThemeDef {
    ground: string;   // fundo da projeção
    ink: string;      // contorno das letras
    sharp: string;    // cor da palavra quando a nota é sustenido
    wash: number;     // quanto a cor da nota inativa se mistura ao fundo
}

export const THEMES: { [k in ThemeName]: ThemeDef } = {
    claro:  { ground: BRAND.ground, ink: BRAND.tinta,  sharp: BRAND.tinta,        wash: 0.16 },
    escuro: { ground: BRAND.tinta,  ink: BRAND.ground, sharp: BRAND.amareloSuave, wash: 0.30 },
};

/** Cores de identidade do Design System Conectando (seção "Cores de identidade"
 *  do Design System Completo.pdf), as mesmas que identificam pessoas e peças. */
export const IDENTIDADE = {
    rosa: '#FF6776',
    turquesa: '#24C0C0',
    ceu: '#3BB8FF',
    rosaAntigo: '#DD6A75',
    laranja: '#D86F33',
    azulMedio: '#4074B2',
    roxo: '#A740B2',
};

/** Cor padrão de cada nota natural, na ordem da escala: Dó Ré Mi Fá Sol Lá Si.
 *  São as sete cores de identidade, uma por nota, na ordem em que aparecem no
 *  Design System. Sem as semânticas (verde, âmbar, vermelho), que ficam para
 *  status. Tudo continua editável no painel. */
export const NOTE_HIGHLIGHT_COLORS: string[] = [
    IDENTIDADE.rosa,       // Dó  rosa
    IDENTIDADE.turquesa,   // Ré  turquesa
    IDENTIDADE.ceu,        // Mi  céu
    IDENTIDADE.rosaAntigo, // Fá  rosa antigo
    IDENTIDADE.laranja,    // Sol laranja
    IDENTIDADE.azulMedio,  // Lá  azul médio
    IDENTIDADE.roxo,       // Si  roxo
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
    effect?: 'kablammo' | 'shantell' | 'tiltwarp' | 'auto' | 'estilos' | 'eixos';
    /** Fontes pixel (categoria de teste), mostradas com o desenho original */
    pixel?: boolean;
    /** Efeito 'eixos': cada eixo vai do valor em repouso ao valor do toque, junto com a força do toque */
    eixosToque?: { tag: string; repouso: number; toque: number }[];
    /** Efeito 'estilos' (fontes estáticas com vários estilos): famílias em ordem,
     *  do estilo em repouso ao mais forte; a letra troca de estilo conforme o toque.
     *  alternas: estilos irmãos (ex.: itálicos) que entram e saem enquanto segura. */
    estilos?: { familias: string[]; alternas?: string[] };
    /** Fontes sem acentos: de qual fonte do acervo vem o acento (escolhido por
     *  comparação visual, ver public/fontes/LEIA-ME.txt). A letra base continua
     *  na fonte original e o motor compõe o acento por cima. Nenhuma fonte da
     *  lista usa isso desde 09/11/2026 (as de acento composto saíram do menu);
     *  o recurso fica no motor para uma fonte futura, se preciso. */
    acento?: { familia: string; peso: number };
    /** Efeito 'auto': nome do arquivo em public/fontes. Os eixos são lidos dele no build
     *  e a fonte só aparece na lista se o arquivo estiver lá. */
    arquivoNome?: string;
    /** Peso usado para medir a letra (fontes que engordam ao tocar) */
    measureWeight?: number;
    /** Uma linha explicando o efeito próprio, mostrada no painel */
    effectHint?: string;
    /** false quando a fonte não tem ó, é, á: no sistema latino (Dó, Ré, Fá, Lá)
     *  esses caracteres saem de uma fonte reserva. */
    accents?: boolean;
}

const TODAS_AS_FONTES: FontOption[] = [
    { key: 'alfa',         name: 'Alfa Slab One',     family: '"Alfa Slab One"',    weight: 400 },
    { key: 'bagel',        name: 'Bagel Fat One',     family: '"Bagel Fat One"',    weight: 400 },
    { key: 'baloo',        name: 'Baloo 2',           family: '"Baloo 2"',          weight: 800 },
    { key: 'berkshire',    name: 'Berkshire Swash',   family: '"Berkshire Swash"',  weight: 400, arquivo: true },
    { key: 'bluewinter',   name: 'Blue Winter',       family: '"Blue Winter"',      weight: 400, arquivo: true },
    { key: 'bowlby',       name: 'Bowlby One',        family: '"Bowlby One"',       weight: 400 },
    { key: 'bungee',       name: 'Bungee',            family: '"Bungee"',           weight: 400 },
    { key: 'caprasimo',    name: 'Caprasimo',         family: '"Caprasimo"',        weight: 400, arquivo: true },
    { key: 'comicsans',    name: 'Comic Sans',        family: '"PI Comic Sans"',    weight: 400, arquivo: true },
    { key: 'cherry',       name: 'Cherry Bomb One',   family: '"Cherry Bomb One"',  weight: 400 },
    { key: 'helvetica',    name: 'Helvetica',         family: '"PI Helvetica"',     weight: 400, arquivo: true },
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
    { key: 'oi',           name: 'Oi',                family: '"Oi"',               weight: 400, arquivo: true },
    { key: 'papyrus',      name: 'Papyrus',           family: '"PI Papyrus"',       weight: 400, arquivo: true },
    { key: 'playfair',     name: 'Playfair Display',  family: '"Playfair Display"', weight: 400 },
    { key: 'righteous',    name: 'Righteous',         family: '"Righteous"',        weight: 400, arquivo: true },
    {
        key: 'shantell', name: 'Shantell Sans', family: '"Shantell Sans"', weight: 400, measureWeight: 600, arquivo: true, effect: 'shantell',
        effectHint: 'Efeito próprio: ao tocar, as letras quicam, ficam com traço de mão e engordam (eixos BNCE, INFM e peso).',
    },
    { key: 'shrikhand',    name: 'Shrikhand',         family: '"Shrikhand"',        weight: 400 },
    {
        key: 'tiltwarp', name: 'Tilt Warp', family: '"Tilt Warp"', weight: 400, arquivo: true, effect: 'tiltwarp',
        effectHint: 'Efeito próprio: ao tocar, as letras giram em 3D, balançando para os lados e para frente (eixos XROT e YROT).',
    },
    { key: 'titan',        name: 'Titan One',         family: '"Titan One"',        weight: 400 },
    // Fontes mutáveis com efeito automático: basta o arquivo estar em public/fontes
    // com este nome (e o @font-face no index.html) para elas entrarem na lista.
    { key: 'graduate', name: 'Graduate', family: '"Graduate"', weight: 400, arquivo: true, effect: 'auto', arquivoNome: 'GraduateGX.woff2' },
    // Fontes mutáveis feitas de estilos estáticos (versão trial que está em
    // public/fontes, veja LICENCAS.txt). A letra troca de estilo ao tocar.
    // Cheee e Camelion (demo) saíram em 09/11/2026: não têm acentos e o acento
    // composto de outra fonte ficava artificial. Os arquivos seguem em public/fontes.
    {
        key: 'hela', name: 'Hela (trial)', family: '"Hela 300"', weight: 400, arquivo: true, effect: 'estilos',
        estilos: { familias: ['Hela 300', 'Hela 350', 'Hela 400', 'Hela 500', 'Hela 600', 'Hela 700'] },
        effectHint: 'Efeito próprio: ao tocar, as letras engordam peso a peso (Hela 300 a 700), cada letra no seu tempo.',
    },
    // Fontes pixel (teste): letras de pontos ou quadradinhos, no desenho original,
    // com um efeito de eixos contínuo, sem trocas bruscas de desenho.
    {
        key: 'doto', name: 'Doto', family: '"Doto"', weight: 700, arquivo: true, pixel: true, effect: 'eixos',
        eixosToque: [{ tag: 'ROND', repouso: 0, toque: 100 }, { tag: 'wght', repouso: 700, toque: 900 }],
        effectHint: 'Letra de matriz de pontos: os pontos arredondam e crescem ao tocar (eixos ROND e peso).',
    },
    {
        key: 'pixelify', name: 'Pixelify Sans', family: '"Pixelify Sans"', weight: 400, arquivo: true, pixel: true, effect: 'eixos',
        eixosToque: [{ tag: 'wght', repouso: 400, toque: 700 }],
        effectHint: 'Pixel clássico que engorda ao tocar (eixo de peso).',
    },
];

/** Eixos lidos dos arquivos de public/fontes no build (vite-eixos-fontes.ts) */
export type EixoFonte = { tag: string; min: number; padrao: number; max: number };
const EIXOS: Record<string, EixoFonte[]> = eixosLidos;

/** Eixos da fonte com efeito automático (vazio para as demais) */
export const eixosDaFonte = (key: string): EixoFonte[] => {
    const f = TODAS_AS_FONTES.find(o => o.key === key);
    return f?.effect === 'auto' && f.arquivoNome ? EIXOS[f.arquivoNome] ?? [] : [];
};

/** Lista mostrada no painel: as fontes de efeito automático só entram quando o
 *  arquivo delas está em public/fontes; a dica lista os eixos encontrados. */
export const FONT_OPTIONS: FontOption[] = TODAS_AS_FONTES
    .filter(f => f.effect !== 'auto' || (f.arquivoNome && EIXOS[f.arquivoNome]?.length))
    .map(f => f.effect !== 'auto' ? f : {
        ...f,
        effectHint: `Efeito automático: ao tocar, os eixos da fonte (${EIXOS[f.arquivoNome!].map(e => e.tag).join(', ')}) se transformam juntos.`,
    });


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
    sharpColor: BRAND.tinta,
    noteDensity: 0.8,
    noteSpacing: 0.02,
    noteRandomness: 0.8,
    growAmount: 1.45,
    lacosOpacidade: LACOS_OPACIDADE_PADRAO, // laços da marca no fundo (10%)
    motorTexto: true,
    tamanhoV2: true,
    coresIdentidade: true,
    coresIdentidadeV2: true,
    lacosV2: true,
};

/** Chave usada para lembrar as preferências entre sessões */
export const STORAGE_KEY = 'piano-tipografico-config';
