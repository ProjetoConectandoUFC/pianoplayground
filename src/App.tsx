import React, { useEffect } from 'react';
import GeniusView from './genius/GeniusView';
import TypographicApp from './typographic/TypographicApp';
import GelatinaApp from './gelatina/GelatinaApp';
import { useInputMode } from './shared/useInputMode';
import { definirJogoUi } from './shared/ui/temaUi';
import { useStatusEntrada } from './shared/ui/statusEntrada';
import { useJogoAtual } from './shared/ui/jogoAtual';
import { FaixaMaos } from './shared/ui/FaixaMaos';
// Imagens do projeto ficam todas em src/assets (catálogo em src/assets/LEIA-ME.md)
// Marca do Design System Conectando: azul sobre fundo claro, branca sobre a tinta
import logoAzulUrl from './assets/marca/marca-azul.png';
import logoBrancaUrl from './assets/marca/marca-branca.png';
import './shared/ui/ui.css';
import './shell.css';

const App: React.FC = () => {
  // O jogo em cena é escolhido na gaveta de configurações (seção "Jogo e entrada").
  const view = useJogoAtual();
  const inputMode = useInputMode();
  const status = useStatusEntrada(view);

  // Avisa a moldura comum (ui.css) qual jogo está em cena.
  useEffect(() => { definirJogoUi(view); }, [view]);

  // Status mínimo: ponto verde quando a entrada está pronta, vermelho quando não.
  const ativo = status.estado === 'ok';
  const modoTexto = inputMode === 'keyboard' ? 'Teclado' : 'MIDI';
  const detalhe = status.texto || (ativo ? 'Pronto' : 'Indisponível');

  return (
    <>
      {/* Genius fica sempre montado (só oculto quando fora de foco) para não
          duplicar os handlers singleton; Tipográfico e Gelatina montam/desmontam. */}
      <GeniusView active={view === 'genius'} />
      {view === 'typographic' && <TypographicApp />}
      {view === 'gelatina' && <GelatinaApp />}

      {/* Barra do topo, igual nos três jogos: a marca à esquerda; à direita, o
          status da entrada e o botão de configurações de cada jogo. A troca de
          jogo e o modo MIDI | Teclado ficam na gaveta de configurações. */}
      <header className="ui-barra" data-view={view}>
        <div className="ui-barra-esq">
          <img className="ui-marca ui-marca-clara" src={logoAzulUrl} alt="Conectando Ciências, Tecnologias e Artes" draggable={false} />
          <img className="ui-marca ui-marca-escura" src={logoBrancaUrl} alt="Conectando Ciências, Tecnologias e Artes" draggable={false} />
        </div>

        <div className="ui-barra-dir">
          <div
            className={ativo ? 'ui-status ativo' : 'ui-status inativo'}
            role="status"
            title={`${modoTexto}: ${detalhe}`}
            aria-label={`${modoTexto}: ${detalhe}`}
          >
            <span className="ui-status-ponto" aria-hidden="true" />
            <span className="ui-status-modo">{modoTexto}</span>
          </div>
        </div>
      </header>

      <FaixaMaos />
    </>
  );
};

export default App;
