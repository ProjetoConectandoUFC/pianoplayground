// Modo de entrada global, compartilhado pelos dois apps (Genius e Tipográfico).
//   'midi'     → notas vêm do teclado MIDI (Web MIDI API), comportamento original.
//   'keyboard' → notas vêm do teclado do computador (ver keyboardInput.ts).
// Os modos são exclusivos: no modo teclado as mensagens MIDI são ignoradas e
// vice-versa, para evitar notas acidentais durante o uso em estande.

export type InputMode = 'midi' | 'keyboard';

const STORAGE_KEY = 'piano-interativo:input-mode';

function loadMode(): InputMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'midi' || saved === 'keyboard') return saved;
  } catch {
    /* storage indisponível: usa o padrão */
  }
  return 'midi';
}

let mode: InputMode = loadMode();
const listeners = new Set<(m: InputMode) => void>();

export function getInputMode(): InputMode {
  return mode;
}

export function setInputMode(next: InputMode): void {
  if (next === mode) return;
  mode = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignora falha de persistência */
  }
  for (const fn of listeners) fn(mode);
}

export function toggleInputMode(): void {
  setInputMode(mode === 'midi' ? 'keyboard' : 'midi');
}

// Retorna a função de cancelamento (compatível com useSyncExternalStore).
export function onInputModeChange(fn: (m: InputMode) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
