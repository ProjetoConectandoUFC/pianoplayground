// Simulação de teclas de piano usando o teclado do computador (layout ABNT2).
// Duas oitavas, cada uma em um par de fileiras (teclas pretas na fileira de cima):
//
// 1ª oitava (C3 a B3), fileiras de números e QWERTY:
//      2   3       5   6   7
//    Q   W   E   R   T   Y   U
//
// 2ª oitava (C4 a B4), fileiras ASDF e ZXCV:
//      S   D       G   H   J
//    Z   X   C   V   B   N   M
//
//   Q/Z Dó    2/S Dó#   W/X Ré    3/D Ré#   E/C Mi    R/V Fá
//   5/G Fá#   T/B Sol   6/H Sol#  Y/N Lá    7/J Lá#   U/M Si
//
// A tecla 4 fica livre (não há tecla preta entre Mi e Fá), assim como a F.
// A tecla A fica reservada para atalhos (lista de melodias / painel de controle).
//
// Usa KeyboardEvent.code (posição física da tecla), então funciona igual com
// Caps Lock ligado e em layouts QWERTY/ABNT2.

export interface KeyMapping {
  code: string;   // KeyboardEvent.code
  label: string;  // letra exibida na interface
  offset: number; // semitons a partir do Dó base (0 a 23)
}

export const KEY_MAPPINGS: KeyMapping[] = [
  // 1ª oitava
  { code: 'KeyQ',   label: 'Q', offset: 0 },  // Dó
  { code: 'Digit2', label: '2', offset: 1 },  // Dó#
  { code: 'KeyW',   label: 'W', offset: 2 },  // Ré
  { code: 'Digit3', label: '3', offset: 3 },  // Ré#
  { code: 'KeyE',   label: 'E', offset: 4 },  // Mi
  { code: 'KeyR',   label: 'R', offset: 5 },  // Fá
  { code: 'Digit5', label: '5', offset: 6 },  // Fá#
  { code: 'KeyT',   label: 'T', offset: 7 },  // Sol
  { code: 'Digit6', label: '6', offset: 8 },  // Sol#
  { code: 'KeyY',   label: 'Y', offset: 9 },  // Lá
  { code: 'Digit7', label: '7', offset: 10 }, // Lá#
  { code: 'KeyU',   label: 'U', offset: 11 }, // Si
  // 2ª oitava
  { code: 'KeyZ',   label: 'Z', offset: 12 }, // Dó
  { code: 'KeyS',   label: 'S', offset: 13 }, // Dó#
  { code: 'KeyX',   label: 'X', offset: 14 }, // Ré
  { code: 'KeyD',   label: 'D', offset: 15 }, // Ré#
  { code: 'KeyC',   label: 'C', offset: 16 }, // Mi
  { code: 'KeyV',   label: 'V', offset: 17 }, // Fá
  { code: 'KeyG',   label: 'G', offset: 18 }, // Fá#
  { code: 'KeyB',   label: 'B', offset: 19 }, // Sol
  { code: 'KeyH',   label: 'H', offset: 20 }, // Sol#
  { code: 'KeyN',   label: 'N', offset: 21 }, // Lá
  { code: 'KeyJ',   label: 'J', offset: 22 }, // Lá#
  { code: 'KeyM',   label: 'M', offset: 23 }, 
  { code: 'KeyL',   label: 'L', offset: 24 },
];

// Dó3 (C3). Com o Dó base em 48 as 24 teclas cobrem C3 a B4, ocupando quase
// todo o teclado virtual de 25 teclas do Genius (C3 a C5).
export const BASE_MIDI = 48;

// Velocidade fixa: o teclado do computador não é sensível à força.
export const DEFAULT_VELOCITY = 100;

const CODE_TO_MIDI = new Map<string, number>(
  KEY_MAPPINGS.map((k) => [k.code, BASE_MIDI + k.offset])
);

// Nota MIDI → letra do teclado (para desenhar rótulos no piano virtual).
export const MIDI_TO_LABEL = new Map<number, string>(
  KEY_MAPPINGS.map((k) => [BASE_MIDI + k.offset, k.label])
);

export function midiForCode(code: string): number | undefined {
  return CODE_TO_MIDI.get(code);
}

export interface KeyboardNoteEvent {
  midi: number;
  velocity: number;
  time: number;
  key: string; // letra pressionada
}

export interface KeyboardHandlers {
  onNoteOn: (e: KeyboardNoteEvent) => void;
  onNoteOff: (e: KeyboardNoteEvent) => void;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || tag === 'select') return true;
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type;
    // Checkboxes, sliders e color pickers não recebem texto: não bloqueiam as notas.
    return !['checkbox', 'radio', 'range', 'color', 'button', 'submit'].includes(type);
  }
  return el.isContentEditable;
}

/**
 * Liga a simulação de piano em uma janela. Retorna a função de limpeza.
 * - Ignora auto-repeat (segurar a tecla gera uma única nota).
 * - Ignora combinações com Ctrl/Alt/Cmd/Shift (atalhos continuam funcionando).
 * - Ignora digitação em campos de texto.
 * - Solta todas as notas quando a janela perde o foco (evita notas "presas").
 */
export function attachKeyboard(win: Window, handlers: KeyboardHandlers): () => void {
  const held = new Map<string, number>(); // code → midi

  const release = (code: string) => {
    const midi = held.get(code);
    if (midi === undefined) return;
    held.delete(code);
    const label = KEY_MAPPINGS.find((k) => k.code === code)?.label ?? code;
    handlers.onNoteOff({ midi, velocity: 0, time: performance.now(), key: label });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const midi = CODE_TO_MIDI.get(e.code);
    if (midi === undefined) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (isTypingTarget(e.target)) return;
    e.preventDefault();
    if (e.repeat || held.has(e.code)) return;
    held.set(e.code, midi);
    const label = KEY_MAPPINGS.find((k) => k.code === e.code)?.label ?? e.code;
    handlers.onNoteOn({ midi, velocity: DEFAULT_VELOCITY, time: performance.now(), key: label });
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (held.has(e.code)) release(e.code);
  };

  const releaseAll = () => {
    for (const code of [...held.keys()]) release(code);
  };

  win.addEventListener('keydown', onKeyDown);
  win.addEventListener('keyup', onKeyUp);
  win.addEventListener('blur', releaseAll);

  return () => {
    releaseAll();
    win.removeEventListener('keydown', onKeyDown);
    win.removeEventListener('keyup', onKeyUp);
    win.removeEventListener('blur', releaseAll);
  };
}
