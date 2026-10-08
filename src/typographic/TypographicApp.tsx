import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { AppSettings, MidiDevice, KnobValues, VisualNote, ActiveNoteInfo } from './types';
import { DEFAULT_SETTINGS, NOTE_NAME_SYSTEMS, AKAI_MPK_MINI_KNOBS, INITIAL_MAX_SCALE_AMOUNT } from './constants';
import { listenToMidiDevice, requestMidiAccess } from './services/midiService';
import { ControlPanel } from './components/ControlPanel';
import { ProjectionScreen } from './components/ProjectionScreen';
import { useInputMode } from '../shared/useInputMode';
import { attachKeyboard, isTypingTarget } from '../shared/keyboardInput';
import { openProjectionWindow, ProjectionWindow } from '../shared/projectionWindow';
import { BotaoConfig } from '../shared/ui/componentes';
import { useTemaUi } from '../shared/ui/temaUi';
import { publicarStatus } from '../shared/ui/statusEntrada';

/**
 * Gera pontos que não se sobrepõem usando o algoritmo Poisson-disc sampling.
 */
const poissonDiscSampling = (width: number, height: number, minRadius: number, k = 30): { x: number; y: number }[] => {
    const cellSize = minRadius / Math.sqrt(2);
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid: number[][] = Array.from({ length: gridWidth }, () => Array(gridHeight).fill(-1));
    const points: { x: number; y: number }[] = [];
    const activeList: number[] = [];

    const toGridCoords = (p: { x: number; y: number }): [number, number] => {
        return [Math.floor(p.x / cellSize), Math.floor(p.y / cellSize)];
    };

    if (width <= 0 || height <= 0) return [];
    
    // Adiciona o primeiro ponto aleatório
    const initialPos = { x: Math.random() * width, y: Math.random() * height };
    const initialGridCoords = toGridCoords(initialPos);
    
    points.push(initialPos);
    activeList.push(0);
    grid[initialGridCoords[0]][initialGridCoords[1]] = 0;

    while (activeList.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeList.length);
        const activeIndex = activeList[randomIndex];
        const activePoint = points[activeIndex];
        let foundPoint = false;

        for (let i = 0; i < k; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * minRadius + minRadius;
            const candidate = {
                x: activePoint.x + radius * Math.cos(angle),
                y: activePoint.y + radius * Math.sin(angle),
            };

            if (candidate.x >= 0 && candidate.x < width && candidate.y >= 0 && candidate.y < height) {
                const candidateGridCoords = toGridCoords(candidate);
                let isValid = true;
                
                const startX = Math.max(0, candidateGridCoords[0] - 2);
                const endX = Math.min(gridWidth, candidateGridCoords[0] + 3);
                const startY = Math.max(0, candidateGridCoords[1] - 2);
                const endY = Math.min(gridHeight, candidateGridCoords[1] + 3);

                for (let x = startX; x < endX; x++) {
                    for (let y = startY; y < endY; y++) {
                        const neighborIndex = grid[x][y];
                        if (neighborIndex !== -1) {
                            const neighborPoint = points[neighborIndex];
                            const dist = Math.hypot(neighborPoint.x - candidate.x, neighborPoint.y - candidate.y);
                            if (dist < minRadius) {
                                isValid = false;
                                break;
                            }
                        }
                    }
                    if (!isValid) break;
                }

                if (isValid) {
                    const newIndex = points.length;
                    points.push(candidate);
                    activeList.push(newIndex);
                    grid[candidateGridCoords[0]][candidateGridCoords[1]] = newIndex;
                    foundPoint = true;
                    break;
                }
            }
        }

        if (!foundPoint) {
            activeList.splice(randomIndex, 1);
        }
    }
    return points;
};

