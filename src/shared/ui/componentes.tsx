// Peças da moldura comum, usadas pelo Piano Tipográfico e pelo Piano Gelatina
// (o Genius usa as mesmas classes no markup dele). Estilo em ui.css.

import React from 'react';
import ReactDOM from 'react-dom';
import { KEY_MAPPINGS } from '../keyboardInput';
import { setInputMode } from '../inputMode';
import { useInputMode } from '../useInputMode';
import type { TemaUi } from './temaUi';
import { JOGOS, escolherJogo, useJogoAtual } from './jogoAtual';

// ---------- Ícones (traço, cor do texto) ----------

export const IconeAjustes: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
        <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
    </svg>
);

export const IconeFechar: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

export const IconeJanela: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
);

// ---------- Botão de configurações ----------

/** Fica no canto direito da barra, no mesmo lugar nos três jogos. A tecla A também abre
 *  (inclusive com a janela de projeção em foco). */
export const BotaoConfig: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="ui-config fixo">
        <button
            className="ui-btn-config"
            onClick={(e) => { onClick(); e.currentTarget.blur(); }}
            aria-label="Configurações (tecla A)"
            title="Configurações (A)"
        >
            <IconeAjustes />
        </button>
    </div>
);

// ---------- Botões de sorteio (Piano Gelatina) ----------

export const IconeFonteAleatoria: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 18l4.5-12L12 18M4.6 14h5.8" />
        <path d="M15 8h4l-2-2M19 8l-2 2M21 16h-4l2 2M17 16l2-2" />
    </svg>
);

export const IconeCoresAleatorias: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-1 2-2 0-1.4-1.2-1.6-1.2-2.8 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.3 17 3 12 3z" />
        <circle cx="7.5" cy="11" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="10" cy="7" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none" />
    </svg>
);

/** Botões redondos da barra, à esquerda do botão de configurações */
export const BotoesSorteio: React.FC<{ onFonte: () => void; onCores: () => void }> = ({ onFonte, onCores }) => (
    <div className="ui-sorteio fixo">
        <button className="ui-btn-config" onClick={(e) => { onFonte(); e.currentTarget.blur(); }}
            aria-label="Sortear fonte" title="Sortear fonte">
            <IconeFonteAleatoria />
        </button>
        <button className="ui-btn-config" onClick={(e) => { onCores(); e.currentTarget.blur(); }}
            aria-label="Sortear cores" title="Sortear cores">
            <IconeCoresAleatorias />
        </button>
    </div>
);

// ---------- Jogo e modo de entrada (primeira seção da gaveta, nos três jogos) ----------

/** Troca de jogo e escolhe entre MIDI e teclado do computador. Antes ficava na barra do topo. */
export const SecaoJogo: React.FC = () => {
    const jogo = useJogoAtual();
    const modo = useInputMode();
    return (
        <section className="ui-secao">
            <h3 className="ui-secao-titulo">Jogo e entrada</h3>
            <div className="ui-jogos" role="radiogroup" aria-label="Jogo">
                {JOGOS.map((j) => (
                    <button
                        key={j.id}
                        role="radio"
                        aria-checked={j.id === jogo}
                        className={j.id === jogo ? 'ui-jogo on' : 'ui-jogo'}
                        onClick={(e) => { e.currentTarget.blur(); escolherJogo(j.id); }}
                    >
                        <span className="ui-ponto-jogo" data-jogo={j.id} />
                        <span className="ui-jogo-texto">
                            <span className="ui-jogo-rotulo">{j.rotulo}</span>
                            <span className="ui-jogo-dica">{j.dica}</span>
                        </span>
                    </button>
                ))}
            </div>
            <div>
                <span className="ui-rotulo">Tocar com</span>
                <div className="ui-segmentado" role="group" aria-label="Modo de entrada">
                    <button
                        className={modo === 'midi' ? 'ui-segmentado-opcao on' : 'ui-segmentado-opcao'}
                        aria-pressed={modo === 'midi'}
                        onClick={(e) => { e.currentTarget.blur(); setInputMode('midi'); }}
                        title="Teclado MIDI (MPK Mini)"
                    >
                        MIDI
                    </button>
                    <button
                        className={modo === 'keyboard' ? 'ui-segmentado-opcao on' : 'ui-segmentado-opcao'}
                        aria-pressed={modo === 'keyboard'}
                        onClick={(e) => { e.currentTarget.blur(); setInputMode('keyboard'); }}
                        title="Teclado do computador (Q a U e Z a M)"
                    >
                        Teclado
                    </button>
                </div>
            </div>
            <p className="ui-dica">Vale para os três jogos.</p>
        </section>
    );
};

// ---------- Gaveta ----------

interface GavetaProps {
    /** Nome do jogo, mostrado abaixo do título */
    jogo: string;
    onClose: () => void;
    children: React.ReactNode;
}

/** Gaveta de configurações, abre pela direita. Vai direto para o <body> para ficar acima da barra
 *  e da faixa do topo; clicar fora fecha. */
export const Gaveta: React.FC<GavetaProps> = ({ jogo, onClose, children }) => ReactDOM.createPortal(
    <>
        <button className="ui-gaveta-fundo" aria-label="Fechar configurações" tabIndex={-1} onClick={onClose} />
        <aside className="ui-gaveta" role="dialog" aria-label="Configurações">
            <div className="ui-gaveta-cabeca">
                <div>
                    <h2 className="ui-gaveta-titulo">Configurações</h2>
                    <p className="ui-gaveta-sub">{jogo} · tecla A abre e fecha</p>
                </div>
                <button className="ui-btn-fechar" onClick={onClose} aria-label="Fechar">
                    <IconeFechar />
                </button>
            </div>
            <SecaoJogo />
            {children}
        </aside>
    </>,
    document.body,
);

