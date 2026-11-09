import { AppSettings } from './types';
import { LACOS_OPACIDADE_PADRAO } from '../shared/ui/LacosFundo';

// ==========================================
// Sistemas de Nomenclatura de Notas
// ==========================================

// Define as 12 notas cromáticas usando a convenção em inglês/anglicana (letras)
export const ANGLICAN_NOTE_NAMES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Define as 7 notas naturais (diatônicas) usando a convenção em inglês/anglicana
export const ANGLICAN_NATURAL_NOTE_NAMES: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Define as 12 notas cromáticas usando a convenção latina (sílabas de solfejo)
export const LATIN_NOTE_NAMES: string[] = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];

// Define as 7 notas naturais (diatônicas) usando a convenção latina
export const LATIN_NATURAL_NOTE_NAMES: string[] = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];

// Associa os identificadores de sistema às respectivas matrizes de notas cromáticas e naturais para facilitar a alternância
export const NOTE_NAME_SYSTEMS = {
    anglican: { all: ANGLICAN_NOTE_NAMES, natural: ANGLICAN_NATURAL_NOTE_NAMES },
    latin: { all: LATIN_NOTE_NAMES, natural: LATIN_NATURAL_NOTE_NAMES },
};


// ==========================================
// Opções de Estilização e Personalização da Interface (UI)
// ==========================================

// Famílias de fontes disponíveis e suas declarações CSS correspondentes para a interface do aplicativo
export const FONT_OPTIONS: { name: string; value: string }[] = [
    { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
    { name: 'Oswald', value: "'Oswald', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Bebas Neue', value: "'Bebas Neue', cursive" },
    { name: 'Lobster', value: "'Lobster', cursive" },
    { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
    { name: 'Press Start 2P', value: "'Press Start 2P', cursive" },
    { name: 'Monoton', value: "'Monoton', cursive" },
    { name: 'Pacifico', value: "'Pacifico', cursive" },
    { name: 'Black Ops One', value: "'Black Ops One', cursive" },
];

// Cor de destaque de cada nota (formato HEX), com as cores do Design System Conectando.
// Uma paleta por tema, porque o sistema proíbe amarelo como texto sobre fundo claro
// e as cores escuras somem sobre a tinta. Os sustenidos usam tons vizinhos.
export const CORES_NOTAS_CLARO: { [key: string]: string } = {
    'C': '#1666B0', // azul
    'D': '#EB5F3E', // coral
    'E': '#0E7A56', // verde (ok)
    'F': '#9A6A08', // âmbar (atenção)
    'G': '#B0261B', // vermelho (erro)
    'A': '#3D8AD1', // azul-brilho
    'B': '#10263F', // tinta n12
    'C#': '#0E5395', // azul-profundo
    'D#': '#33506F', // n11
    'F#': '#486284', // n10
    'G#': '#2670B5', // azul-claro
    'A#': '#5F7B9E', // n9
};
export const CORES_NOTAS_ESCURO: { [key: string]: string } = {
    'C': '#FCE051', // amarelo
    'D': '#EB5F3E', // coral
    'E': '#3D8AD1', // azul-brilho
    'F': '#FFFFFF', // n0
    'G': '#FFF3B0', // amarelo-suave
    'A': '#FBDDD4', // coral-suave
    'B': '#9AAEC8', // n6
    'C#': '#FFEC8A', // amarelo do hover sobre azul
    'D#': '#F2B8A6', // borda da etiqueta de alerta
    'F#': '#DEE5ED', // n2
    'G#': '#EFCF3A', // borda da etiqueta de destaque
    'A#': '#BDC9DA', // n4
};
export const NOTE_HIGHLIGHT_COLORS = CORES_NOTAS_CLARO;

// Configurações padrão aplicadas quando o aplicativo é inicializado ou redefinido
// Cores de fundo e das notas inativas de cada tema da moldura comum
// (src/shared/ui). Continuam editáveis no painel depois de escolher o tema.
// Começam pelas cores do Design System Conectando: fundo creme #FCFAF1 e notas inativas n3 no
// claro; tinta n12 e notas inativas n11 no escuro.
export const TEMAS_TIPOGRAFICO: { [k in AppSettings['tema']]: Pick<AppSettings, 'backgroundColor' | 'textColor' | 'noteColors'> } = {
    escuro: { backgroundColor: '#10263F', textColor: '#33506F', noteColors: CORES_NOTAS_ESCURO },
    claro: { backgroundColor: '#FCFAF1', textColor: '#CED7E4', noteColors: CORES_NOTAS_CLARO },
};

export const DEFAULT_SETTINGS: AppSettings = {
    tema: 'claro',
    fontFamily: "'Roboto Mono', monospace",
    textColor: TEMAS_TIPOGRAFICO.claro.textColor, // cor discreta para notas inativas
    backgroundColor: TEMAS_TIPOGRAFICO.claro.backgroundColor,
    noteColors: TEMAS_TIPOGRAFICO.claro.noteColors,
    noteSystem: 'anglican',
    noteDensity: 0.3, // Densidade padrão (0 a 1)
    noteRandomness: 80, // Aleatoriedade padrão (valores mais altos ficam mais espalhados)
    lacosOpacidade: LACOS_OPACIDADE_PADRAO, // laços da marca no fundo (10%)
};


// ==========================================
// Configuração do Controlador MIDI
// ==========================================

// Mapeia os knobs (botões giratórios físicos K1 a K8) de um teclado Akai MPK Mini para seus respectivos números de CC (Control Change) MIDI
export const AKAI_MPK_MINI_KNOBS: { [key: string]: number } = {
    'K1': 70, 'K2': 71, 'K3': 72, 'K4': 73,
    'K5': 74, 'K6': 75, 'K7': 76, 'K8': 77,
};


// ==========================================
// Configurações de Animação
// ==========================================

// Configurações de animação inspiradas no script original em Python
export const INITIAL_MAX_SCALE_AMOUNT = 1.8; // Fator máximo de escala aplicado com velocidade máxima da nota
export const RELEASE_FADE_SECONDS = 0.5; // Duração em segundos para o efeito de desaparecimento (fade-out) ao soltar a nota
