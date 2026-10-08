import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AppSettings, KnobValues, MidiDevice } from './types';
import {
    AKAI_MPK_MINI_KNOBS, DEFAULT_SETTINGS, FONT_OPTIONS,
    NATURAL_BY_PITCH_CLASS, SHARP_BY_PITCH_CLASS, STORAGE_KEY, THEMES,
} from './constants';
import { listenToMidiDevice, requestMidiAccess } from './services/midiService';
import { ligarSom, soltar, soltarTudo, tocar } from './services/somService';
import { ControlPanel } from './components/ControlPanel';
import { ProjectionScreen } from './components/ProjectionScreen';
import { Gelatina } from './services/gelatinaEngine';
import { useInputMode } from '../shared/useInputMode';
import { attachKeyboard, isTypingTarget } from '../shared/keyboardInput';
import { openProjectionWindow, ProjectionWindow } from '../shared/projectionWindow';
import { BotaoConfig } from '../shared/ui/componentes';
import { useTemaUi } from '../shared/ui/temaUi';
import { publicarStatus } from '../shared/ui/statusEntrada';
import './gelatina.css';

// Sequência da demonstração, em notas MIDI
const DEMO_SEQ: number[][] = [
    [60], [62], [64], [65], [67], [69], [71], [72],
    [71], [69], [67], [65], [64], [62],
    [60, 64], [62, 65], [64, 67], [65, 69],
    [67], [64], [60], [67, 71],
    [69], [65], [62], [66],
    [67], [60, 67], [64], [60, 64, 67],
];
const DEMO_STEP = 620;

