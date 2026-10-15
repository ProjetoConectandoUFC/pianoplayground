import React, { useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { NOTE_NAME_SYSTEMS, NOTE_RELATIONS, THEMES, eixosDaFonte, fontOf, fontSpecOf, fontStackOf } from '../constants';
import { createGelatina, Gelatina, GelatinaOptions } from '../services/gelatinaEngine';

interface ProjectionScreenProps {
    settings: AppSettings;
    /** Registra o motor recém-criado, para que o App possa mandar notas para ele */
    onEngine: (engine: Gelatina | null) => void;
}

/** Traduz as configurações da aplicação para as opções que o motor entende */
export const optionsFromSettings = (settings: AppSettings): GelatinaOptions => {
    const tema = THEMES[settings.theme];
    return {
        labels: NOTE_NAME_SYSTEMS[settings.noteSystem].natural,
        colors: settings.noteColors,
        sharpColor: settings.sharpColor,
        ground: tema.ground,
        ink: tema.ink,
        wash: tema.wash,
        // efeito 'estilos': mede pelo estilo mais forte (o mais largo), para a palavra
        // tocada caber na tela; em repouso ela só fica com um pouco mais de folga
        fontSpec: fontOf(settings.fontKey).estilos
            ? `${fontOf(settings.fontKey).weight} 100px "${fontOf(settings.fontKey).estilos!.familias.slice(-1)[0]}", ${fontStackOf(settings.fontKey)}`
            : fontSpecOf(settings.fontKey),
        family: fontStackOf(settings.fontKey),
        weight: fontOf(settings.fontKey).weight,
        effect: fontOf(settings.fontKey).effect ?? null,
        axes: eixosDaFonte(settings.fontKey),
        estilos: fontOf(settings.fontKey).estilos,
        acento: fontOf(settings.fontKey).acento ?? null,
        eixosToque: fontOf(settings.fontKey).eixosToque,
        noteSystem: settings.noteSystem,
        density: settings.noteDensity,
        spacing: settings.noteSpacing,
        randomness: settings.noteRandomness,
        grow: settings.growAmount,
    };
};

/**
 * Tela das notas elásticas. É um elemento que ocupa todo o espaço do pai;
 * o motor da gelatina cria dentro dele uma letra de texto para cada letra
 * das notas. O React só entrega as configurações: a animação roda fora do
 * ciclo de renderização, por conta do motor.
 */
export const ProjectionScreen: React.FC<ProjectionScreenProps> = ({ settings, onEngine }) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const engineRef = useRef<Gelatina | null>(null);
    const tema = THEMES[settings.theme];

    // cria o motor uma vez, junto com o elemento das notas
    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const engine = createGelatina(host, optionsFromSettings(settings), NOTE_RELATIONS);
        engineRef.current = engine;
        onEngine(engine);
        return () => {
            onEngine(null);
            engine.destroy();
            engineRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // repassa cada mudança de configuração, carregando a fonte antes
    useEffect(() => {
        const engine = engineRef.current;
        if (!engine) return;
        let vivo = true;
        const opts = optionsFromSettings(settings);
        const aplicar = () => { if (vivo) engine.update(opts); };
        const doc = hostRef.current?.ownerDocument;
        // Carrega a fonte (e, no efeito 'estilos', todos os estilos) antes de aplicar,
        // para a troca de estilo durante o toque não piscar
        const extras = (opts.estilos?.familias ?? []).concat(opts.estilos?.alternas ?? [])
            .map(f => `100px "${f}"`)
            .concat(opts.acento ? [`${opts.acento.peso} 100px "${opts.acento.familia}"`] : []);
        if (doc?.fonts?.load) Promise.all([opts.fontSpec, ...extras].map(sp => doc.fonts.load(sp)))
            .then(aplicar).catch(aplicar);
        else aplicar();
        return () => { vivo = false; };
    }, [settings]);

    return (
        <div
            className="tela-notas transition-colors duration-500"
            style={{ backgroundColor: tema.ground }}
        >
            {/* As notas não recebem cliques: tocar é só por MIDI ou pelo teclado */}
            <div
                ref={hostRef}
                className="tela-notas-palco"
                role="img"
                aria-label="Notas musicais reagindo ao teclado"
            />
        </div>
    );
};
