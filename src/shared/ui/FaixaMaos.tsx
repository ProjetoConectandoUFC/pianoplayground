// Faixa das mãos logo abaixo da barra do topo, nos três jogos.
// Há uma ilustração para cada tema: azul e rosa no escuro, azul-marinho e azul
// no claro. As duas ficam no DOM e o CSS (shell.css) mostra a do tema em cena.
// A ilustração ocupa a largura toda da tela e a altura acompanha a proporção
// de cada uma (--ui-faixa-h em ui.css).
// Para tirar a faixa, troque MOSTRAR_FAIXA para false: a barra continua no
// mesmo lugar e os palcos sobem para ocupar o espaço.

import React, { useEffect } from 'react';
// Importadas pelo Vite para funcionar também no Electron empacotado (file://).
import faixaEscuraUrl from '../../assets/moldura/faixa-maos.png';
import faixaClaraUrl from '../../assets/moldura/faixa-maos-clara.png';

export const MOSTRAR_FAIXA = true;

export const FaixaMaos: React.FC = () => {
    // Sem a faixa, a classe zera --ui-faixa-h e os palcos sobem.
    useEffect(() => {
        document.documentElement.classList.toggle('ui-sem-faixa', !MOSTRAR_FAIXA);
    }, []);

    if (!MOSTRAR_FAIXA) return null;
    return (
        <div className="ui-faixa" aria-hidden="true">
            <img className="ui-faixa-img ui-faixa-escura" src={faixaEscuraUrl} alt="" draggable={false} />
            <img className="ui-faixa-img ui-faixa-clara" src={faixaClaraUrl} alt="" draggable={false} />
        </div>
    );
};
