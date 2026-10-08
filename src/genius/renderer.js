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
} from './audio.js';
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
    picker: document.getElementById('melody-picker'),
    pickerLevel: document.getElementById('picker-level'),
    pickerList: document.getElementById('picker-list'),
    pickerClose: document.getElementById('picker-close'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    settingSameMelody: document.getElementById('setting-same-melody'),
    settingConsole: document.getElementById('setting-console'),
    settingsMelodias: document.getElementById('settings-melodias'),
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
    if (isKeyboardMode()) return 'Pronto! Toque com as teclas de Q a U e de Z a M. Clique em "Iniciar partida".';
    return midiConnected
      ? 'Pronto! Clique em "Iniciar partida" para começar.'
      : 'Conecte um teclado MIDI compatível com MPK Mini.';
  };
  let currentLevel = 1;
  let lastMelodyId = null;
  let nextAction = 'restart'; // 'continue' | 'restart'

  // Modo de sorteio: por padrão, a mesma música é executada nos 3 níveis
  // (apenas em comprimentos diferentes). Alternar via menu para randomizar.
  let sameMelodyMode = true;
  let currentBaseMelody = null;

  buildPiano(ui.piano);

  function setMessage(text) { ui.message.textContent = text; }
  function setMelodyName(text) { ui.melodyName.textContent = text; }

  function showStageIndicator(level) {
    ui.stageIndicator.textContent = `Estágio ${level} de ${MAX_LEVEL}`;
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
    ui.overlay.classList.remove('win', 'lose', 'champion');
    stopConfetti();
    cancelCelebrationSounds();
  }

  function setOverlayBadge(tier) {
    ui.overlayBadge.style.display = 'inline-block';
    ui.overlayBadge.className = `tier-badge t${tier}`;
    ui.overlayBadge.textContent = TIER_LABELS[tier];
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
    ui.overlayBtn.textContent = 'Nova partida';
    nextAction = 'restart';
  }

  function showFinalLose({ reason, level }) {
    const tier = Math.max(0, level - 1);
    ui.overlay.classList.remove('hidden', 'win', 'champion');
    ui.overlay.classList.add(tier === 0 ? 'lose' : 'win');
    ui.overlayScore.style.display = 'none';
    ui.overlayStars.style.display = 'none';

    if (tier === 0) {
      ui.overlayTitle.textContent = 'Quase lá!';
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
    ui.overlayBtn.textContent = 'Nova partida';
    nextAction = 'restart';
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
        hideCountdown();
        hideStageIndicator();
        hideOverlay();
        setMelodyName('');
        ui.message.classList.remove('pulse');
        setMessage(idleMessage());
        break;
      case Game.States.INTRO:
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
        } else {
          showChampion(payload);
          playChampionJingle();
          startConfetti();
          // Estouros de fogos entram depois do arpejo inicial
          setTimeout(() => playFireworks(7), 700);
        }
        break;
      case Game.States.LOSE:
        showFinalLose(payload);
        playLoseJingle();
        break;
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

    const resolved = resolveMelody(currentBaseMelody, level);
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
    const resolved = resolveMelody(baseMelody, level);
    Game.startRound(resolved, level);
  }

  function showMelodyPicker(level) {
    ui.pickerLevel.textContent = String(level);
    ui.pickerList.innerHTML = '';
    for (const m of MELODIES) {
      const noteCount = (m.versions[level] || m.versions[1]).length;
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

  ui.overlayBtn.addEventListener('click', () => {
    Game.abort();
    if (nextAction === 'continue') {
      currentLevel = Math.min(MAX_LEVEL, currentLevel + 1);
      startRoundAtLevel(currentLevel);
    } else {
      startNewGame();
    }
  });

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
