// Peças da moldura comum, usadas pelo Piano Tipográfico e pelo Piano Gelatina
// (o Genius usa as mesmas classes no markup dele). Estilo em ui.css.

import React from 'react';
import ReactDOM from 'react-dom';
import { KEY_MAPPINGS } from '../keyboardInput';
import type { TemaUi } from './temaUi';

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

/** Fica no canto direito da barra, no mesmo lugar nos três jogos, com o atalho ao lado. */
export const BotaoConfig: React.FC<{ onClick: () => void; atalho?: string }> = ({ onClick, atalho = 'A' }) => (
    <div className="ui-config fixo">
        <span className="ui-atalho" aria-hidden="true">{atalho}</span>
        <button
            className="ui-btn-config"
            onClick={(e) => { onClick(); e.currentTarget.blur(); }}
            aria-label={`Configurações (tecla ${atalho})`}
            title={`Configurações (${atalho})`}
        >
            <IconeAjustes />
        </button>
    </div>
);

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
}> = ({ id, rotulo, valor, min, max, passo, formato, onChange }) => (
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
            (ou F11 no app de computador) liga a tela cheia.
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
