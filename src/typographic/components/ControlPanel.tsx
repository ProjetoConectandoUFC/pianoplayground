import React from 'react';
import { AppSettings, MidiDevice, KnobValues } from '../types';
import { FONT_OPTIONS, AKAI_MPK_MINI_KNOBS, TEMAS_TIPOGRAFICO } from '../constants';
import {
    BotaoProjecao, Campo, Deslizante, Dica, Gaveta, Interruptor, MapaTeclas,
    MedidorKnob, Secao, SeletorTema,
} from '../../shared/ui/componentes';

// ==========================================
// 1. DEFINIÇÃO DE TIPOS (TypeScript)
// ==========================================
// Formato dos dados (props) que este painel de controle precisa receber para funcionar.
interface ControlPanelProps {
    inputs: MidiDevice[];                  // Lista de dispositivos MIDI conectados
    selectedInputId: string | null;        // ID do dispositivo MIDI selecionado atualmente
    onDeviceChange: (id: string) => void;  // Função chamada ao trocar de dispositivo MIDI
    settings: AppSettings;                 // Configurações visuais do app (cores, fontes, etc.)
    onSettingsChange: (newSettings: Partial<AppSettings>) => void; // Atualiza as configurações
    isAkaiConnected: boolean;              // Diz se o teclado Akai MPK Mini está conectado
    knobValues: KnobValues;                // Valores atuais dos knobs do controlador MIDI
    onClose: () => void;                   // Fecha o painel de controle
    isSimulationMode: boolean;             // Diz se o modo demonstração está ativo
    onToggleSimulationMode: (enabled: boolean) => void; // Liga/desliga o modo demonstração
    onOpenProjection: () => void;          // Abre ou foca a janela de projeção
    isProjectionOpen: boolean;             // Diz se a janela de projeção já está aberta
    fontSizeMultiplier: number;            // Multiplicador do tamanho da fonte
    onFontSizeMultiplierChange: (value: number) => void; // Altera o tamanho da fonte
    isKeyboardMode: boolean;               // Diz se o modo "teclado do computador" está ativo
}

// O que cada knob do MPK Mini controla neste jogo
const FUNCAO_KNOB: { [k: string]: string } = {
    K1: 'Escala máxima da nota',
    K6: 'Tamanho base da fonte',
};

const numero = (v: number, casas = 2) => v.toFixed(casas).replace('.', ',');

