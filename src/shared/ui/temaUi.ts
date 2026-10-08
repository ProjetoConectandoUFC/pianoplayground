// Tema e jogo em cena, avisados à moldura comum (ui.css) por atributos no <html>:
//   data-ui-jogo  = 'genius' | 'typographic' | 'gelatina' (definido pelo App)
//   data-ui-tema  = 'claro' | 'escuro'                    (definido pelo jogo em cena)
// A barra, a faixa, o botão de configurações e a gaveta leem as cores daí.

import { useEffect } from 'react';

export type TemaUi = 'claro' | 'escuro';
export type JogoUi = 'genius' | 'typographic' | 'gelatina';

export function definirJogoUi(jogo: JogoUi): void {
    document.documentElement.dataset.uiJogo = jogo;
}

export function definirTemaUi(tema: TemaUi): void {
    document.documentElement.dataset.uiTema = tema;
}

/** O jogo em cena chama este hook com o seu tema. `ativo` = falso não mexe em nada
 *  (o Genius continua montado mesmo quando outro jogo está na tela). */
export function useTemaUi(tema: TemaUi, ativo = true): void {
    useEffect(() => {
        if (ativo) definirTemaUi(tema);
    }, [tema, ativo]);
}