// Gera as notas visuais na tela com base nas configurações
const generateVisualNotes = (settings: AppSettings, viewportWidth: number, viewportHeight: number, fontSizeMultiplier: number): VisualNote[] => {
    if (viewportWidth === 0 || viewportHeight === 0) return [];

    const { noteDensity, noteRandomness, noteSystem } = settings;

    // Define o raio mínimo e máximo com base na densidade
    const maxRadius = 200;
    const minRadius = 40;
    const radiusRange = maxRadius - minRadius;
    const effectiveDensity = (noteDensity - 0.05) / 0.95;
    const currentMinRadius = maxRadius - (effectiveDensity * radiusRange);

    // Define a área de geração com base na aleatoriedade
    const generationWidth = viewportWidth * (noteRandomness / 100);
    const generationHeight = viewportHeight * (noteRandomness / 100);
    const offsetX = (viewportWidth - generationWidth) / 2;
    const offsetY = (viewportHeight - generationHeight) / 2;

    const points = poissonDiscSampling(generationWidth, generationHeight, currentMinRadius);

    const notes: VisualNote[] = [];
    const naturalNotes = NOTE_NAME_SYSTEMS[noteSystem].natural;
    let id = 0;

    for (const point of points) {
        const noteText = naturalNotes[id % naturalNotes.length];
        notes.push({
            id: id++,
            text: noteText,
            position: {
                left: `${((point.x + offsetX) / viewportWidth) * 100}%`,
                top: `${((point.y + offsetY) / viewportHeight) * 100}%`,
            },
            rotation: Math.random() * 50 - 25,
            fontSize: (Math.random() * 2 + 2.5) * fontSizeMultiplier,
        });
    }

    return notes.sort(() => Math.random() - 0.5);
};

