import React, { useEffect, useRef, useState } from 'react';
import { ensureGenius } from './renderer.js';
import './genius.css';
// Importados pelo Vite para funcionar também no Electron empacotado (file://).
// (catálogo das imagens em src/assets/LEIA-ME.md)
import lacoEsquerdaUrl from '../assets/genius/laco-esquerda.png';
import lacoDireitaUrl from '../assets/genius/laco-direita.png';
import lacoEsquerdaAmareloUrl from '../assets/genius/laco-esquerda-amarelo.png';
import lacoDireitaAmareloUrl from '../assets/genius/laco-direita-amarelo.png';
import { TemaUi, useTemaUi } from '../shared/ui/temaUi';

// Ícones da moldura comum (os mesmos de src/shared/ui/componentes.tsx)
const ICONE_AJUSTES = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>`;
const ICONE_FECHAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

// Markup original do Genius (corpo do index.html), com os mesmos ids que o
// renderer.js espera. Injetado uma única vez; o React só controla visibilidade
// e o ciclo activate/deactivate. O cabeçalho e a gaveta de configurações usam
// as peças da moldura comum (src/shared/ui/ui.css); a marca e o status do
// teclado agora ficam na barra do topo do App.
const GENIUS_MARKUP = `
  <main id="app">
    <!-- Fundo decorativo: laços brancos translúcidos no tema escuro, amarelos no claro -->
    <div class="genius-bg" aria-hidden="true">
      <img class="genius-laco genius-laco-esq escuro" src="${lacoEsquerdaUrl}" alt="" draggable="false" />
      <img class="genius-laco genius-laco-dir escuro" src="${lacoDireitaUrl}" alt="" draggable="false" />
      <img class="genius-laco genius-laco-esq claro" src="${lacoEsquerdaAmareloUrl}" alt="" draggable="false" />
      <img class="genius-laco genius-laco-dir claro" src="${lacoDireitaAmareloUrl}" alt="" draggable="false" />
    </div>

    <header class="topbar">
      <div class="ui-config">
        <span class="ui-atalho" aria-hidden="true">A</span>
        <button id="settings-btn" class="ui-btn-config" aria-label="Configurações (tecla A)" title="Configurações (A)">${ICONE_AJUSTES}</button>
      </div>
    </header>

    <!-- Gaveta de configurações. O GeniusView a leva para o <body>, para ficar
         acima da barra e da faixa do topo, como nos outros jogos. -->
    <div id="settings-panel" class="settings-panel ui-gaveta hidden" role="dialog" aria-label="Configurações">
      <div class="ui-gaveta-cabeca">
        <div>
          <h2 class="ui-gaveta-titulo">Configurações</h2>
          <p class="ui-gaveta-sub">Genius do Piano · tecla A abre e fecha</p>
        </div>
        <button id="settings-close" class="ui-btn-fechar" aria-label="Fechar">${ICONE_FECHAR}</button>
      </div>
      <section class="ui-secao">
        <h3 class="ui-secao-titulo">Partida</h3>
        <label class="ui-interruptor-linha">
          <span class="ui-interruptor-texto">
            <span class="ui-interruptor-rotulo">Mesma melodia nos 3 níveis</span>
            <span class="ui-dica">Cada estágio repete a melodia do anterior, mais longa.</span>
          </span>
          <input type="checkbox" id="setting-same-melody" class="ui-interruptor" checked />
        </label>
        <label class="ui-interruptor-linha">
          <span class="ui-interruptor-texto">
            <span class="ui-interruptor-rotulo">Mostrar console (observador)</span>
            <span class="ui-dica">Registro dos eventos da partida, para quem acompanha o jogo.</span>
          </span>
          <input type="checkbox" id="setting-console" class="ui-interruptor" />
        </label>
        <button id="settings-melodias" class="ui-btn-secundario">Escolher melodia</button>
        <p class="ui-dica">Modo desenvolvedor: carrega uma melodia específica. Vale antes da demonstração começar.</p>
      </section>
      <section class="ui-secao">
        <h3 class="ui-secao-titulo">Entrada</h3>
        <p class="ui-dica">O modo MIDI ou Teclado é escolhido na barra do topo e vale para os três jogos. No modo Teclado, as letras aparecem sobre as teclas do piano.</p>
      </section>
      <section class="ui-secao">
        <h3 class="ui-secao-titulo">Aparência</h3>
        <div>
          <span class="ui-rotulo">Tema</span>
          <div class="ui-segmentado" role="group" aria-label="Tema">
            <button class="ui-segmentado-opcao" data-genius-tema="claro" aria-pressed="false">Claro</button>
            <button class="ui-segmentado-opcao" data-genius-tema="escuro" aria-pressed="false">Escuro</button>
          </div>
        </div>
      </section>
    </div>
    <div id="settings-scrim" class="settings-scrim ui-gaveta-fundo" aria-hidden="true"></div>

    <section id="stage" class="stage">
      <h1 class="genius-title">Genius do Piano</h1>
      <div id="stage-indicator" class="stage-indicator hidden">Estágio 1 de 3</div>
      <div id="message" class="message">Conecte um teclado MIDI compatível com MPK Mini.</div>
      <div id="melody-name" class="melody-name"></div>
      <button id="start-btn" class="start-btn" disabled>Iniciar partida</button>
    </section>

    <section class="piano-wrap">
      <div id="piano" class="piano" aria-label="Teclado MPK Mini virtual"></div>
    </section>

    <div id="countdown" class="countdown hidden" aria-hidden="true"></div>

    <div id="confetti" class="confetti hidden" aria-hidden="true"></div>

    <div id="melody-picker" class="melody-picker hidden" role="dialog">
      <div class="melody-picker-card">
        <header class="picker-header">
          <span>Modo desenvolvedor: escolha do estágio <span id="picker-level">1</span></span>
          <button id="picker-close" class="debug-btn" title="Cancelar">×</button>
        </header>
        <div id="picker-list" class="picker-list"></div>
        <footer class="picker-footer">A ou ESC fecha · clique numa melodia para carregá-la</footer>
      </div>
    </div>

    <aside id="debug-panel" class="debug-panel hidden">
      <header class="debug-header">
        <span class="debug-title">Observador (O para ocultar)</span>
        <span class="debug-actions">
          <button id="debug-clear" class="debug-btn" title="Limpar log">limpar</button>
          <button id="debug-close" class="debug-btn" title="Ocultar">×</button>
        </span>
      </header>
      <div id="debug-log" class="debug-log"></div>
    </aside>

    <div id="overlay" class="overlay hidden">
      <div class="overlay-card">
        <div id="overlay-title" class="overlay-title"></div>
        <div id="overlay-badge" class="tier-badge" style="display:none"></div>
        <div id="overlay-score" class="overlay-score"></div>
        <div id="overlay-stars" class="overlay-stars"></div>
        <div id="overlay-sub" class="overlay-sub"></div>
        <button id="overlay-btn" class="start-btn">Jogar de novo</button>
      </div>
    </div>
  </main>
