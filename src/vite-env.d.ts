/// <reference types="vite/client" />

/** Eixos das fontes variáveis de public/fontes, lidos no build (vite-eixos-fontes.ts) */
declare module 'virtual:eixos-fontes' {
    const eixos: Record<string, { tag: string; min: number; padrao: number; max: number }[]>;
    export default eixos;
}