const App: React.FC = () => {
    const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
    const [inputs, setInputs] = useState<MidiDevice[]>([]);
    const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    // Painel de controle começa fechado; abre pelo ícone de engrenagem ou pela tecla A.
    const [isControlPanelVisible, setIsControlPanelVisible] = useState<boolean>(false);
    const [isAkaiConnected, setIsAkaiConnected] = useState<boolean>(false);
    const [knobValues, setKnobValues] = useState<KnobValues>({});
    const [midiSupportError, setMidiSupportError] = useState<string | null>(null);
    const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
    const inputMode = useInputMode();
    const isKeyboardMode = inputMode === 'keyboard';

    const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
    const [visualNotes, setVisualNotes] = useState<VisualNote[]>(() => generateVisualNotes(DEFAULT_SETTINGS, window.innerWidth, window.innerHeight, 1.0));
    const [activeNotes, setActiveNotes] = useState<Map<string, ActiveNoteInfo>>(new Map());
    const [maxScale, setMaxScale] = useState(INITIAL_MAX_SCALE_AMOUNT);
    const pressedNaturalNotesRef = useRef<Map<string, number>>(new Map());

    const [projectionContainer, setProjectionContainer] = useState<HTMLElement | null>(null);
    const projectionWindowRef = useRef<Window | null>(null);
    const projectionRef = useRef<ProjectionWindow | null>(null);

    const noteRefs = useRef(new Map<number, HTMLDivElement>());
    const [noteOffsets, setNoteOffsets] = useState<Map<number, { x: number; y: number }>>(new Map());

    // Atualiza o tamanho da tela quando redimensionada
    useEffect(() => {
        const handleResize = () => {
            const target = projectionWindowRef.current || window;
            setViewportSize({ width: target.innerWidth, height: target.innerHeight });
        };
        const targetWindow = projectionWindowRef.current || window;
        targetWindow.addEventListener('resize', handleResize);
        handleResize();
        return () => targetWindow.removeEventListener('resize', handleResize);
    }, [projectionContainer]);

    // Regenera as notas visuais quando as configurações mudam
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const target = projectionWindowRef.current || window;
            setVisualNotes(generateVisualNotes(settings, target.innerWidth, target.innerHeight, fontSizeMultiplier));
        }, 150);
        
        return () => clearTimeout(timeoutId);
    }, [settings.noteDensity, settings.noteRandomness, settings.noteSystem, viewportSize, settings.fontFamily, fontSizeMultiplier, projectionContainer]);

    // Inicializa o acesso MIDI ao carregar o aplicativo
    useEffect(() => {
        const initMidi = async () => {
            try {
                const access = await requestMidiAccess();
                setMidiAccess(access);
                const midiInputs = Array.from(access.inputs.values()).map(input => ({
                    id: input.id,
                    name: input.name || 'Aparelho sem nome',
                }));
                setInputs(midiInputs);
                if (midiInputs.length > 0) {
                    setSelectedInputId(midiInputs[0].id);
                } else {
                    throw new Error("No MIDI input devices found.");
                }
            } catch (error) {
                console.error('MIDI Init Error:', error);
                if (error instanceof Error) {
                    setMidiSupportError(error.message);
                } else {
                    setMidiSupportError('An unknown error occurred while accessing MIDI devices.');
                }
                setIsSimulationMode(true);
            }
        };

        initMidi();
    }, []);

    // Manipula quando uma nota MIDI é acionada (Note On)
    const handleNoteOn = useCallback((noteNumber: number, velocity: number) => {
        const anglicanNoteName = NOTE_NAME_SYSTEMS.anglican.all[noteNumber % 12];
        const naturalNote = anglicanNoteName.replace('#', '');
        const color = settings.noteColors[anglicanNoteName] || '#FFFFFF';

        const naturalNoteToDisplay = NOTE_NAME_SYSTEMS[settings.noteSystem].natural.find(
             (n, i) => NOTE_NAME_SYSTEMS.anglican.natural[i] === naturalNote
        ) || naturalNote;

        const currentCount = pressedNaturalNotesRef.current.get(naturalNoteToDisplay) || 0;
        pressedNaturalNotesRef.current.set(naturalNoteToDisplay, currentCount + 1);

        setActiveNotes(prev => {
            const newActiveNotes = new Map(prev);
            newActiveNotes.set(naturalNoteToDisplay, { velocity, color });
            return newActiveNotes;
        });
    }, [settings.noteColors, settings.noteSystem]);

    // Manipula quando uma nota MIDI é desativada (Note Off)
    const handleNoteOff = useCallback((noteNumber: number) => {
        const anglicanNoteName = NOTE_NAME_SYSTEMS.anglican.all[noteNumber % 12];
        const naturalNote = anglicanNoteName.replace('#', '');
        const naturalNoteToDisplay = NOTE_NAME_SYSTEMS[settings.noteSystem].natural.find(
             (n, i) => NOTE_NAME_SYSTEMS.anglican.natural[i] === naturalNote
        ) || naturalNote;

        const currentCount = pressedNaturalNotesRef.current.get(naturalNoteToDisplay) || 0;
        if (currentCount <= 1) {
            pressedNaturalNotesRef.current.delete(naturalNoteToDisplay);
            setActiveNotes(prev => {
                const newActiveNotes = new Map(prev);
                newActiveNotes.delete(naturalNoteToDisplay);
                return newActiveNotes;
            });
        } else {
            pressedNaturalNotesRef.current.set(naturalNoteToDisplay, currentCount - 1);
        }
    }, [settings.noteSystem]);

    // Manipula mudanças em knobs ou controles MIDI
    const handleControlChange = useCallback((controllerNumber: number, value: number) => {
        setKnobValues(prev => ({ ...prev, [controllerNumber]: value }));
        
        if (controllerNumber === AKAI_MPK_MINI_KNOBS['K1']) {
            const minScale = 1.1;
            const maxScaleAmount = 5.0;
            const newScale = minScale + (value / 127) * (maxScaleAmount - minScale);
            setMaxScale(newScale);
        } else if (controllerNumber === AKAI_MPK_MINI_KNOBS['K6']) {
            const minMultiplier = 0.5;
            const maxMultiplier = 2.0;
            const newMultiplier = minMultiplier + (value / 127) * (maxMultiplier - minMultiplier);
            setFontSizeMultiplier(newMultiplier);
        }
    }, []);
    
    // Ouve os eventos do dispositivo MIDI selecionado
    useEffect(() => {
        if (!midiAccess || !selectedInputId || isSimulationMode || isKeyboardMode) return;

        const selectedInput = midiAccess.inputs.get(selectedInputId);
        setIsAkaiConnected(selectedInput?.name?.toLowerCase().includes('akai mpk mini') ?? false);
        
        const cleanup = listenToMidiDevice(
            selectedInputId,
            midiAccess,
            handleNoteOn,
            handleNoteOff,
            handleControlChange
        );

        return cleanup;
    }, [midiAccess, selectedInputId, handleNoteOn, handleNoteOff, handleControlChange, isSimulationMode, isKeyboardMode]);
    
    // Modo simulação para testes sem teclado físico conectado
    useEffect(() => {
        if (!isSimulationMode || isKeyboardMode) return;
        const simulationInterval = setInterval(() => {
            const randomNoteNumber = Math.floor(Math.random() * 61) + 36;
            const randomVelocity = Math.floor(Math.random() * 88) + 40;
            handleNoteOn(randomNoteNumber, randomVelocity);
            setTimeout(() => handleNoteOff(randomNoteNumber), 500);
        }, 2000);
        return () => clearInterval(simulationInterval);
    }, [isSimulationMode, isKeyboardMode, handleNoteOn, handleNoteOff]);

    // Modo teclado do computador: A W S E D F T G Y H U J K tocam as notas.
    // Escuta a janela principal e, se aberta, também a janela de projeção.
    useEffect(() => {
        if (!isKeyboardMode) return;
        const handlers = {
            onNoteOn: ({ midi, velocity }: { midi: number; velocity: number }) => handleNoteOn(midi, velocity),
            onNoteOff: ({ midi }: { midi: number }) => handleNoteOff(midi),
        };
        const cleanups = [attachKeyboard(window, handlers)];
        const projWin = projectionWindowRef.current;
        if (projWin && !projWin.closed) cleanups.push(attachKeyboard(projWin, handlers));
        return () => cleanups.forEach((fn) => fn());
    }, [isKeyboardMode, handleNoteOn, handleNoteOff, projectionContainer]);

    // Atalhos do painel de controle: A abre/fecha, ESC fecha.
    // A tecla A não é usada pelo mapeamento de notas, então vale nos dois modos.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
            if (isTypingTarget(e.target)) return;
            if (e.code === 'KeyA') {
                e.preventDefault();
                setIsControlPanelVisible(prev => !prev);
            } else if (e.key === 'Escape') {
                setIsControlPanelVisible(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Ao trocar de modo, limpa notas que possam ter ficado acesas.
    useEffect(() => {
        setActiveNotes(new Map());
        pressedNaturalNotesRef.current.clear();
    }, [isKeyboardMode]);

    // Calcula colisões e efeito de empurrão entre as notas na tela
    useEffect(() => {
        if (activeNotes.size === 0) {
            setNoteOffsets(new Map());
            return;
        }

        const newOffsets = new Map<number, { x: number; y: number }>();
        const activeNoteElements: { id: number; rect: DOMRect }[] = [];

        visualNotes.forEach(vNote => {
            if (activeNotes.has(vNote.text)) {
                const el = noteRefs.current.get(vNote.id);
                if (el) {
                    activeNoteElements.push({ id: vNote.id, rect: el.getBoundingClientRect() });
                }
            }
        });

        if (activeNoteElements.length === 0) return;

        visualNotes.forEach(noteB => {
            const elB = noteRefs.current.get(noteB.id);
            if (!elB) return;

            const rectB = elB.getBoundingClientRect();
            const centerB = { x: rectB.left + rectB.width / 2, y: rectB.top + rectB.height / 2 };
            let totalPush = { x: 0, y: 0 };

            activeNoteElements.forEach(noteA => {
                if (noteA.id === noteB.id) return;

                const rectA = noteA.rect;
                const centerA = { x: rectA.left + rectA.width / 2, y: rectA.top + rectA.height / 2 };

                const dx = centerB.x - centerA.x;
                const dy = centerB.y - centerA.y;
                const distance = Math.hypot(dx, dy);

                const radiusA = (rectA.width + rectA.height) / 4;
                const radiusB = (rectB.width + rectB.height) / 4;
                const combinedRadius = radiusA + radiusB;
                
                const overlap = combinedRadius - distance;

                if (overlap > 0) {
                    const pushFactor = overlap * 1.5;
                    if (distance > 0) {
                        totalPush.x += (dx / distance) * pushFactor;
                        totalPush.y += (dy / distance) * pushFactor;
                    } else {
                        const randomAngle = Math.random() * 2 * Math.PI;
                        totalPush.x += Math.cos(randomAngle) * pushFactor;
                        totalPush.y += Math.sin(randomAngle) * pushFactor;
                    }
                }
            });
            
            if (totalPush.x !== 0 || totalPush.y !== 0) {
                 newOffsets.set(noteB.id, totalPush);
            }
        });

        setNoteOffsets(newOffsets);

    }, [activeNotes, visualNotes]);

    // Tema da moldura comum (barra, faixa, botão e gaveta)
    useTemaUi(settings.tema);

    // Status do teclado na barra do topo (antes era um aviso amarelo, em inglês)
    useEffect(() => {
        if (isKeyboardMode) {
            publicarStatus('typographic', { texto: 'Teclado do computador', estado: 'ok' });
        } else if (isSimulationMode) {
            publicarStatus('typographic', {
                texto: midiSupportError ? 'Demonstração: nenhum MIDI detectado' : 'Modo demonstração',
                estado: 'aviso',
            });
        } else {
            const aparelho = inputs.find(i => i.id === selectedInputId);
            publicarStatus('typographic', aparelho
                ? { texto: `Conectado: ${aparelho.name}`, estado: 'ok' }
                : { texto: 'Nenhum dispositivo MIDI detectado', estado: 'aviso' });
        }
    }, [isKeyboardMode, isSimulationMode, midiSupportError, inputs, selectedInputId]);

    const handleDeviceChange = (id: string) => {
        setSelectedInputId(id);
        setActiveNotes(new Map());
        pressedNaturalNotesRef.current.clear();
    };

    const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleFontSizeMultiplierChange = (value: number) => {
        setFontSizeMultiplier(value);
    };
    
    const handleToggleSimulationMode = (enabled: boolean) => {
        setIsSimulationMode(enabled);
    };

    // Abre uma nova janela para projeção em tela externa
    // Abre (ou traz para frente) a janela de projeção para o telão
    const handleOpenProjection = () => {
        if (projectionWindowRef.current && !projectionWindowRef.current.closed) {
            projectionWindowRef.current.focus();
            return;
        }
        const proj = openProjectionWindow('Piano Tipográfico: projeção', () => {
            setProjectionContainer(null);
            projectionWindowRef.current = null;
            projectionRef.current = null;
        });
        if (!proj) return;
        projectionRef.current = proj;
        projectionWindowRef.current = proj.win;
        setProjectionContainer(proj.container);
    };

    // Ao sair do Piano Tipográfico, fecha a projeção dele (antes sobrava uma
    // janela vazia no telão).
    useEffect(() => () => { projectionRef.current?.close(); }, []);

    return (
        <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
            {/* Palco na janela principal: abaixo da barra e da faixa do topo */}
            {!projectionContainer && (
                <div className="ui-palco">
                    <ProjectionScreen 
                        visualNotes={visualNotes} 
                        activeNotes={activeNotes} 
                        settings={settings}
                        maxScaleAmount={maxScale}
                        noteRefs={noteRefs}
                        noteOffsets={noteOffsets}
                    />
                </div>
            )}

            {projectionContainer && ReactDOM.createPortal(
                 <ProjectionScreen 
                    visualNotes={visualNotes} 
                    activeNotes={activeNotes} 
                    settings={settings}
                    maxScaleAmount={maxScale}
                    noteRefs={noteRefs}
                    noteOffsets={noteOffsets}
                />,
                projectionContainer
            )}
            
            {/* Acesso às configurações, no canto esquerdo da barra como nos outros jogos */}
            <BotaoConfig onClick={() => setIsControlPanelVisible(prev => !prev)} />

            {isControlPanelVisible && (
                <ControlPanel
                    inputs={inputs}
                    selectedInputId={selectedInputId}
                    onDeviceChange={handleDeviceChange}
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    isAkaiConnected={isAkaiConnected}
                    knobValues={knobValues}
                    onClose={() => setIsControlPanelVisible(false)}
                    isSimulationMode={isSimulationMode}
                    onToggleSimulationMode={handleToggleSimulationMode}
                    onOpenProjection={handleOpenProjection}
                    isProjectionOpen={!!projectionContainer}
                    fontSizeMultiplier={fontSizeMultiplier}
                    onFontSizeMultiplierChange={handleFontSizeMultiplierChange}
                    isKeyboardMode={isKeyboardMode}
                />
            )}
        </div>
    );
};

export default App;
