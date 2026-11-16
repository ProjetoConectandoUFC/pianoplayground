import React, { useEffect, useState } from 'react';
import { AnguloModo, AppSettings, KnobValues, MidiDevice, NoteSystem } from '../types';
import {
    AKAI_MPK_MINI_KNOBS, FONT_OPTIONS, KNOB_MAPPINGS, NOTE_NAME_SYSTEMS,
    fontOf, fontSpecOf, fontLacksAccents, FontOption,
    SOMBRA_DIFUSAO_MAX, SOMBRA_DISTANCIA_MAX, THEMES, ANGULO_NOTAS_MAX, LIMITES,
} from '../constants';
import { COPIAS_MAX } from '../services/gelatinaEngine';
import {
    BotaoProjecao, Campo, Deslizante, Dica, Gaveta, Interruptor, MapaTeclas,
    MedidorKnob, Secao, SeletorTema,
} from '../../shared/ui/componentes';


/** Marcas do deslizante de inclinação, de 5 em 5 graus (-15, -10... 15). Com ±15 são 31
 *  posições; escrever todas faria os números se encostarem. O deslizante segue travado
 *  nos inteiros. */
const MARCAS_INCLINACAO = Array.from({ length: 2 * ANGULO_NOTAS_MAX / 5 + 1 }, (_, i) => i * 5 - ANGULO_NOTAS_MAX);

/** Categorias da lista de fontes: as fontes de sempre e as mutáveis */
const GRUPOS_FONTES: { rotulo: string; filtro: (f: FontOption) => boolean }[] = [
    { rotulo: 'Fontes', filtro: f => !f.effect && !f.pixel },
    { rotulo: 'Fontes mutáveis', filtro: f => !!f.effect && !f.pixel },
    { rotulo: 'Fontes pixel (teste)', filtro: f => !!f.pixel },
];

interface ControlPanelProps {
    inputs: MidiDevice[];
    selectedInputId: string | null;
    onDeviceChange: (id: string) => void;
    settings: AppSettings;
    onSettingsChange: (newSettings: Partial<AppSettings>) => void;
    isAkaiConnected: boolean;
    knobValues: KnobValues;
    onClose: () => void;
    midiStatus: string;
    isDemoRunning: boolean;
    onToggleDemo: (on: boolean) => void;
    isSoundOn: boolean;
    onToggleSound: (on: boolean) => void;
    onOpenProjection: () => void;
    isProjectionOpen: boolean;
    onResetSettings: () => void;
    /** Modo de entrada global: true = teclado do computador, false = MIDI */
    isKeyboardMode: boolean;
}

