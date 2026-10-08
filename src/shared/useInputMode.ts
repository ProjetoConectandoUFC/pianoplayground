import { useSyncExternalStore } from 'react';
import { getInputMode, onInputModeChange, InputMode } from './inputMode';

// Hook React que acompanha o modo de entrada global.
export function useInputMode(): InputMode {
  return useSyncExternalStore(onInputModeChange, getInputMode, getInputMode);
}
