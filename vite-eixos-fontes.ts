// Plugin do Vite que lê, na hora do build (e no modo dev), os eixos de cada
// fonte variável em public/fontes e entrega a tabela ao app pelo módulo
// virtual "virtual:eixos-fontes". Assim qualquer fonte variável colocada na
// pasta ganha o efeito automático do Piano Gelatina (efeito 'auto'), sem
// precisar conhecer os eixos de antemão, e tudo continua funcionando sem
// internet: a tabela vai embutida no código do app.
//
// Lê .woff2 (descompactando com o brotli do próprio Node), .woff, .ttf e .otf.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { Plugin } from 'vite';

export interface EixoFonte {
    tag: string;
    min: number;
    padrao: number;
    max: number;
}

const ID_VIRTUAL = 'virtual:eixos-fontes';
const ID_RESOLVIDO = '\0' + ID_VIRTUAL;

// Tabelas conhecidas do WOFF2 (índice → etiqueta), especificação W3C
const TAGS_WOFF2 = [
    'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep',
    'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE',
    'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt',
    'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar',
    'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill',
];

const fixo = (b: Buffer, o: number) => b.readInt32BE(o) / 65536;

/** Lê os eixos de uma tabela fvar */
function lerFvar(t: Buffer): EixoFonte[] {
    const inicio = t.readUInt16BE(4);
    const qtd = t.readUInt16BE(8);
    const tam = t.readUInt16BE(10);
    const eixos: EixoFonte[] = [];
    for (let i = 0; i < qtd; i++) {
        const o = inicio + i * tam;
        eixos.push({
            tag: t.toString('latin1', o, o + 4),
            min: fixo(t, o + 4),
            padrao: fixo(t, o + 8),
            max: fixo(t, o + 12),
        });
    }
    return eixos;
}

function lerBase128(b: Buffer, pos: { o: number }): number {
    let v = 0;
    for (let i = 0; i < 5; i++) {
        const byte = b[pos.o++];
        v = v * 128 + (byte & 0x7f);
        if (!(byte & 0x80)) return v;
    }
    throw new Error('UIntBase128 inválido');
}

function fvarWoff2(b: Buffer): Buffer | null {
    const numTabelas = b.readUInt16BE(12);
    const compactado = b.readUInt32BE(20);
    const pos = { o: 48 };
    const tabelas: { tag: string; tam: number }[] = [];
    for (let i = 0; i < numTabelas; i++) {
        const flags = b[pos.o++];
        let tag: string;
        if ((flags & 0x3f) === 0x3f) { tag = b.toString('latin1', pos.o, pos.o + 4); pos.o += 4; }
        else tag = TAGS_WOFF2[flags & 0x3f];
        const versao = (flags >> 6) & 3;
        const original = lerBase128(b, pos);
        const transformada = (tag === 'glyf' || tag === 'loca') ? versao === 0 : versao !== 0;
        const tam = transformada ? lerBase128(b, pos) : original;
        tabelas.push({ tag, tam });
    }
    const dados = zlib.brotliDecompressSync(b.subarray(pos.o, pos.o + compactado));
    let o = 0;
    for (const t of tabelas) {
        if (t.tag === 'fvar') return dados.subarray(o, o + t.tam);
        o += t.tam;
    }
    return null;
}

function fvarWoff1(b: Buffer): Buffer | null {
    const numTabelas = b.readUInt16BE(12);
    for (let i = 0; i < numTabelas; i++) {
        const o = 44 + i * 20;
        if (b.toString('latin1', o, o + 4) !== 'fvar') continue;
        const inicio = b.readUInt32BE(o + 4);
        const compLen = b.readUInt32BE(o + 8);
        const origLen = b.readUInt32BE(o + 12);
        const bruto = b.subarray(inicio, inicio + compLen);
        return compLen < origLen ? zlib.inflateSync(bruto) : bruto;
    }
    return null;
}

function fvarSfnt(b: Buffer): Buffer | null {
    const numTabelas = b.readUInt16BE(4);
    for (let i = 0; i < numTabelas; i++) {
        const o = 12 + i * 16;
        if (b.toString('latin1', o, o + 4) !== 'fvar') continue;
        const inicio = b.readUInt32BE(o + 8);
        return b.subarray(inicio, inicio + b.readUInt32BE(o + 12));
    }
    return null;
}

/** Eixos de um arquivo de fonte (lista vazia se não for variável ou não der para ler) */
export function eixosDoArquivo(arquivo: string): EixoFonte[] {
    try {
        const b = fs.readFileSync(arquivo);
        const assinatura = b.toString('latin1', 0, 4);
        const fvar = assinatura === 'wOF2' ? fvarWoff2(b)
            : assinatura === 'wOFF' ? fvarWoff1(b)
            : fvarSfnt(b);
        return fvar ? lerFvar(fvar) : [];
    } catch {
        return [];
    }
}

export function eixosFontes(pasta = 'public/fontes'): Plugin {
    let raiz = process.cwd();
    const tabela = () => {
        const dir = path.resolve(raiz, pasta);
        const saida: Record<string, EixoFonte[]> = {};
        if (!fs.existsSync(dir)) return saida;
        for (const nome of fs.readdirSync(dir)) {
            if (!/\.(woff2?|ttf|otf)$/i.test(nome)) continue;
            const eixos = eixosDoArquivo(path.join(dir, nome));
            if (eixos.length) saida[nome] = eixos;
        }
        return saida;
    };
    return {
        name: 'eixos-fontes',
        configResolved(c) { raiz = c.root; },
        resolveId(id) { return id === ID_VIRTUAL ? ID_RESOLVIDO : null; },
        load(id) {
            if (id !== ID_RESOLVIDO) return null;
            return `export default ${JSON.stringify(tabela())};`;
        },
        // No modo dev, uma fonte nova (ou apagada) na pasta recarrega a tabela
        configureServer(server) {
            const dir = path.resolve(raiz, pasta);
            server.watcher.add(dir);
            const recarregar = (f: string) => {
                if (!f.startsWith(dir)) return;
                const mod = server.moduleGraph.getModuleById(ID_RESOLVIDO);
                if (mod) server.moduleGraph.invalidateModule(mod);
                server.ws.send({ type: 'full-reload' });
            };
            server.watcher.on('add', recarregar);
            server.watcher.on('unlink', recarregar);
        },
    };
}