// ==========================================
// 2. PAINEL, na gaveta comum aos três jogos (src/shared/ui)
// ==========================================
// As seções seguem a mesma ordem do Gelatina: Projeção, Entrada, Aparência,
// Arranjo na tela e Controlador.
export const ControlPanel: React.FC<ControlPanelProps> = ({
    inputs,
    selectedInputId,
    onDeviceChange,
    settings,
    onSettingsChange,
    isAkaiConnected,
    knobValues,
    onClose,
    isSimulationMode,
    onToggleSimulationMode,
    onOpenProjection,
    isProjectionOpen,
    fontSizeMultiplier,
    onFontSizeMultiplierChange,
    isKeyboardMode,
}) => {
    return (
        <Gaveta jogo="Piano Tipográfico" onClose={onClose}>
            {/* SEÇÃO 1: Projeção */}
            <Secao titulo="Projeção">
                <BotaoProjecao aberta={isProjectionOpen} onClick={onOpenProjection} />
            </Secao>

            {/* SEÇÃO 2: Entrada (teclado do computador ou MIDI). O modo é
                escolhido em "Jogo e entrada", no começo desta gaveta, e vale para os três jogos. */}
            {isKeyboardMode ? (
                <Secao titulo="Entrada · teclado do computador">
                    <Dica>
                        Modo Teclado ativo: o MIDI é ignorado. Para usar um aparelho MIDI conectado,
                        escolha MIDI em "Jogo e entrada", acima.
                    </Dica>
                    <MapaTeclas />
                </Secao>
            ) : (
                <Secao titulo="Entrada · MIDI">
                    <Interruptor
                        rotulo="Demonstração"
                        dica="Toca notas sozinho, para ver o efeito sem teclado."
                        ligado={isSimulationMode}
                        onChange={onToggleSimulationMode}
                    />

                    {/* Com aparelhos MIDI e sem demonstração, mostra o seletor */}
                    {inputs.length > 0 && !isSimulationMode ? (
                        <Campo rotulo="Aparelho conectado" htmlFor="tipo-aparelho">
                            <select
                                id="tipo-aparelho"
                                className="ui-select"
                                value={selectedInputId || ''}
                                onChange={(e) => onDeviceChange(e.target.value)}
                            >
                                {inputs.map((input) => (
                                    <option key={input.id} value={input.id}>{input.name}</option>
                                ))}
                            </select>
                        </Campo>
                    ) : (
                        <Dica>
                            {isSimulationMode
                                ? 'A demonstração está ligada. Desligue para usar um aparelho MIDI conectado.'
                                : 'Nenhum aparelho MIDI encontrado. Conecte um e recarregue, ou ligue a demonstração para ver o efeito.'}
                        </Dica>
                    )}
                    <Dica>Sem teclado MIDI? Escolha Teclado em "Jogo e entrada", acima, para tocar pelo computador.</Dica>
                </Secao>
            )}

            {/* SEÇÃO 3: Aparência (tema, notas, fonte e cores) */}
            <Secao titulo="Aparência">
                <SeletorTema
                    valor={settings.tema}
                    onChange={(t) => onSettingsChange({ tema: t, ...TEMAS_TIPOGRAFICO[t] })}
                />

                <Campo rotulo="Sistema de notas" htmlFor="tipo-sistema">
                    <select
                        id="tipo-sistema"
                        className="ui-select"
                        value={settings.noteSystem}
                        onChange={(e) => onSettingsChange({ noteSystem: e.target.value as 'anglican' | 'latin' })}
                    >
                        <option value="anglican">Anglicano (C, D, E...)</option>
                        <option value="latin">Latino (Dó, Ré, Mi...)</option>
                    </select>
                </Campo>

                <Campo rotulo="Fonte" htmlFor="tipo-fonte">
                    <select
                        id="tipo-fonte"
                        className="ui-select"
                        value={settings.fontFamily}
                        onChange={(e) => onSettingsChange({ fontFamily: e.target.value })}
                    >
                        {FONT_OPTIONS.map((font) => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                        ))}
                    </select>
                </Campo>

                <Deslizante
                    id="tipo-tamanho" rotulo="Tamanho base da fonte" valor={fontSizeMultiplier}
                    min={0.5} max={2} passo={0.01}
                    formato={(v) => `${numero(v)}×`}
                    onChange={onFontSizeMultiplierChange}
                />

                <div className="ui-cor-linha">
                    <label className="ui-rotulo" htmlFor="tipo-cor-inativa" style={{ margin: 0 }}>Cor das notas inativas</label>
                    <input
                        id="tipo-cor-inativa"
                        type="color"
                        className="ui-cor curta"
                        value={settings.textColor}
                        onChange={(e) => onSettingsChange({ textColor: e.target.value })}
                    />
                </div>
                <div className="ui-cor-linha">
                    <label className="ui-rotulo" htmlFor="tipo-cor-fundo" style={{ margin: 0 }}>Cor de fundo</label>
                    <input
                        id="tipo-cor-fundo"
                        type="color"
                        className="ui-cor curta"
                        value={settings.backgroundColor}
                        onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
                    />
                </div>
                <Dica>O tema escolhe as duas cores acima; depois elas podem ser ajustadas à vontade.</Dica>
            </Secao>

            {/* SEÇÃO 4: Arranjo das notas na tela */}
            <Secao titulo="Arranjo na tela">
                <Deslizante
                    id="tipo-quantidade" rotulo="Quantidade de notas" valor={settings.noteDensity}
                    min={0.05} max={1} passo={0.05}
                    formato={(v) => `${Math.round(v * 100)}%`}
                    onChange={(v) => onSettingsChange({ noteDensity: v })}
                />
                <Deslizante
                    id="tipo-espalhamento" rotulo="Espalhamento" valor={settings.noteRandomness}
                    min={10} max={100} passo={1}
                    formato={(v) => `${Math.round(v)}%`}
                    onChange={(v) => onSettingsChange({ noteRandomness: v })}
                />
            </Secao>

            {/* SEÇÃO 5: Controlador Akai MPK Mini (só conectado e fora da demonstração) */}
            {isAkaiConnected && !isSimulationMode && !isKeyboardMode && (
                <Secao titulo="Controlador MPK Mini">
                    {Object.entries(AKAI_MPK_MINI_KNOBS).map(([nome, cc]) => (
                        <MedidorKnob key={nome} nome={nome} valor={knobValues[cc]} funcao={FUNCAO_KNOB[nome]} />
                    ))}
                </Secao>
            )}
        </Gaveta>
    );
};
