import { buildPiano, clearAll, setKeyLabels } from './piano.js';
import { initMidi, on as onMidi } from './midi.js';
import { pickRandomMelody, resolveMelody, MELODIES } from './melodies.js';
import * as Game from './game.js';
import {
  primeAudio,
  playWinJingle,
  playLoseJingle,
  playChampionJingle,
  playFireworks,
  cancelCelebrationSounds,
  playSplat,
  playBoo,
  stopBoo,
  preloadBoo,
} from './audio.js';
import { initTomates, throwTomatoes, clearTomatoes } from './tomates.js';
import { startConfetti, stopConfetti } from './confetti.js';
import { setupDebugUi, showPanel as showDebugPanel, hidePanel as hideDebugPanel, dlog, midiName } from './debug.js';
import { getInputMode, onInputModeChange } from '../shared/inputMode';
import { attachKeyboard, MIDI_TO_LABEL } from '../shared/keyboardInput';
import { publicarStatus } from '../shared/ui/statusEntrada';

// Inicializa o Genius UMA vez sobre o markup já injetado no documento e devolve
// { activate, deactivate }. A alternância com o Piano Tipográfico NÃO desmonta o
// Genius — apenas liga/desliga os listeners globais (teclado/clique) e zera a
// partida — para não duplicar os handlers singleton dos módulos (game/midi/debug).
let started = false;

