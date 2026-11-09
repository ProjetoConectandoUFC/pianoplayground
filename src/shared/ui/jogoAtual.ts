// Jogo em cena (Genius, Tipográfico ou Gelatina), guardado fora do React para
// que a gaveta de configurações de qualquer jogo possa trocar de jogo. O App
// lê daqui o que deve mostrar; a seção "Jogo e entrada" da gaveta escreve.

import { useSyncExternalStore } from 'react';
import type { JogoUi } from './temaUi';

export const JOGOS: { id: JogoUi; rotulo: string; dica: string }[] = [
    { id: 'genius', rotulo: 'Genius do Piano', dica: 'Jogo de memória musical' },
    { id: 'typographic', rotulo: 'Piano Tipográfico', dica: 'Notas espalhadas pela tela' },
    { id: 'gelatina', rotulo: 'Piano Gelatina', dica: 'Palavras elásticas que crescem' },
];

let atual: JogoUi = 'genius';
const ouvintes = new Set<() => void>();

export function escolherJogo(jogo: JogoUi): void {
    if (jogo === atual) return;
    atual = jogo;
    ouvintes.forEach((fn) => fn());
}

function assinar(fn: () => void): () => void {
    ouvintes.add(fn);
    return () => { ouvintes.delete(fn); };
}

export function useJogoAtual(): JogoUi {
    return useSyncExternalStore(assinar, () => atual, () => atual);
}