// ==========================================
// Painel de configurações, na gaveta comum aos três jogos
// (src/shared/ui). As seções seguem a mesma ordem do Tipográfico:
// Projeção, Execução, Entrada, Aparência, Arranjo e Controlador.
// ==========================================
export const ControlPanel: React.FC<ControlPanelProps> = ({
    inputs, selectedInputId, onDeviceChange, settings, onSettingsChange,
    isAkaiConnected, knobValues, onClose, midiStatus,
    isDemoRunning, onToggleDemo, isSoundOn, onToggleSound,
    onOpenProjection, isProjectionOpen, onResetSettings, isKeyboardMode,
}) => {
    const rotulos = NOTE_NAME_SYSTEMS[settings.noteSystem].natural;

    // Marca na lista as fontes de public/fontes que não estão instaladas nem
    // disponíveis na pasta.
    const [ausentes, setAusentes] = useState<Set<string>>(new Set());
    useEffect(() => {
        let vivo = true;
        const verificar = async () => {
            const faltando = new Set<string>();
            for (const f of FONT_OPTIONS.filter(o => o.arquivo)) {
                const spec = fontSpecOf(f.key);
                try { await (document as any).fonts?.load(spec); } catch { /* ignora */ }
                const c = document.createElement('canvas').getContext('2d');
                if (!c) continue;
                const teste = 'MiWq Dó Ré Sol 0123';
                const achou = ['monospace', 'serif', 'sans-serif'].some(b => {
                    c.font = `100px ${b}`;
                    const w0 = c.measureText(teste).width;
                    c.font = `100px ${f.family}, ${b}`;
                    return Math.abs(c.measureText(teste).width - w0) > 0.5;
                });
                if (!achou) faltando.add(f.key);
            }
            if (vivo) setAusentes(faltando);
        };
        verificar();
        return () => { vivo = false; };
    }, []);

    return (
        <Gaveta jogo="Piano Gelatina" onClose={onClose}>
            <Secao titulo="Projeção">
                <BotaoProjecao aberta={isProjectionOpen} onClick={onOpenProjection} />
            </Secao>

            <Secao titulo="Execução">
                <Interruptor
                    rotulo="Demonstração"
                    dica="Toca sozinho uma sequência, para testar sem teclado."
                    ligado={isDemoRunning}
                    onChange={onToggleDemo}
                />
                <Interruptor
                    rotulo="Som"
                    dica="Emite um tom simples a cada nota tocada."
                    ligado={isSoundOn}
                    onChange={onToggleSound}
                />
            </Secao>

            {/* O modo (MIDI ou Teclado) é escolhido em "Jogo e entrada", no começo da gaveta, e vale
                para os três jogos do Piano Interativo. */}
            {isKeyboardMode ? (
                <Secao titulo="Entrada · teclado do computador">
                    <Dica>
                        Modo Teclado ativo: o MIDI é ignorado. Para usar o teclado MIDI, escolha
                        MIDI em "Jogo e entrada", acima. Segure a tecla para manter a nota.
                    </Dica>
                    <MapaTeclas />
                    <Dica>O sustenido pinta a palavra da nota natural com a cor escolhida abaixo.</Dica>
                </Secao>
            ) : (
                <Secao titulo="Entrada · MIDI">
                    <div className="ui-indicador">
                        <span className={inputs.length ? 'ui-status-ponto ok' : 'ui-status-ponto aviso'} />
                        <span>{midiStatus}</span>
                    </div>
                    {inputs.length > 0 && (
                        <Campo rotulo="Aparelho conectado" htmlFor="gel-aparelho">
                            <select
                                id="gel-aparelho"
                                className="ui-select"
                                value={selectedInputId || ''}
                                onChange={e => onDeviceChange(e.target.value)}
                            >
                                {inputs.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </Campo>
                    )}
                    <Dica>Sem teclado MIDI? Escolha Teclado em "Jogo e entrada", acima, para tocar pelo computador.</Dica>
                </Secao>
            )}

            <Secao titulo="Aparência">
                <SeletorTema valor={settings.theme} onChange={t => onSettingsChange({ theme: t })} />

                <Deslizante
                    id="gel-lacos" rotulo="Opacidade dos laços" valor={settings.lacosOpacidade}
                    min={0} max={1} passo={0.01}
                    formato={v => `${Math.round(v * 100)}%`}
                    onChange={v => onSettingsChange({ lacosOpacidade: v })}
                />
                <Dica>Os laços da marca no fundo, como na tela do Genius: brancos no tema escuro, celeste no claro. 0% os esconde.</Dica>

                {/* Sombra das letras: desligada por padrão. Os ajustes só aparecem com ela
                    ligada, para a gaveta não crescer à toa. */}
                <Interruptor
                    rotulo="Sombra"
                    dica="Uma sombra atrás das letras, na tela e no telão."
                    ligado={settings.sombraAtiva}
                    onChange={v => onSettingsChange({ sombraAtiva: v })}
                />
                {settings.sombraAtiva && (
                    <>
                        <div>
                            <span className="ui-rotulo">Cor da sombra</span>
                            <div className="ui-linha">
                                <label className="ui-cor-item">
                                    <input
                                        type="color"
                                        className="ui-cor"
                                        value={settings.sombraCor || THEMES[settings.theme].ink}
                                        onChange={e => onSettingsChange({ sombraCor: e.target.value })}
                                        aria-label="Cor da sombra"
                                    />
                                    {settings.sombraCor ? 'escolhida' : 'do tema'}
                                </label>
                                {settings.sombraCor && (
                                    <button className="ui-btn-secundario" onClick={() => onSettingsChange({ sombraCor: '' })}>
                                        Usar a cor do tema
                                    </button>
                                )}
                            </div>
                        </div>
                        <Deslizante
                            id="gel-sombra-opacidade" rotulo="Opacidade da sombra" valor={settings.sombraOpacidade}
                            min={0} max={1} passo={0.01}
                            formato={v => `${Math.round(v * 100)}%`}
                            onChange={v => onSettingsChange({ sombraOpacidade: v })}
                        />
                        <Deslizante
                            id="gel-sombra-distancia" rotulo="Distância" valor={settings.sombraDistancia}
                            min={0} max={SOMBRA_DISTANCIA_MAX} passo={0.001}
                            formato={v => `${(v * 100).toFixed(1).replace('.', ',')}% da letra`}
                            onChange={v => onSettingsChange({ sombraDistancia: v })}
                        />
                        <Deslizante
                            id="gel-sombra-difusao" rotulo="Difusão" valor={settings.sombraDifusao}
                            min={0} max={SOMBRA_DIFUSAO_MAX} passo={0.002}
                            formato={v => v === 0 ? 'chapada' : `${(v * 100).toFixed(1).replace('.', ',')}% da letra`}
                            onChange={v => onSettingsChange({ sombraDifusao: v })}
                        />
                        <Deslizante
                            id="gel-sombra-angulo" rotulo="Ângulo" valor={settings.sombraAngulo}
                            min={0} max={360} passo={5}
                            formato={v => `${Math.round(v)}°`}
                            onChange={v => onSettingsChange({ sombraAngulo: v })}
                        />
                        <Dica>
                            0° aponta para a direita e 90° para baixo. A distância e a difusão crescem
                            junto com a nota tocada. Difusão em 0 deixa a sombra chapada, como no
                            Design System Conectando.
                        </Dica>
                    </>
                )}

                <Campo rotulo="Sistema de notas" htmlFor="gel-sistema">
                    <select
                        id="gel-sistema"
                        className="ui-select"
                        value={settings.noteSystem}
                        onChange={e => onSettingsChange({ noteSystem: e.target.value as NoteSystem })}
                    >
                        <option value="latin">Latino (Dó, Ré, Mi...)</option>
                        <option value="anglican">Anglicano (C, D, E...)</option>
                    </select>
                </Campo>

                <Campo rotulo="Fonte" htmlFor="gel-fonte">
                    <select
                        id="gel-fonte"
                        className="ui-select"
                        value={settings.fontKey}
                        onChange={e => onSettingsChange({ fontKey: e.target.value })}
                    >
                        {/* Duas categorias: as fontes de sempre e as mutáveis (variáveis
                            com efeito próprio, cujos eixos mudam ao tocar) */}
                        {GRUPOS_FONTES.map(g => (
                            <optgroup key={g.rotulo} label={g.rotulo}>
                                {FONT_OPTIONS.filter(g.filtro).sort((x, y) => x.name.localeCompare(y.name)).map(f => (
                                    <option key={f.key} value={f.key}>
                                        {f.name}
                                        {f.accents === false ? (f.acento ? ' · acentos compostos' : ' · sem acentos') : ''}
                                        {ausentes.has(f.key) ? ' · não encontrada' : ''}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </Campo>
                {fontOf(settings.fontKey).effectHint && <Dica>{fontOf(settings.fontKey).effectHint}</Dica>}
                {ausentes.size > 0 && (
                    <Dica>
                        As marcadas como "não encontrada" não carregaram. Confira se os arquivos
                        estão em <code>public/fontes</code>.
                    </Dica>
                )}
                {fontLacksAccents(settings.fontKey) && settings.noteSystem === 'latin' && (
                    fontOf(settings.fontKey).acento ? (
                        <Dica>
                            Esta fonte não tem acentos: em Dó, Ré, Fá e Lá a letra continua nela e
                            o acento vem da {fontOf(settings.fontKey).acento!.familia}, escolhida no
                            acervo por combinar com o desenho.
                        </Dica>
                    ) : (
                        <Dica>
                            Esta fonte não tem acentos: em Dó, Ré, Fá e Lá a letra acentuada sai de
                            uma fonte reserva. Para um visual uniforme, use o sistema anglicano
                            (C, D, E...) ou outra fonte.
                        </Dica>
                    )
                )}

                <div>
                    <span className="ui-rotulo">Cor de cada nota</span>
                    <div className="ui-grade-cores">
                        {settings.noteColors.map((cor, i) => (
                            <label key={i} className="ui-cor-item">
                                <input
                                    type="color"
                                    className="ui-cor"
                                    value={cor}
                                    onChange={e => {
                                        const novas = settings.noteColors.slice();
                                        novas[i] = e.target.value;
                                        onSettingsChange({ noteColors: novas });
                                    }}
                                    aria-label={`Cor da nota ${rotulos[i]}`}
                                />
                                {rotulos[i]}
                            </label>
                        ))}
                        <label className="ui-cor-item">
                            <input
                                type="color"
                                className="ui-cor"
                                value={settings.sharpColor}
                                onChange={e => onSettingsChange({ sharpColor: e.target.value })}
                                aria-label="Cor do sustenido"
                            />
                            sust.
                        </label>
                    </div>
                </div>
            </Secao>

            <Secao titulo="Arranjo na tela">
                <Deslizante
                    id="gel-densidade" rotulo="Densidade" valor={settings.noteDensity}
                    min={LIMITES.densidadeMin} max={LIMITES.densidadeMax} passo={0.01}
                    formato={v => `${Math.round(v * 100)}%`}
                    onChange={v => onSettingsChange({ noteDensity: v })}
                />
                <Deslizante
                    id="gel-espaco" rotulo="Espaçamento" valor={settings.noteSpacing}
                    min={0} max={LIMITES.espacamentoMax} passo={0.002}
                    formato={v => `${(v * 100).toFixed(1).replace('.', ',')}% da tela`}
                    onChange={v => onSettingsChange({ noteSpacing: v })}
                />
                <Deslizante
                    id="gel-desalinho" rotulo="Desalinhamento" valor={settings.noteRandomness}
                    min={0} max={LIMITES.desalinhamentoMax} passo={0.02}
                    formato={v => `${Math.round(v * 100)}%`}
                    onChange={v => onSettingsChange({ noteRandomness: v })}
                />
                {/* Curva das linhas: começa reta (0). Move e gira cada palavra inteira, sem
                    mexer nas letras dela. */}
                <Deslizante
                    id="gel-curva-linhas" rotulo="Curva das linhas" valor={settings.curvaLinhas}
                    min={0} max={LIMITES.curvaMax} passo={0.02}
                    formato={v => v === 0 ? 'retas' : `${Math.round(v * 100)}%`}
                    onChange={v => onSettingsChange({ curvaLinhas: v })}
                />
                {/* Cópias das notas: poucas opções, então seletor de posições como o da inclinação.
                    Com 6 opções, o texto fica curto (2×) para caber na largura da gaveta. */}
                <div>
                    <span className="ui-rotulo">Notas na tela</span>
                    <div className="ui-segmentado" role="group" aria-label="Quantas vezes cada nota aparece na tela">
                        {Array.from({ length: COPIAS_MAX }, (_, k) => k + 1).map(c => (
                            <button
                                key={c}
                                className={settings.copiasNotas === c ? 'ui-segmentado-opcao on' : 'ui-segmentado-opcao'}
                                aria-pressed={settings.copiasNotas === c}
                                onClick={() => onSettingsChange({ copiasNotas: c })}
                            >
                                {`${c}×`}
                            </button>
                        ))}
                    </div>
                </div>
                <Dica>
                    Curva das linhas faz as notas seguirem uma onda pela tela; em 0 as linhas
                    ficam retas. Em "Notas na tela", cada nota se repete e as palavras se
                    distribuem para ocupar melhor a tela. Tocar uma nota anima todas as cópias dela.
                </Dica>
                {/* Inclinação: passo 1 trava o deslizante nos graus inteiros de -15 a 15. Começa
                    no meio (0°), que é o arranjo de sempre. As marcas, de 5 em 5, mostram só
                    o número, sem o símbolo de grau, para não se encostarem. */}
                <Deslizante
                    id="gel-inclinacao" rotulo="Inclinação das notas" valor={settings.anguloNotas}
                    min={-ANGULO_NOTAS_MAX} max={ANGULO_NOTAS_MAX} passo={1}
                    formato={v => `${v < 0 ? '−' : ''}${Math.abs(v)}°`}
                    marcas={MARCAS_INCLINACAO}
                    rotuloMarca={v => `${v < 0 ? '−' : ''}${Math.abs(v)}`}
                    onChange={v => onSettingsChange({ anguloNotas: Math.round(v) })}
                />
                {/* Duas opções só: um seletor de duas posições, no mesmo estilo do tema */}
                <div>
                    <span className="ui-rotulo">A inclinação vale para</span>
                    <div className="ui-segmentado" role="group" aria-label="Como a inclinação afeta as notas">
                        {([['todas', 'Todas iguais'], ['individual', 'Cada nota']] as [AnguloModo, string][]).map(([m, txt]) => (
                            <button
                                key={m}
                                className={settings.anguloModo === m ? 'ui-segmentado-opcao on' : 'ui-segmentado-opcao'}
                                aria-pressed={settings.anguloModo === m}
                                onClick={() => onSettingsChange({ anguloModo: m })}
                            >
                                {txt}
                            </button>
                        ))}
                    </div>
                </div>
                <Deslizante
                    id="gel-cresc" rotulo="Crescimento da nota" valor={settings.growAmount}
                    min={LIMITES.crescimentoMin} max={LIMITES.crescimentoMax} passo={0.05}
                    formato={v => `${v.toFixed(2).replace('.', ',')}×`}
                    onChange={v => onSettingsChange({ growAmount: v })}
                />
                <Dica>
                    A inclinação gira as notas no próprio centro: com valores positivos as
                    palavras sobem para a direita; com negativos, descem. Em "Cada nota", cada
                    uma ganha a sua inclinação, alternando o lado, até o ângulo escolhido. A nota tocada cresce no próprio lugar com
                    um pulo. As relacionadas a ela encolhem um pouco e as demais ficam como estão.
                </Dica>
                <button className="ui-btn-secundario" onClick={onResetSettings}>Voltar ao padrão</button>
            </Secao>

            {isAkaiConnected && !isKeyboardMode && (
                <Secao titulo="Controlador MPK Mini">
                    {Object.entries(AKAI_MPK_MINI_KNOBS).map(([nome, cc]) => (
                        <MedidorKnob key={nome} nome={nome} valor={knobValues[cc]} funcao={KNOB_MAPPINGS[nome]} />
                    ))}
                </Secao>
            )}
        </Gaveta>
    );
};