export const Secao: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
    <section className="ui-secao">
        <h3 className="ui-secao-titulo">{titulo}</h3>
        {children}
    </section>
);

export const Campo: React.FC<{ rotulo: string; htmlFor?: string; children: React.ReactNode }> = ({ rotulo, htmlFor, children }) => (
    <div>
        <label className="ui-rotulo" htmlFor={htmlFor}>{rotulo}</label>
        {children}
    </div>
);

export const Dica: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="ui-dica">{children}</p>;

export const Interruptor: React.FC<{ rotulo: string; dica?: string; ligado: boolean; onChange: (v: boolean) => void }> =
({ rotulo, dica, ligado, onChange }) => (
    <div className="ui-interruptor-linha">
        <div className="ui-interruptor-texto">
            <span className="ui-interruptor-rotulo">{rotulo}</span>
            {dica && <span className="ui-dica">{dica}</span>}
        </div>
        <button
            className="ui-interruptor"
            role="switch"
            aria-checked={ligado}
            aria-label={rotulo}
            onClick={() => onChange(!ligado)}
        />
    </div>
);

export const Deslizante: React.FC<{
    id: string; rotulo: string; valor: number; min: number; max: number; passo: number;
    formato: (v: number) => string; onChange: (v: number) => void;
    /** Opcional: valores marcados embaixo da trilha, igualmente espaçados (de min a max).
     *  Útil quando o deslizante só aceita poucas posições, para mostrar quais são. */
    marcas?: number[];
    /** Texto de cada marca; sem ele, usa o mesmo formato do valor. Com muitas marcas,
     *  um texto mais curto (só o número) evita que elas se encostem. */
    rotuloMarca?: (v: number) => string;
}> = ({ id, rotulo, valor, min, max, passo, formato, onChange, marcas, rotuloMarca }) => (
    <div>
        <div className="ui-linha">
            <label className="ui-rotulo" htmlFor={id}>{rotulo}</label>
            <span className="ui-valor">{formato(valor)}</span>
        </div>
        <input
            id={id}
            className="ui-range"
            type="range"
            min={min}
            max={max}
            step={passo}
            value={valor}
            onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        {marcas && (
            <div className="ui-range-marcas" aria-hidden="true">
                {marcas.map((m) => (
                    <span key={m} className={m === valor ? 'on' : undefined}>{(rotuloMarca ?? formato)(m)}</span>
                ))}
            </div>
        )}
    </div>
);

export const SeletorTema: React.FC<{ valor: TemaUi; onChange: (t: TemaUi) => void }> = ({ valor, onChange }) => (
    <div>
        <span className="ui-rotulo">Tema</span>
        <div className="ui-segmentado" role="group" aria-label="Tema">
            {(['claro', 'escuro'] as TemaUi[]).map((t) => (
                <button
                    key={t}
                    className={valor === t ? 'ui-segmentado-opcao on' : 'ui-segmentado-opcao'}
                    aria-pressed={valor === t}
                    onClick={() => onChange(t)}
                >
                    {t === 'claro' ? 'Claro' : 'Escuro'}
                </button>
            ))}
        </div>
    </div>
);

export const BotaoProjecao: React.FC<{ aberta: boolean; onClick: () => void }> = ({ aberta, onClick }) => (
    <>
        <button className="ui-btn-principal" onClick={onClick}>
            <IconeJanela />
            {aberta ? 'Focar a janela de projeção' : 'Abrir projeção em outra janela'}
        </button>
        <Dica>
            A projeção mostra só o palco, sem a barra e sem a marca. Duplo clique nela
            (ou F11 no app de computador) liga a tela cheia. Com a projeção em foco, a
            tecla A abre e fecha estas configurações.
        </Dica>
    </>
);

// ---------- Teclado do computador ----------

const NOMES_TECLAS = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];
const PRETAS = new Set([1, 3, 6, 8, 10]);
const OITAVAS = [
    { titulo: '1ª oitava', teclas: KEY_MAPPINGS.filter((k) => k.offset < 12) },
    { titulo: '2ª oitava', teclas: KEY_MAPPINGS.filter((k) => k.offset >= 12) },
];

export const MapaTeclas: React.FC = () => (
    <>
        {OITAVAS.map((o) => (
            <div key={o.titulo}>
                <h4 className="ui-subtitulo">{o.titulo}</h4>
                <div className="ui-mapa">
                    {o.teclas.map((k) => (
                        <div key={k.code} className={PRETAS.has(k.offset % 12) ? 'ui-tecla preta' : 'ui-tecla'}>
                            <span className="ui-tecla-letra">{k.label}</span>
                            <span className="ui-tecla-nota">{NOMES_TECLAS[k.offset % 12]}</span>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </>
);

// ---------- Controlador (knobs) ----------

export const MedidorKnob: React.FC<{ nome: string; valor?: number; funcao?: string }> = ({ nome, valor = 0, funcao }) => (
    <div>
        <div className="ui-knob-linha">
            <span>
                <span className="ui-mono">{nome}</span>
                {' · '}
                <span className={funcao ? undefined : 'ui-knob-livre'}>{funcao || 'livre'}</span>
            </span>
            <span className="ui-valor">{valor}</span>
        </div>
        <div className="ui-knob-trilho">
            <div className="ui-knob-valor" style={{ width: `${(valor / 127) * 100}%` }} />
        </div>
    </div>
);
