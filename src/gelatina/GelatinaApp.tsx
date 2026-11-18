import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AppSettings, KnobValues, MidiDevice } from './types';
import {
    AKAI_MPK_MINI_KNOBS, DEFAULT_SETTINGS, FONT_OPTIONS,
    NATURAL_BY_PITCH_CLASS, SHARP_BY_PITCH_CLASS, STORAGE_KEY, THEMES,
    SOMBRA_DIFUSAO_MAX, SOMBRA_DISTANCIA_MAX, ANGULO_NOTAS_MAX, LIMITES,
} from './constants';
import { COPIAS_MAX } from './services/gelatinaEngine';
import { listenToMidiDevice, requestMidiAccess } from './services/midiService';
import { ligarSom, soltar, soltarTudo, tocar } from './services/somService';
import { ControlPanel } from './components/ControlPanel';
import { ProjectionScreen } from './components/ProjectionScreen';
import { Gelatina } from './services/gelatinaEngine';
import { useInputMode } from '../shared/useInputMode';
import { attachKeyboard, isTypingTarget } from '../shared/keyboardInput';
import { openProjectionWindow, ProjectionWindow } from '../shared/projectionWindow';
import { BotaoConfig, BotoesSorteio } from '../shared/ui/componentes';
import { useTemaUi } from '../shared/ui/temaUi';
import { LacosFundo } from '../shared/ui/LacosFundo';
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

