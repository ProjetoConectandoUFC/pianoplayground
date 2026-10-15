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
    /** Marca as preferências já ajustadas ao motor em texto (crescimento padrão 1,45) */
    motorTexto?: boolean;
    /** Marca que o tamanho inicial menor (densidade 0,8) já foi aplicado */
    tamanhoV2?: boolean;
}

export interface KnobValues {
    [controllerNumber: number]: number;
}
