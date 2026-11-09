// Tipos do Piano Tipográfico.

export interface MidiDevice {
    id: string;
    name: string;
}

export interface AppSettings {
    /** Tema da moldura (barra, botão e gaveta); também escolhe as cores de fundo e das notas inativas */
    tema: 'claro' | 'escuro';
    fontFamily: string;
    textColor: string;       // cor das notas inativas
    backgroundColor: string;
    noteColors: { [note: string]: string };
    noteSystem: 'anglican' | 'latin';
    noteDensity: number;     // quantidade de notas na tela (0,05 a 1)
    noteRandomness: number;  // quanto da tela as notas ocupam (10 a 100%)
    lacosOpacidade: number;  // laços da marca no fundo (0 a 1; 0 esconde)
}

export interface KnobValues {
    [controllerNumber: number]: number;
}

export interface VisualNote {
    id: number;
    text: string;            // texto exibido: 'C', 'D', 'Dó', 'Ré'...
    position: { top: string; left: string };
    rotation: number;
    fontSize: number;        // em vw, para acompanhar a largura da tela
}

/** Nota tocada no momento: a força do toque define o crescimento */
export interface ActiveNoteInfo {
    velocity: number;
    color: string;
}