/** Número guardado dentro da faixa; qualquer outra coisa vira o padrão */
const numeroEntre = (v: unknown, min: number, max: number, padrao: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : padrao;

/** Lê as preferências guardadas, ignorando qualquer coisa estranha */
const carregarConfig = (): AppSettings => {
    try {
        const cru = localStorage.getItem(STORAGE_KEY);
        if (!cru) return DEFAULT_SETTINGS;
        const salvo = JSON.parse(cru);
        // Espaço e onda nas letras foram testados e retirados no mesmo dia (16/11/2026):
        // as chaves somem das preferências guardadas.
        delete salvo.espacoLetras;
        delete salvo.ondaLetras;
        return {
            ...DEFAULT_SETTINGS,
            ...salvo,
            fontKey: FONT_OPTIONS.some(f => f.key === salvo.fontKey) ? salvo.fontKey : DEFAULT_SETTINGS.fontKey,
            // preferências de antes do motor em texto: o crescimento volta ao novo padrão, uma vez
            ...(salvo.motorTexto ? {} : { growAmount: DEFAULT_SETTINGS.growAmount, motorTexto: true }),
            // tamanho inicial menor (densidade 0,8): aplicado uma vez a quem tinha o padrão antigo
            ...(salvo.tamanhoV2 ? {} : { noteDensity: DEFAULT_SETTINGS.noteDensity, tamanhoV2: true }),
            // opacidade dos laços do fundo: entre 0 e 1; sem valor guardado, o padrão (20%)
            // (padrão 10% desde lacosV2: quem tinha o valor da primeira versão, 20%, volta ao padrão uma vez)
            lacosOpacidade: salvo.lacosV2 && typeof salvo.lacosOpacidade === 'number' && Number.isFinite(salvo.lacosOpacidade)
                ? Math.min(1, Math.max(0, salvo.lacosOpacidade)) : DEFAULT_SETTINGS.lacosOpacidade,
            lacosV2: true,
            noteColors: Array.isArray(salvo.noteColors) && salvo.noteColors.length === 7
                ? salvo.noteColors : DEFAULT_SETTINGS.noteColors,
            // cores de identidade do Design System Conectando: substituem a paleta
            // anterior uma vez; depois disso, o que for escolhido no painel fica guardado
            ...(salvo.coresIdentidade ? {} : {
                noteColors: DEFAULT_SETTINGS.noteColors,
                sharpColor: DEFAULT_SETTINGS.sharpColor,
                coresIdentidade: true,
            }),
            // cores de identidade do PDF do Design System (rosa, turquesa, céu,
            // rosa antigo, laranja, azul médio e roxo): entram uma vez no lugar da
            // paleta anterior; depois, o que for escolhido no painel fica guardado
            ...(salvo.coresIdentidadeV2 ? {} : {
                noteColors: DEFAULT_SETTINGS.noteColors,
                coresIdentidadeV2: true,
            }),
            // Ajustes da sombra: números fora da faixa (ou ausentes) voltam ao padrão
            sombraAtiva: salvo.sombraAtiva === true,
            sombraCor: typeof salvo.sombraCor === 'string' && /^#[0-9a-f]{6}$/i.test(salvo.sombraCor)
                ? salvo.sombraCor : DEFAULT_SETTINGS.sombraCor,
            sombraOpacidade: numeroEntre(salvo.sombraOpacidade, 0, 1, DEFAULT_SETTINGS.sombraOpacidade),
            sombraDistancia: numeroEntre(salvo.sombraDistancia, 0, SOMBRA_DISTANCIA_MAX, DEFAULT_SETTINGS.sombraDistancia),
            sombraDifusao: numeroEntre(salvo.sombraDifusao, 0, SOMBRA_DIFUSAO_MAX, DEFAULT_SETTINGS.sombraDifusao),
            sombraAngulo: numeroEntre(salvo.sombraAngulo, 0, 360, DEFAULT_SETTINGS.sombraAngulo),
            // Inclinação das notas: só inteiros de -8 a 8. Valor guardado fora disso é
            // limitado e arredondado; ausente (preferências de antes) vira 0, sem inclinação.
            anguloNotas: Math.round(numeroEntre(salvo.anguloNotas, -ANGULO_NOTAS_MAX, ANGULO_NOTAS_MAX, DEFAULT_SETTINGS.anguloNotas)),
            anguloModo: salvo.anguloModo === 'individual' ? 'individual' : 'todas',
            // Curva das linhas (0 a 1) e cópias das notas (inteiro de 1 a 4): fora da faixa
            // é limitado; ausente vira o padrão (retas, uma cópia).
            curvaLinhas: numeroEntre(salvo.curvaLinhas, 0, LIMITES.curvaMax, DEFAULT_SETTINGS.curvaLinhas),
            copiasNotas: Math.round(numeroEntre(salvo.copiasNotas, 1, COPIAS_MAX, DEFAULT_SETTINGS.copiasNotas)),
            // A primeira versão da curva abria curvada (50% e 75%); o padrão passou a ser reto.
            // Quem guardou aquele valor volta às linhas retas, uma vez.
            ...(salvo.linhasRetasV1 ? {} : { curvaLinhas: DEFAULT_SETTINGS.curvaLinhas, linhasRetasV1: true }),
            // O padrão da densidade passou de 80% para 100% (notas ocupando a área toda).
            // Quem guardou o valor anterior vai para o novo, uma vez; depois o deslizante manda.
            ...(salvo.densidadeCheiaV1 ? {} : { noteDensity: DEFAULT_SETTINGS.noteDensity, densidadeCheiaV1: true }),
            // Antes da sombra configurável, a sombra era fixa e sempre ligada. Quem vem
            // dessa versão começa com ela desligada, como o padrão novo, uma vez.
            ...(salvo.sombraV1 ? {} : { sombraAtiva: false, sombraV1: true }),
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

// Piano Gelatina: terceiro modo do Piano Interativo. Vem do projeto
// "piano-tipografico-gelatina"; adaptado para usar o modo de entrada global
// (MIDI ou teclado do computador) e o mesmo atalho A do Piano Tipográfico.
/** Sete cores vivas, bem separadas: matizes espalhados pelo círculo a partir de um
 *  ponto sorteado, com um pouco de variação, em ordem embaralhada. */
function paletaAleatoria(): string[] {
    const hsl = (h: number, s: number, l: number) => {
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
            return Math.round(255 * c).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };
    const inicio = Math.random() * 360;
    const cores = Array.from({ length: 7 }, (_, j) => {
        const h = (inicio + j * (360 / 7) + (Math.random() - 0.5) * 20 + 360) % 360;
        return hsl(h, 0.55 + Math.random() * 0.25, 0.5 + Math.random() * 0.12);
    });
    for (let j = cores.length - 1; j > 0; j--) {
        const r = Math.floor(Math.random() * (j + 1));
        [cores[j], cores[r]] = [cores[r], cores[j]];
    }
    return cores;
}

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

    // O fundo do tema fica no <body>: assim a barra do topo aparece sobre ele e
    // as letras (num plano acima da barra) passam por cima dela.
    useEffect(() => {
        const antes = document.body.style.backgroundColor;
        document.body.style.backgroundColor = tema.ground;
        return () => { document.body.style.backgroundColor = antes; };
    }, [tema.ground]);

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
        let acessoAtual: MIDIAccess | null = null;
        const iniciar = async () => {
            try {
                const access = await requestMidiAccess();
                if (cancelado) return;
                acessoAtual = access;
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
        // ao sair do jogo, para de ouvir conexões (o componente desmonta)
        return () => { cancelado = true; if (acessoAtual) acessoAtual.onstatechange = null; };
    }, []);

    const handleControlChange = useCallback((cc: number, value: number) => {
        setKnobValues(prev => ({ ...prev, [cc]: value }));
        const f = value / 127;
        // Cada knob percorre a faixa inteira do deslizante correspondente (LIMITES)
        const faixa = (min: number, max: number) => min + f * (max - min);
        if (cc === AKAI_MPK_MINI_KNOBS.K1) setSettings(s => ({ ...s, growAmount: faixa(LIMITES.crescimentoMin, LIMITES.crescimentoMax) }));
        else if (cc === AKAI_MPK_MINI_KNOBS.K2) setSettings(s => ({ ...s, noteDensity: faixa(LIMITES.densidadeMin, LIMITES.densidadeMax) }));
        else if (cc === AKAI_MPK_MINI_KNOBS.K3) setSettings(s => ({ ...s, noteSpacing: faixa(0, LIMITES.espacamentoMax) }));
        else if (cc === AKAI_MPK_MINI_KNOBS.K4) setSettings(s => ({ ...s, noteRandomness: faixa(0, LIMITES.desalinhamentoMax) }));
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
    // Também funciona com a janela de projeção em foco: o painel abre aqui, na
    // janela principal, que vem para a frente.
    useEffect(() => {
        const criar = (vindoDaProjecao: boolean) => (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
            if (isTypingTarget(e.target)) return;
            if (e.code === 'KeyA') {
                e.preventDefault();
                setIsControlPanelVisible(v => !v);
                if (vindoDaProjecao) window.focus();
            } else if (e.key === 'Escape') {
                setIsControlPanelVisible(false);
            }
        };
        const principal = criar(false);
        window.addEventListener('keydown', principal);
        const proj = projectionWindowRef.current;
        const daProjecao = criar(true);
        if (proj && !proj.closed) proj.addEventListener('keydown', daProjecao);
        return () => {
            window.removeEventListener('keydown', principal);
            if (proj && !proj.closed) proj.removeEventListener('keydown', daProjecao);
        };
    }, [projectionContainer]);

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

    // Sorteios da barra: uma fonte qualquer da lista (nunca a mesma de agora) e
    // uma paleta nova de sete cores bem separadas no círculo cromático.
    const sortearFonte = () => setSettings(prev => {
        const outras = FONT_OPTIONS.filter(f => f.key !== prev.fontKey);
        if (!outras.length) return prev;
        return { ...prev, fontKey: outras[Math.floor(Math.random() * outras.length)].key };
    });
    const sortearCores = () => setSettings(prev => ({ ...prev, noteColors: paletaAleatoria() }));

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
        <>
        {/* Laços da marca no fundo, como no Genius. Ficam fora do .gelatina-root
            (que é um plano acima da barra do topo) para passarem por baixo da
            barra, da marca e do status, como na tela do Genius. */}
        <LacosFundo tema={settings.theme} opacidade={settings.lacosOpacidade} />
        <div className="gelatina-root">
            {/* Palco: as notas elásticas, abaixo da barra e da faixa do topo */}
            <div className="ui-palco">
                <ProjectionScreen settings={settings} onEngine={registrarEngine} />
            </div>

            {/* Mesma tela espelhada na janela de projeção, quando aberta */}
            {projectionContainer && ReactDOM.createPortal(
                <ProjectionScreen settings={settings} onEngine={registrarEngineProjecao} comLacos />,
                projectionContainer,
            )}

            {/* Acesso às configurações, no canto esquerdo da barra como nos outros jogos */}
            <BotoesSorteio onFonte={sortearFonte} onCores={sortearCores} />
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
        </>
    );
};

export default GelatinaApp;
