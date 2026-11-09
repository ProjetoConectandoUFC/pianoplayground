// Laços da marca no fundo, os mesmos da tela inicial do Genius, para o Piano
// Tipográfico e o Piano Gelatina. Mesma composição do Genius (genius.css):
// o laço grande espelhado no canto de cima à direita, na altura da tela, e o
// mesmo laço menor, girado, no canto de baixo à esquerda.
//
// A cor acompanha o tema: branco no escuro (como no Genius) e o celeste
// #62BFFF no claro. Os dois arquivos têm opacidade cheia; a transparência vem do slider
// "Opacidade dos laços" de cada piano (0 a 1). Padrão 0,1 (10%).
//
// A camada é fixa na tela (position: fixed): na janela principal ocupa a tela
// toda, por baixo da barra do topo; na janela de projeção, a projeção inteira.
// Posições e medidas em ui.css (.ui-lacos).

import React from 'react';
// Importadas pelo Vite para funcionar também no Electron empacotado (file://).
import lacoBrancoUrl from '../../assets/lacos/laco-branco.png';
import lacoAzulUrl from '../../assets/lacos/laco-azul.png';
import { TemaUi } from './temaUi';

export const LACOS_OPACIDADE_PADRAO = 0.1;

interface Props {
    tema: TemaUi;
    /** 0 (escondidos) a 1 (cor plena) */
    opacidade: number;
}

export const LacosFundo: React.FC<Props> = ({ tema, opacidade }) => {
    const valor = Math.min(1, Math.max(0, Number.isFinite(opacidade) ? opacidade : LACOS_OPACIDADE_PADRAO));
    if (valor <= 0) return null;
    const src = tema === 'claro' ? lacoAzulUrl : lacoBrancoUrl;
    return (
        <div className="ui-lacos" data-tema={tema} style={{ opacity: valor }} aria-hidden="true">
            <img className="ui-laco ui-laco-dir" src={src} alt="" draggable={false} />
            <img className="ui-laco ui-laco-esq" src={src} alt="" draggable={false} />
        </div>
    );
};
