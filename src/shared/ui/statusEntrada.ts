// Status da entrada (teclado MIDI ou teclado do computador) de cada jogo,
// mostrado pela barra do topo. Cada jogo publica o seu; a barra mostra o do
// jogo em cena. Antes cada um mostrava de um jeito (pílula no Genius, aviso
// amarelo no Tipográfico, texto no painel do Gelatina).

import { useSyncExternalStore } from 'react';
import type { JogoUi } from './temaUi';

export interface StatusEntrada {
    texto: string;
    /** ok = pronto para tocar; aviso = sem aparelho ou MIDI indisponível */
    estado: 'ok' | 'aviso' | 'neutro';
}

const VAZIO: StatusEntrada = { texto: '', estado: 'neutro' };
const status = new Map<JogoUi, StatusEntrada>();
const ouvintes = new Set<() => void>();

export function publicarStatus(jogo: JogoUi, novo: StatusEntrada): void {
    const atual = status.get(jogo);
    if (atual && atual.texto === novo.texto && atual.estado === novo.estado) return;
    status.set(jogo, novo);
    ouvintes.forEach((fn) => fn());
}

function assinar(fn: () => void): () => void {
    ouvintes.add(fn);
    return () => { ouvintes.delete(fn); };
}

export function useStatusEntrada(jogo: JogoUi): StatusEntrada {
    return useSyncExternalStore(assinar, () => status.get(jogo) ?? VAZIO, () => VAZIO);
}
