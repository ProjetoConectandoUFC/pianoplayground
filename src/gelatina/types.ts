// ==========================================
// Tipos compartilhados da aplicação
// ==========================================

export interface MidiDevice {
    id: string;
    name: string;
}

/** Nome do tema visual. O tema define fundo, contorno e a cor do sustenido. */
export type ThemeName = 'claro' | 'escuro';

/** Sistema de nomenclatura das notas exibidas na tela. */
export type NoteSystem = 'anglican' | 'latin';

export interface AppSettings {
    /** Chave da fonte escolhida, conforme FONT_OPTIONS em constants.ts */
    fontKey: string;
    /** Tema claro ou escuro */
    theme: ThemeName;
    /** Sistema de nomes: C D E... ou Dó Ré Mi... */
    noteSystem: NoteSystem;
    /** Cor de cada nota natural, na ordem da escala (7 cores em HEX) */
    noteColors: string[];
    /** Cor que a palavra assume quando a nota tocada é um sustenido */
    sharpColor: string;
    /** Densidade: quanto da tela o conjunto de notas ocupa em repouso (0.05 a 1) */
    noteDensity: number;
    /** Espaçamento: padding de cada nota, em fração da menor dimensão da tela */
    noteSpacing: number;
    /** Desalinhamento: o quanto as palavras fogem do alinhamento rígido (0 a 1) */
    noteRandomness: number;
    /** Crescimento da nota pressionada, em relação ao tamanho inativo */
    growAmount: number;
    /** Opacidade dos laços da marca no fundo (0 a 1; 0 esconde) */
    lacosOpacidade: number;
    /** Sombra das letras ligada. Começa desligada; os ajustes abaixo só valem com ela ligada. */
    sombraAtiva: boolean;
    /** Cor da sombra em HEX; vazio segue a cor de contorno do tema (muda com claro/escuro) */
    sombraCor: string;
    /** Opacidade da sombra (0 a 1) */
    sombraOpacidade: number;
    /** Distância da sombra, em fração da altura da letra (cresce junto com a nota tocada) */
    sombraDistancia: number;
    /** Difusão (desfoque) da sombra, em fração da altura da letra; 0 = sombra chapada */
    sombraDifusao: number;
    /** Ângulo para onde a sombra aponta, em graus: 0 = direita, 90 = baixo */
    sombraAngulo: number;
    /** Marca as preferências já ajustadas ao motor em texto (crescimento padrão 1,45) */
    motorTexto?: boolean;
    /** Marca que o tamanho inicial menor (densidade 0,8) já foi aplicado */
    tamanhoV2?: boolean;
    /** Marca que as cores de identidade do Design System Conectando já foram aplicadas */
    coresIdentidade?: boolean;
    /** Marca que a opacidade dos laços já voltou uma vez ao padrão novo (10%) */
    lacosV2?: boolean;
    /** Marca que as cores de identidade do PDF (rosa, turquesa, céu...) já foram aplicadas uma vez */
    coresIdentidadeV2?: boolean;
    /** Marca que a sombra configurável já foi aplicada uma vez (antes era fixa e sempre ligada) */
    sombraV1?: boolean;
}

export interface KnobValues {
    [controllerNumber: number]: number;
}