/** Lê as preferências guardadas, ignorando qualquer coisa estranha */
const carregarConfig = (): AppSettings => {
    try {
        const cru = localStorage.getItem(STORAGE_KEY);
        if (!cru) return DEFAULT_SETTINGS;
        const salvo = JSON.parse(cru);
        return {
            ...DEFAULT_SETTINGS,
            ...salvo,
            fontKey: FONT_OPTIONS.some(f => f.key === salvo.fontKey) ? salvo.fontKey : DEFAULT_SETTINGS.fontKey,
            // preferências de antes do motor em texto: o crescimento volta ao novo padrão, uma vez
            ...(salvo.motorTexto ? {} : { growAmount: DEFAULT_SETTINGS.growAmount, motorTexto: true }),
            noteColors: Array.isArray(salvo.noteColors) && salvo.noteColors.length === 7
                ? salvo.noteColors : DEFAULT_SETTINGS.noteColors,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

// Piano Gelatina: terceiro modo do Piano Interativo. Vem do projeto
// "piano-tipografico-gelatina"; adaptado para usar o modo de entrada global
// (MIDI ou teclado do computador) e o mesmo atalho A do Piano Tipográfico.
const GelatinaApp: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>(carregarConfig);
    const [isControlPanelVisible, setIsControlPanelVisible] = useState(false);
    const [inputs, setInputs] = useState<MidiDevice[]>([]);
    const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
    const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
    const [midiStatus, setMidiStatus] = useState('Procurando aparelho MIDI');
    const [isAkaiConnected, setIsAkaiConnected] = useState(false);
    const [knobValues, setKnobValues] = useState<KnobValues>({});
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [isSoundOn, setIsSoundOn] = useState(false);
    const [projectionContainer, setProjectionContainer] = useState<HTMLElement | null>(null);

    const projectionWindowRef = useRef<Window | null>(null);
    const projectionRef = useRef<ProjectionWindow | null>(null);
    const inputMode = useInputMode();
    const isKeyboardMode = inputMode === 'keyboard';
    const soundRef = useRef(false);
    soundRef.current = isSoundOn;

    // Todos os motores em cena: o da tela principal e, se aberta, o da projeção.
    // As notas são despachadas para todos ao mesmo tempo.
    // Antes, fechar a projeção deixava o motor dela (já destruído) na lista,
    // e ele continuava recebendo notas. Agora cada tela tem o seu lugar.
    const mainEngineRef = useRef<Gelatina | null>(null);
    const projEngineRef = useRef<Gelatina | null>(null);
    const enginesRef = useRef({
        forEach(fn: (e: Gelatina) => void) {
            if (mainEngineRef.current) fn(mainEngineRef.current);
            if (projEngineRef.current) fn(projEngineRef.current);
        },
    });
    const registrarEngine = useCallback((engine: Gelatina | null) => { mainEngineRef.current = engine; }, []);
    const registrarEngineProjecao = useCallback((engine: Gelatina | null) => { projEngineRef.current = engine; }, []);

    // Guarda as preferências entre sessões
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* ignora */ }
    }, [settings]);

    // Pinta o fundo da página com o tema escolhido
    const tema = THEMES[settings.theme];

    // Avisa o tema atual à moldura comum (barra, faixa, botão e gaveta).
    useTemaUi(settings.theme);
    useEffect(() => {
        const anterior = document.body.style.backgroundColor;
        document.body.style.backgroundColor = tema.ground;
        return () => { document.body.style.backgroundColor = anterior; };
    }, [tema.ground]);

    // Ao sair do modo Gelatina: fecha a janela de projeção e cala o som.
    useEffect(() => () => {
        projectionRef.current?.close();
        soltarTudo();
    }, []);

    // ==========================================
    // Notas: um único caminho para MIDI, teclado e demonstração
    // ==========================================
    const vozesRef = useRef<Map<string, { idx: number; sharp: boolean }>>(new Map());

    const noteOn = useCallback((id: string, midi: number, velocity: number) => {
        if (vozesRef.current.has(id)) return;
        const pc = ((midi % 12) + 12) % 12;
        const sharp = !(pc in NATURAL_BY_PITCH_CLASS);
        const idx = sharp ? SHARP_BY_PITCH_CLASS[pc] : NATURAL_BY_PITCH_CLASS[pc];
        if (idx === undefined) return;
        vozesRef.current.set(id, { idx, sharp });
        enginesRef.current.forEach(e => e.noteOn(idx, sharp, velocity));
        if (soundRef.current) tocar(id, midi, velocity);
    }, []);

    const noteOff = useCallback((id: string) => {
        const v = vozesRef.current.get(id);
        if (!v) return;
        vozesRef.current.delete(id);
        enginesRef.current.forEach(e => e.noteOff(v.idx, v.sharp));
        soltar(id);
    }, []);

    const allOff = useCallback(() => {
        (Array.from(vozesRef.current.keys()) as string[]).forEach(noteOff);
        enginesRef.current.forEach(e => e.allOff());
        soltarTudo();
    }, [noteOff]);

    // ==========================================
    // Demonstração
    // ==========================================
    const demoRef = useRef<{ passo: number; timer: number | null }>({ passo: 0, timer: null });

    const pararDemo = useCallback(() => {
        const d = demoRef.current;
        if (d.timer) { window.clearTimeout(d.timer); d.timer = null; }
        (Array.from(vozesRef.current.keys()) as string[]).filter(k => k.startsWith('demo:')).forEach(noteOff);
        setIsDemoRunning(false);
    }, [noteOff]);

    useEffect(() => {
        if (!isDemoRunning) return;
        const d = demoRef.current;
        let vivo = true;
        const passoDemo = () => {
            if (!vivo) return;
            const acorde = DEMO_SEQ[d.passo % DEMO_SEQ.length];
            d.passo++;
            acorde.forEach((n, i) => noteOn(`demo:${i}`, n, 96));
            d.timer = window.setTimeout(() => {
                acorde.forEach((_, i) => noteOff(`demo:${i}`));
                if (vivo) d.timer = window.setTimeout(passoDemo, DEMO_STEP * 0.22);
            }, DEMO_STEP * 0.78);
        };
        passoDemo();
        return () => {
            vivo = false;
            if (d.timer) { window.clearTimeout(d.timer); d.timer = null; }
            (Array.from(vozesRef.current.keys()) as string[]).filter(k => k.startsWith('demo:')).forEach(noteOff);
        };
    }, [isDemoRunning, noteOn, noteOff]);

    // ==========================================
    // MIDI
    // ==========================================
    useEffect(() => {
        let cancelado = false;
        const iniciar = async () => {
            try {
                const access = await requestMidiAccess();
                if (cancelado) return;
                setMidiAccess(access);
                const listar = () => {
                    const lista = Array.from(access.inputs.values()).map(i => ({
                        id: i.id, name: i.name || 'Aparelho sem nome',
                    }));
                    setInputs(lista);
                    setSelectedInputId(prev => prev && lista.some(l => l.id === prev) ? prev : (lista[0]?.id ?? null));
                    setMidiStatus(lista.length
                        ? `${lista.length} entrada${lista.length > 1 ? 's' : ''} MIDI`
                        : 'Nenhum teclado MIDI encontrado');
                };
                access.onstatechange = listar;
                listar();
            } catch (e) {
                if (!cancelado) setMidiStatus('MIDI indisponível neste navegador');
            }
        };
        iniciar();
        return () => { cancelado = true; };
    }, []);

    const handleControlChange = useCallback((cc: number, value: number) => {
        setKnobValues(prev => ({ ...prev, [cc]: value }));
        const f = value / 127;
        if (cc === AKAI_MPK_MINI_KNOBS.K1) setSettings(s => ({ ...s, growAmount: 1.2 + f * 1.8 }));
        else if (cc === AKAI_MPK_MINI_KNOBS.K2) setSettings(s => ({ ...s, noteDensity: 0.3 + f * 0.7 }));
        else if (cc === AKAI_MPK_MINI_KNOBS.K3) setSettings(s => ({ ...s, noteSpacing: f * 0.06 }));
        else if (cc === AKAI_MPK_MINI_KNOBS.K4) setSettings(s => ({ ...s, noteRandomness: f }));
    }, []);

    useEffect(() => {
        // Modos exclusivos: no modo teclado as mensagens MIDI são ignoradas.
        if (!midiAccess || !selectedInputId || isKeyboardMode) return;
        const entrada = midiAccess.inputs.get(selectedInputId);
        setIsAkaiConnected(entrada?.name?.toLowerCase().includes('mpk mini') ?? false);
        return listenToMidiDevice(
            selectedInputId, midiAccess,
            (nota, vel) => { pararDemo(); noteOn(`midi:${nota}`, nota, vel); },
            (nota) => noteOff(`midi:${nota}`),
            handleControlChange,
        );
    }, [midiAccess, selectedInputId, noteOn, noteOff, handleControlChange, pararDemo, isKeyboardMode]);

    // Ao trocar de modo de entrada, solta as notas que estavam acesas.
    useEffect(() => { allOff(); }, [isKeyboardMode, allOff]);

    // Solta tudo quando a janela perde o foco. Vale para MIDI e teclado.
    useEffect(() => {
        window.addEventListener('blur', allOff);
        return () => window.removeEventListener('blur', allOff);
    }, [allOff]);

    /* =====================================================================
       TECLADO DO COMPUTADOR
       ---------------------------------------------------------------------
       Usa o mapeamento compartilhado do Piano Interativo (src/shared/
       keyboardInput.ts): Q 2 W 3 E R 5 T 6 Y 7 U na 1ª oitava e
       Z S X D C V G B H N J M na 2ª. Só fica ativo no modo "Teclado".
       Escuta a janela principal e, se aberta, a janela de projeção.
       ===================================================================== */
    useEffect(() => {
        if (!isKeyboardMode) return;
        const handlers = {
            onNoteOn: ({ midi, velocity }: { midi: number; velocity: number }) => {
                pararDemo();
                noteOn(`tecla:${midi}`, midi, velocity);
            },
            onNoteOff: ({ midi }: { midi: number }) => noteOff(`tecla:${midi}`),
        };
        const limpezas = [attachKeyboard(window, handlers)];
        const proj = projectionWindowRef.current;
        if (proj && !proj.closed) limpezas.push(attachKeyboard(proj, handlers));
        return () => limpezas.forEach(fn => fn());
    }, [isKeyboardMode, noteOn, noteOff, pararDemo, projectionContainer]);

    // Atalhos do painel de configurações: A abre/fecha, ESC fecha.
    // A tecla A não faz parte do mapeamento de notas, então vale nos dois modos.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
            if (isTypingTarget(e.target)) return;
            if (e.code === 'KeyA') {
                e.preventDefault();
                setIsControlPanelVisible(v => !v);
            } else if (e.key === 'Escape') {
                setIsControlPanelVisible(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // ==========================================
    // Janela de projeção
    // ==========================================
    // Abre (ou traz para frente) a janela de projeção para o telão
    const handleOpenProjection = () => {
        if (projectionWindowRef.current && !projectionWindowRef.current.closed) {
            projectionWindowRef.current.focus();
            return;
        }
        const proj = openProjectionWindow('Piano Gelatina: projeção', () => {
            setProjectionContainer(null);
            projectionWindowRef.current = null;
            projectionRef.current = null;
        });
        if (!proj) return;
        projectionRef.current = proj;
        projectionWindowRef.current = proj.win;
        setProjectionContainer(proj.container);
    };

    const handleSettingsChange = (novo: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...novo }));

    const handleToggleSound = (on: boolean) => {
        setIsSoundOn(on);
        if (on) ligarSom(); else soltarTudo();
    };

    // Status do teclado na barra do topo
    useEffect(() => {
        if (isKeyboardMode) {
            publicarStatus('gelatina', { texto: 'Teclado do computador', estado: 'ok' });
            return;
        }
        const aparelho = inputs.find(i => i.id === selectedInputId);
        publicarStatus('gelatina', aparelho
            ? { texto: `Conectado: ${aparelho.name}`, estado: 'ok' }
            : { texto: midiStatus, estado: 'aviso' });
    }, [isKeyboardMode, inputs, selectedInputId, midiStatus]);

    return (
        <div className="gelatina-root" style={{ backgroundColor: tema.ground }}>
            {/* Palco: as notas elásticas, abaixo da barra e da faixa do topo */}
            <div className="ui-palco">
                <ProjectionScreen settings={settings} onEngine={registrarEngine} />
            </div>

            {/* Mesma tela espelhada na janela de projeção, quando aberta */}
            {projectionContainer && ReactDOM.createPortal(
                <ProjectionScreen settings={settings} onEngine={registrarEngineProjecao} />,
                projectionContainer,
            )}

            {/* Acesso às configurações, no canto esquerdo da barra como nos outros jogos */}
            <BotaoConfig onClick={() => setIsControlPanelVisible(v => !v)} />

            {isControlPanelVisible && (
                <ControlPanel
                    inputs={inputs}
                    selectedInputId={selectedInputId}
                    onDeviceChange={id => { setSelectedInputId(id); allOff(); }}
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    isAkaiConnected={isAkaiConnected}
                    knobValues={knobValues}
                    onClose={() => setIsControlPanelVisible(false)}
                    midiStatus={midiStatus}
                    isDemoRunning={isDemoRunning}
                    onToggleDemo={on => { if (on) setIsDemoRunning(true); else pararDemo(); }}
                    isSoundOn={isSoundOn}
                    onToggleSound={handleToggleSound}
                    onOpenProjection={handleOpenProjection}
                    isProjectionOpen={!!projectionContainer}
                    onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
                    isKeyboardMode={isKeyboardMode}
                />
            )}
        </div>
    );
};

export default GelatinaApp;