export function initGenius() {
  const ui = {
    stageIndicator: document.getElementById('stage-indicator'),
    message: document.getElementById('message'),
    melodyName: document.getElementById('melody-name'),
    startBtn: document.getElementById('start-btn'),
    piano: document.getElementById('piano'),
    countdown: document.getElementById('countdown'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlayBadge: document.getElementById('overlay-badge'),
    overlayScore: document.getElementById('overlay-score'),
    overlayStars: document.getElementById('overlay-stars'),
    overlaySub: document.getElementById('overlay-sub'),
    overlayBtn: document.getElementById('overlay-btn'),
    overlayBtn2: document.getElementById('overlay-btn-2'),
    picker: document.getElementById('melody-picker'),
    pickerLevel: document.getElementById('picker-level'),
    pickerList: document.getElementById('picker-list'),
    pickerClose: document.getElementById('picker-close'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    settingSameMelody: document.getElementById('setting-same-melody'),
    settingConsole: document.getElementById('setting-console'),
    settingTomate: document.getElementById('setting-tomate'),
    settingSomJogador: document.getElementById('setting-som-jogador'),
    tomates: document.getElementById('tomates'),
    settingsMelodias: document.getElementById('settings-melodias'),
    modoBtns: Array.from(document.querySelectorAll('#settings-panel [data-modo]')),
    modoDica: document.getElementById('setting-modo-dica'),
  };

  const MAX_LEVEL = 3;
  const TIER_LABELS = {
    0: 'Sem brinde',
    1: 'Brinde Nível 1',
    2: 'Brinde Nível 2',
    3: 'Brinde Premium',
  };

  let midiConnected = false;
  let midiStatus = { connected: false, deviceName: null, error: null };
  let isActive = false;       // Genius em foco (visível)?
  let detachKeyboard = null;  // limpeza do listener de teclado do computador

  const isKeyboardMode = () => getInputMode() === 'keyboard';
  // Pronto para jogar: no modo teclado não depende de dispositivo MIDI.
  const inputReady = () => isKeyboardMode() || midiConnected;
  const idleMessage = () => {
    // Pronto para jogar: o convite do layout aprovado. No modo Teclado as
    // letras de Q a U e de Z a M aparecem sobre as teclas do piano.
    if (isKeyboardMode() || midiConnected) return 'Ouça a melodia e repita no teclado.';
    return 'Conecte um teclado MIDI compatível com MPK Mini.';
  };
  let currentLevel = 1;
  let lastMelodyId = null;
  let nextAction = 'restart'; // 'continue' | 'restart' | 'desafio' | 'repetir' | 'rodizio'
  let nextAction2 = null;     // ação do botão secundário (só no fim do modo fácil)

  // Modo de jogo: 'facil' (2, 4 e 6 notas) ou 'desafio' (as versões completas
  // de cada nível, o funcionamento original). O jogo sempre abre no fácil;
  // a troca é pela gaveta ou pelo convite ao fim do modo fácil.
  let modo = 'facil';
  // Modo tomate: começa desligado a cada execução; liga pela gaveta.
  let tomatoMode = false;
  // Invalida a derrota "atrasada" do modo tomate (o cartão espera os
  // tomates caírem) quando a partida muda antes disso.
  let loseToken = 0;
  initTomates(ui.tomates);

  const MODO_DICAS = {
    facil: 'Fácil: 2, 4 e 6 notas nos três estágios. Ao vencer os três, o jogo oferece o modo desafio.',
    desafio: 'Desafio: as melodias completas de cada estágio, valendo os brindes.',
  };

  // Modo de sorteio: por padrão, a mesma música é executada nos 3 níveis
  // (apenas em comprimentos diferentes). Alternar via menu para randomizar.
  let sameMelodyMode = true;
  let currentBaseMelody = null;

  buildPiano(ui.piano);

  function setMessage(text) { ui.message.textContent = text; }
  function setMelodyName(text) { ui.melodyName.textContent = text; }

  function showStageIndicator(level) {
    const rotuloModo = modo === 'facil' ? 'Fácil' : 'Desafio';
    ui.stageIndicator.innerHTML = `<span class="stage-modo">${rotuloModo} · </span>Estágio ${level} de ${MAX_LEVEL}`;
    ui.stageIndicator.classList.remove('hidden', 'lv1', 'lv2', 'lv3');
    ui.stageIndicator.classList.add(`lv${level}`);
  }
  function hideStageIndicator() {
    ui.stageIndicator.classList.add('hidden');
  }

  function showCountdown(n) {
    ui.countdown.innerHTML = `<div class="countdown-num">${n}</div>`;
    ui.countdown.classList.remove('hidden');
  }
  function hideCountdown() {
    ui.countdown.classList.add('hidden');
    ui.countdown.innerHTML = '';
  }

  function hideOverlay() {
    ui.overlay.classList.add('hidden');
    hideSecondButton();
    ui.overlay.classList.remove('win', 'lose', 'champion');
    stopConfetti();
    cancelCelebrationSounds();
    stopBoo(); // nova rodada ou volta ao início: a vaia para
  }

  function setOverlayBadge(tier) {
    ui.overlayBadge.style.display = 'inline-block';
    // No modo fácil não há brindes: a etiqueta só diz o modo.
    if (modo === 'facil') {
      ui.overlayBadge.className = 'tier-badge facil';
      ui.overlayBadge.textContent = 'Modo fácil';
      return;
    }
    ui.overlayBadge.className = `tier-badge t${tier}`;
    ui.overlayBadge.textContent = TIER_LABELS[tier];
  }

  function showSecondButton(text, action) {
    ui.overlayBtn2.textContent = text;
    ui.overlayBtn2.classList.remove('hidden');
    nextAction2 = action;
  }
  function hideSecondButton() {
    ui.overlayBtn2.classList.add('hidden');
    nextAction2 = null;
  }

  // Fim do modo fácil com os três estágios vencidos: convite ao desafio.
  function showEasyComplete({ score, label, stars }) {
    ui.overlay.classList.remove('hidden', 'lose', 'win');
    ui.overlay.classList.add('win', 'champion');
    ui.overlayTitle.textContent = 'Modo fácil concluído!';
    ui.overlayTitle.className = 'overlay-title win';
    setOverlayBadge(3);
    ui.overlayScore.textContent = String(score);
    ui.overlayScore.style.display = 'block';
    ui.overlayStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    ui.overlayStars.style.display = 'block';
    ui.overlaySub.textContent = `${label} · Você venceu os três estágios. Que tal encarar as melodias completas no modo desafio?`;
    ui.overlayBtn.textContent = 'Avançar para o modo desafio →';
    nextAction = 'desafio';
    showSecondButton('Jogar o fácil de novo', 'restart');
  }

  function showInterimWin({ score, label, stars, sub, level }) {
    ui.overlay.classList.remove('hidden', 'lose', 'champion');
    ui.overlay.classList.add('win');
    ui.overlayTitle.textContent = `Estágio ${level} conquistado!`;
    ui.overlayTitle.className = 'overlay-title win';
    setOverlayBadge(level);
    ui.overlayScore.textContent = String(score);
    ui.overlayScore.style.display = 'block';
    ui.overlayStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    ui.overlayStars.style.display = 'block';
    ui.overlaySub.textContent = `${label} · ${sub}`;
    ui.overlayBtn.textContent = 'Próximo estágio →';
    nextAction = 'continue';
  }

  function showChampion({ score, label, stars, sub }) {
    ui.overlay.classList.remove('hidden', 'lose', 'win');
    ui.overlay.classList.add('win', 'champion');
    ui.overlayTitle.textContent = 'Mestre do Piano!';
    ui.overlayTitle.className = 'overlay-title win';
    setOverlayBadge(3);
    ui.overlayScore.textContent = String(score);
    ui.overlayScore.style.display = 'block';
    ui.overlayStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    ui.overlayStars.style.display = 'block';
    ui.overlaySub.textContent = `${label} · Procure nossa equipe no stand pra retirar o Brinde Premium!`;
    // Fim do desafio: a próxima pessoa começa do fácil, com outra música
    ui.overlayBtn.textContent = 'Nova partida';
    nextAction = 'rodizio';
  }

  // Quantos tomates: quanto mais cedo o erro, mais tomates. 8 na primeira
  // nota, caindo em linha reta até 2 na última.
  const TOMATES_MAX = 8;
  const TOMATES_MIN = 2;
  function tomatoCount(pos, total) {
    if (!total || total <= 1) return TOMATES_MAX;
    const p = Math.min(Math.max(pos, 1), total);
    const frac = (p - 1) / (total - 1);
    return Math.round(TOMATES_MAX - frac * (TOMATES_MAX - TOMATES_MIN));
  }

  // Título da derrota quando o jogador levou tomates
  let lastLoseKind = null;
  function tomatoTitle() {
    return tomatoMode && lastLoseKind ? 'Tomatada!' : null;
  }

  function showFinalLose({ reason, level }) {
    const tier = Math.max(0, level - 1);
    ui.overlay.classList.remove('hidden', 'win', 'champion');
    ui.overlay.classList.add(tier === 0 ? 'lose' : 'win');
    ui.overlayScore.style.display = 'none';
    ui.overlayStars.style.display = 'none';

    if (modo === 'facil') {
      // Sem brindes no modo fácil: só o incentivo para tentar de novo.
      ui.overlay.classList.remove('win');
      ui.overlay.classList.add('lose');
      ui.overlayTitle.textContent = tomatoTitle() || 'Quase lá!';
      ui.overlayTitle.className = 'overlay-title lose';
      setOverlayBadge(0);
      ui.overlaySub.textContent = `${reason || ''} Respire fundo e tente outra vez, você consegue!`;
      ui.overlayBtn.textContent = 'Tentar a mesma música';
      nextAction = 'repetir';
      showSecondButton('Nova música', 'restart');
      return;
    }

    if (tier === 0) {
      ui.overlayTitle.textContent = tomatoTitle() || 'Quase lá!';
      ui.overlayTitle.className = 'overlay-title lose';
      setOverlayBadge(0);
      ui.overlaySub.textContent = `${reason || ''} Respire fundo e tente outra vez, você consegue!`;
    } else {
      ui.overlayTitle.textContent = `Brinde Nível ${tier} conquistado!`;
      ui.overlayTitle.className = 'overlay-title win';
      setOverlayBadge(tier);
      const congrats = tier === 2
        ? 'Mandou muito bem! Procure nossa equipe pra retirar seu brinde.'
        : 'Parabéns! Procure nossa equipe pra retirar seu brinde.';
      ui.overlaySub.textContent = congrats;
    }
    // Sem brinde: o principal é tentar de novo a mesma música. Com brinde, o
    // principal segue sendo a nova partida (a fila do estande anda) e a
    // repetição fica como segunda opção.
    // "Nova partida" no desafio sempre faz o rodízio: volta ao fácil com
    // outra música.
    if (tier === 0) {
      ui.overlayBtn.textContent = 'Tentar a mesma música';
      nextAction = 'repetir';
      showSecondButton('Nova partida', 'rodizio');
    } else {
      ui.overlayBtn.textContent = 'Nova partida';
      nextAction = 'rodizio';
      showSecondButton('Tentar a mesma música', 'repetir');
    }
  }

  function updateButton() {
    const idle = Game.getState() === Game.States.IDLE;
    const enabled = inputReady() && idle;
    ui.startBtn.disabled = !enabled;
    ui.startBtn.style.display = idle ? '' : 'none';
    // A lista de melodias (na gaveta) só vale antes da demonstração começar
    if (ui.settingsMelodias) ui.settingsMelodias.disabled = !pickerAllowed();
  }

  // Estados em que a lista de melodias (modo desenvolvedor) pode ser aberta
  function pickerAllowed() {
    const okStates = [Game.States.IDLE, Game.States.INTRO, Game.States.COUNTDOWN];
    return okStates.includes(Game.getState());
  }
  function openPickerIfAllowed() {
    if (!pickerAllowed()) return;
    const level = Game.getState() === Game.States.IDLE ? 1 : currentLevel;
    showMelodyPicker(level);
  }

  Game.on('state', ({ state, payload }) => {
    switch (state) {
      case Game.States.IDLE:
        loseToken++;
        clearTomatoes(true);
        hideCountdown();
        // Antes da partida a pílula já mostra o estágio de partida (layout aprovado)
        showStageIndicator(1);
        hideOverlay();
        setMelodyName('');
        ui.message.classList.remove('pulse');
        setMessage(idleMessage());
        break;
      case Game.States.INTRO:
        loseToken++;
        // Tela "lavada" antes da nova rodada
        clearTomatoes(true);
        hideCountdown();
        hideOverlay();
        showStageIndicator(payload.level);
        setMessage('Prepare-se!');
        setMelodyName(`Sua música: ${payload.melodyName}`);
        break;
      case Game.States.COUNTDOWN:
        showCountdown(payload.n);
        break;
      case Game.States.DEMO:
        hideCountdown();
        setMessage('Ouça e veja a melodia…');
        break;
      case Game.States.INPUT:
        setMessage('Sua vez! Toque a melodia.');
        // Reinicia animação para dar sinal visual claro de "input aberto"
        ui.message.classList.remove('pulse');
        void ui.message.offsetWidth;
        ui.message.classList.add('pulse');
        break;
      case Game.States.WIN:
        if (payload.level < MAX_LEVEL) {
          showInterimWin(payload);
          playWinJingle();
        } else if (modo === 'facil') {
          showEasyComplete(payload);
          playChampionJingle();
          startConfetti();
        } else {
          showChampion(payload);
          playChampionJingle();
          startConfetti();
          // Estouros de fogos entram depois do arpejo inicial
          setTimeout(() => playFireworks(7), 700);
        }
        break;
      case Game.States.LOSE: {
        lastLoseKind = payload.kind;
        // Modo tomate: qualquer derrota leva tomate (nota errada, tempo
        // esgotado ou ritmo irregular no desafio)
        if (tomatoMode) {
          // Primeiro os tomates (o jogador vê a tela suja), depois o cartão.
          const token = ++loseToken;
          const qtd = tomatoCount(payload.pos, payload.total);
          dlog('info', `Modo tomate: erro na nota ${payload.pos}/${payload.total} → ${qtd} tomates`);
          setMessage('Tomatada!');
          // A vaia da plateia (gravação de 3 s) substitui o jingle de derrota
          playBoo();
          throwTomatoes(qtd, () => playSplat()).then(() => {
            setTimeout(() => {
              if (token !== loseToken || Game.getState() !== Game.States.LOSE) return;
              showFinalLose(payload);
              updateButton();
            }, 650);
          });
        } else {
          showFinalLose(payload);
          playLoseJingle();
        }
        break;
      }
    }
    updateButton();
  });

  // Status no topo: reflete o modo de entrada e o dispositivo MIDI. Agora é
  // mostrado pela barra comum do App (src/shared/ui/statusEntrada.ts).
  function renderStatus() {
    if (isKeyboardMode()) {
      publicarStatus('genius', { texto: 'Teclado do computador', estado: 'ok' });
    } else if (midiStatus.connected) {
      publicarStatus('genius', { texto: `Conectado: ${midiStatus.deviceName ?? 'dispositivo MIDI'}`, estado: 'ok' });
    } else {
      publicarStatus('genius', {
        texto: midiStatus.error ? 'Web MIDI indisponível' : 'Nenhum dispositivo MIDI detectado',
        estado: 'aviso',
      });
    }
    if (Game.getState() === Game.States.IDLE) setMessage(idleMessage());
    updateButton();
  }

  onMidi('status', ({ connected, deviceName, error }) => {
    midiConnected = connected;
    midiStatus = { connected, deviceName, error: error ?? null };
    renderStatus();
  });

  // Modos exclusivos: mensagens MIDI só contam no modo MIDI.
  onMidi('noteOn', (e) => {
    if (isKeyboardMode()) return;
    Game.handleNoteOn(e);
  });

  // ─── Modo teclado do computador ───
  // Liga o listener só quando o Genius está em foco E o modo é "teclado".
  function syncKeyboard() {
    const want = isActive && isKeyboardMode();
    if (want && !detachKeyboard) {
      detachKeyboard = attachKeyboard(window, {
        onNoteOn: ({ midi, time, key }) => {
          dlog('midi', `Teclado [${key}] NoteOn  ${midiName(midi)} (#${midi})`);
          Game.handleNoteOn({ midi, velocity: 100, time });
        },
        onNoteOff: ({ midi, key }) => {
          dlog('midi-off', `Teclado [${key}] NoteOff ${midiName(midi)} (#${midi})`);
        },
      });
      dlog('info', 'Modo teclado ativo: Q 2 W 3 E R 5 T 6 Y 7 U (1ª oitava) · Z S X D C V G B H N J M (2ª oitava)');
    } else if (!want && detachKeyboard) {
      detachKeyboard();
      detachKeyboard = null;
    }
  }

  function applyInputMode() {
    setKeyLabels(isKeyboardMode() ? MIDI_TO_LABEL : null);
    syncKeyboard();
    renderStatus();
  }

  onInputModeChange((mode) => {
    dlog('info', `Modo de entrada: ${mode === 'keyboard' ? 'teclado do computador' : 'MIDI'}`);
    // Trocar de modo no meio da rodada zera a partida (evita misturar entradas).
    if (Game.getState() !== Game.States.IDLE) Game.abort();
    applyInputMode();
  });

  function startRoundAtLevel(level) {
    primeAudio();
    hideOverlay();
    hideCountdown();
    clearAll();

    // No nível 1, ou se o modo é random, sorteamos uma melodia nova.
    // Caso contrário, mantemos a melodia base e tocamos a versão do nível atual.
    if (level === 1 || !sameMelodyMode || !currentBaseMelody) {
      currentBaseMelody = pickRandomMelody(lastMelodyId);
      lastMelodyId = currentBaseMelody.id;
    }

    const resolved = resolveMelody(currentBaseMelody, level, modo);
    Game.setRitmoObrigatorio(modo === 'desafio');
    Game.startRound(resolved, level);
  }

  function startRoundWithBase(baseMelody, level) {
    primeAudio();
    hideOverlay();
    hideCountdown();
    clearAll();
    currentBaseMelody = baseMelody;
    lastMelodyId = baseMelody.id;
    currentLevel = level;
    const resolved = resolveMelody(baseMelody, level, modo);
    Game.setRitmoObrigatorio(modo === 'desafio');
    Game.startRound(resolved, level);
  }

  function showMelodyPicker(level) {
    ui.pickerLevel.textContent = String(level);
    ui.pickerList.innerHTML = '';
    for (const m of MELODIES) {
      const noteCount = resolveMelody(m, level, modo).notes.length;
      const btn = document.createElement('button');
      btn.className = 'picker-item';
      btn.innerHTML =
        `${m.name}<span class="picker-meta">${noteCount} notas · ${m.bpm} BPM</span>`;
      btn.addEventListener('click', () => {
        hideMelodyPicker();
        Game.abort();
        startRoundWithBase(m, level);
      });
      ui.pickerList.appendChild(btn);
    }
    ui.picker.classList.remove('hidden');
  }

  function hideMelodyPicker() {
    ui.picker.classList.add('hidden');
  }

  function isPickerOpen() {
    return !ui.picker.classList.contains('hidden');
  }

  ui.pickerClose.addEventListener('click', hideMelodyPicker);
  ui.picker.addEventListener('click', (e) => {
    if (e.target === ui.picker) hideMelodyPicker();
  });

  function startNewGame() {
    currentLevel = 1;
    currentBaseMelody = null; // garante novo sorteio
    startRoundAtLevel(currentLevel);
  }

  ui.startBtn.addEventListener('click', startNewGame);

  function runAction(action) {
    Game.abort();
    if (action === 'continue') {
      currentLevel = Math.min(MAX_LEVEL, currentLevel + 1);
      startRoundAtLevel(currentLevel);
    } else if (action === 'desafio') {
      // O desafio começa com a mesma música que o jogador acabou de vencer
      // no modo fácil, agora com as melodias completas.
      setModo('desafio', { silencioso: true });
      currentLevel = 1;
      if (currentBaseMelody) startRoundWithBase(currentBaseMelody, 1);
      else startNewGame();
    } else if (action === 'rodizio') {
      // Rodízio do estande: "Nova partida" no desafio volta ao modo fácil e
      // sorteia outra música (pickRandomMelody já evita repetir a última).
      setModo('facil', { silencioso: true });
      startNewGame();
    } else if (action === 'repetir') {
      // Mesma música, mesmo modo, do estágio 1
      currentLevel = 1;
      if (currentBaseMelody) startRoundWithBase(currentBaseMelody, 1);
      else startNewGame();
    } else {
      startNewGame();
    }
  }
  ui.overlayBtn.addEventListener('click', () => runAction(nextAction));
  ui.overlayBtn2.addEventListener('click', () => {
    if (nextAction2) runAction(nextAction2);
  });

  // ─── Modo de jogo (gaveta) ───
  function syncModoUi() {
    for (const b of ui.modoBtns) {
      const on = b.dataset.modo === modo;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (ui.modoDica) ui.modoDica.textContent = MODO_DICAS[modo];
  }
  // Trocar de modo zera a partida (volta à tela inicial), exceto quando o
  // próprio jogo faz a troca para começar o desafio em seguida.
  function setModo(novo, { silencioso = false } = {}) {
    if (novo !== 'facil' && novo !== 'desafio') return;
    const mudou = novo !== modo;
    modo = novo;
    syncModoUi();
    if (!mudou) return;
    dlog('info', `Modo de jogo: ${modo === 'facil' ? 'fácil' : 'desafio'}`);
    if (!silencioso) {
      Game.abort();
      showStageIndicator(1);
    }
  }
  for (const b of ui.modoBtns) {
    b.addEventListener('click', (e) => {
      e.currentTarget.blur();
      setModo(b.dataset.modo);
    });
  }
  syncModoUi();

  // Atalhos de teclado:
  //   ESC: fecha o picker; senão fecha a gaveta; senão aborta a rodada atual
  //   A:   abre/fecha a gaveta de configurações, como nos outros dois jogos
  //        (com o picker aberto, fecha o picker). A lista de melodias agora
  //        abre pelo botão "Escolher melodia" da gaveta.
  //        A tecla A não é usada pelo mapeamento de notas do modo teclado.
  // Registrado/removido em activate()/deactivate() para não interferir no
  // Piano Tipográfico quando o Genius não estiver em foco.
  function onKeydown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'Escape') {
      if (isPickerOpen()) { hideMelodyPicker(); return; }
      // Com a gaveta de configurações aberta, o ESC só fecha a gaveta.
      if (!ui.settingsPanel.classList.contains('hidden')) { closeSettings(); return; }
      if (Game.getState() === Game.States.IDLE) return;
      Game.abort();
      return;
    }

    if (e.code === 'KeyA') {
      if (e.repeat) return;
      if (isPickerOpen()) { hideMelodyPicker(); return; }
      toggleSettings();
    }
  }

  // ─── Menu de configurações (≡) ───
  function toggleSettings() {
    ui.settingsPanel.classList.toggle('hidden');
  }
  function closeSettings() {
    ui.settingsPanel.classList.add('hidden');
  }
  function onDocClick(e) {
    if (ui.settingsPanel.classList.contains('hidden')) return;
    if (ui.settingsPanel.contains(e.target)) return;
    if (e.target === ui.settingsBtn) return;
    closeSettings();
  }
  ui.settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSettings();
  });
  if (ui.settingsMelodias) {
    ui.settingsMelodias.addEventListener('click', () => {
      closeSettings();
      openPickerIfAllowed();
    });
  }
  ui.settingSameMelody.addEventListener('change', (e) => {
    sameMelodyMode = e.target.checked;
  });
  ui.settingSomJogador.addEventListener('change', (e) => {
    Game.setPlayerSound(e.target.checked);
    dlog('info', `Som das notas do jogador: ${e.target.checked ? 'ligado' : 'desligado'}`);
  });
  ui.settingTomate.addEventListener('change', (e) => {
    tomatoMode = e.target.checked;
    if (tomatoMode) preloadBoo();
    dlog('info', `Modo tomate: ${tomatoMode ? 'ligado' : 'desligado'}`);
    if (!tomatoMode) clearTomatoes(true);
  });
  ui.settingConsole.addEventListener('change', (e) => {
    if (e.target.checked) showDebugPanel();
    else hideDebugPanel();
  });

  setupDebugUi();
  initMidi();
  applyInputMode();

  function activate() {
    isActive = true;
    syncKeyboard();
    window.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onDocClick);
    Game.abort(); // volta ao estado IDLE limpo ao (re)focar o jogo
    updateButton();
  }

  function deactivate() {
    isActive = false;
    syncKeyboard();
    window.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onDocClick);
    Game.abort();
    stopConfetti();
    cancelCelebrationSounds();
    hideMelodyPicker();
    closeSettings();
  }

  return { activate, deactivate };
}

// Garante init único (React StrictMode/remontagens não duplicam handlers).
let api = null;
export function ensureGenius() {
  if (!started) {
    started = true;
    api = initGenius();
  }
  return api;
}