`;

interface Props {
  active: boolean;
}

const CHAVE_TEMA = 'genius-tema';

const temaSalvo = (): TemaUi => {
  try {
    const t = window.localStorage.getItem(CHAVE_TEMA);
    if (t === 'claro' || t === 'escuro') return t;
  } catch { /* storage indisponível */ }
  return 'escuro';
};

const GeniusView: React.FC<Props> = ({ active }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ activate: () => void; deactivate: () => void } | null>(null);
  const [tema, setTema] = useState<TemaUi>(temaSalvo);

  // Avisa a moldura comum (barra, faixa e gaveta) o tema do Genius quando ele está em cena.
  useTemaUi(tema, active);

  // Injeta o markup e inicializa o Genius uma única vez.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!el.innerHTML) {
      el.innerHTML = GENIUS_MARKUP;
    }
    apiRef.current = ensureGenius();

    // A gaveta e o fundo dela vão para o <body>: assim ficam acima da barra
    // e da faixa do topo. O renderer.js continua achando os dois pelo id.
    const painel = document.getElementById('settings-panel');
    const fundo = document.getElementById('settings-scrim');
    if (painel && fundo) {
      document.body.appendChild(painel);
      document.body.appendChild(fundo);
    }
    // A lista de melodias (modo desenvolvedor) também vai para o <body>, para
    // abrir por cima da barra e da faixa das mãos em vez de ficar por baixo.
    const lista = document.getElementById('melody-picker');
    if (lista) document.body.appendChild(lista);
    const fechar = () => painel?.classList.add('hidden');
    const btnFechar = document.getElementById('settings-close');
    btnFechar?.addEventListener('click', fechar);

    // Botões Claro | Escuro da gaveta
    const botoes = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-genius-tema]'));
    const escolher = (e: Event) => {
      const t = (e.currentTarget as HTMLElement).dataset.geniusTema as TemaUi;
      setTema(t);
    };
    botoes.forEach((b) => b.addEventListener('click', escolher));
    return () => {
      btnFechar?.removeEventListener('click', fechar);
      botoes.forEach((b) => b.removeEventListener('click', escolher));
    };
  }, []);

  // Aplica e guarda o tema; marca o botão escolhido na gaveta.
  useEffect(() => {
    containerRef.current?.setAttribute('data-tema', tema);
    document.querySelectorAll<HTMLButtonElement>('[data-genius-tema]').forEach((b) => {
      const on = b.dataset.geniusTema === tema;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { window.localStorage.setItem(CHAVE_TEMA, tema); } catch { /* ignora */ }
  }, [tema]);

  // Liga/desliga listeners e zera a partida conforme o foco.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    if (active) api.activate();
    else api.deactivate();
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="genius-root"
      data-tema={tema}
      style={{ display: active ? 'block' : 'none' }}
    />
  );
};

export default GeniusView;
