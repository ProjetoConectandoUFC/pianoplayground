import React, { useEffect, useRef, useState } from 'react';
import GeniusView from './genius/GeniusView';
import TypographicApp from './typographic/TypographicApp';
import GelatinaApp from './gelatina/GelatinaApp';
import { useInputMode } from './shared/useInputMode';
import { setInputMode } from './shared/inputMode';
import { definirJogoUi, JogoUi } from './shared/ui/temaUi';
import { useStatusEntrada } from './shared/ui/statusEntrada';
import { FaixaMaos } from './shared/ui/FaixaMaos';
// Imagens do projeto ficam todas em src/assets (catálogo em src/assets/LEIA-ME.md)
import logoAzulUrl from './assets/marca/logo-conectando-azul.png';
import logoCremeUrl from './assets/marca/logo-conectando-creme.png';
import './shared/ui/ui.css';
import './shell.css';

type View = JogoUi;

// Os três modos disponíveis na lista do botão central.
const VIEWS: { id: View; label: string; hint: string }[] = [
  { id: 'genius', label: 'Genius do Piano', hint: 'Jogo de memória musical' },
  { id: 'typographic', label: 'Piano Tipográfico', hint: 'Notas espalhadas pela tela' },
  { id: 'gelatina', label: 'Piano Gelatina', hint: 'Palavras elásticas que crescem' },
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('genius');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputMode = useInputMode();
  const status = useStatusEntrada(view);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = VIEWS.find((v) => v.id === view)!;

  // Avisa a moldura comum (ui.css) qual jogo está em cena.
  useEffect(() => { definirJogoUi(view); }, [view]);

  const chooseView = (id: View) => {
    setView(id);
    setMenuOpen(false);
    (document.activeElement as HTMLElement | null)?.blur?.();
  };

  // Fecha a lista ao clicar fora ou com ESC. O ESC é capturado antes dos apps
  // para não abortar a partida do Genius nem fechar painéis por engano.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [menuOpen]);

  const chooseMode = (mode: 'midi' | 'keyboard') => (e: React.MouseEvent<HTMLButtonElement>) => {
    setInputMode(mode);
    e.currentTarget.blur();
  };

  return (
    <>
      {/* Genius fica sempre montado (só oculto quando fora de foco) para não
          duplicar os handlers singleton; Tipográfico e Gelatina montam/desmontam. */}
      <GeniusView active={view === 'genius'} />
      {view === 'typographic' && <TypographicApp />}
      {view === 'gelatina' && <GelatinaApp />}

      {/* Barra do topo, igual nos três jogos. À esquerda fica a marca; no
          centro, o seletor de jogo e o modo de entrada; à direita, o status do
          teclado e o botão de configurações de cada jogo (com o atalho A). */}
      <header className="ui-barra" data-view={view}>
        <div className="ui-barra-esq">
          <img className="ui-marca ui-marca-clara" src={logoAzulUrl} alt="Conectando Ciências, Tecnologias e Artes" draggable={false} />
          <img className="ui-marca ui-marca-escura" src={logoCremeUrl} alt="Conectando Ciências, Tecnologias e Artes" draggable={false} />
        </div>

        <div className="ui-barra-centro" ref={menuRef}>
          <button
            className={menuOpen ? 'ui-pilula aberta' : 'ui-pilula'}
            onClick={(e) => {
              setMenuOpen((o) => !o);
              e.currentTarget.blur();
            }}
            title="Escolher jogo"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="ui-ponto-jogo" data-jogo={view} />
            {current.label}
            <svg className="ui-pilula-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <div className="ui-segmentado" role="group" aria-label="Modo de entrada">
            <button
              className={inputMode === 'midi' ? 'ui-segmentado-opcao on' : 'ui-segmentado-opcao'}
              onClick={chooseMode('midi')}
              aria-pressed={inputMode === 'midi'}
              title="Tocar com o teclado MIDI (MPK Mini)"
            >
              MIDI
            </button>
            <button
              className={inputMode === 'keyboard' ? 'ui-segmentado-opcao on' : 'ui-segmentado-opcao'}
              onClick={chooseMode('keyboard')}
              aria-pressed={inputMode === 'keyboard'}
              title="Tocar com o teclado do computador (Q a U e Z a M)"
            >
              Teclado
            </button>
          </div>

          {menuOpen && (
            <div className="ui-menu" role="menu">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  role="menuitemradio"
                  aria-checked={v.id === view}
                  className={v.id === view ? 'ui-menu-item on' : 'ui-menu-item'}
                  onClick={() => chooseView(v.id)}
                >
                  <span className="ui-ponto-jogo" data-jogo={v.id} />
                  <span className="ui-menu-texto">
                    <span className="ui-menu-rotulo">{v.label}</span>
                    <span className="ui-menu-dica">{v.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ui-barra-dir">
          {status.texto && (
            <div className="ui-status" role="status" title={status.texto}>
              <span className={`ui-status-ponto ${status.estado}`} />
              <span>{status.texto}</span>
            </div>
          )}
        </div>
      </header>

      <FaixaMaos />
    </>
  );
};

export default App;
