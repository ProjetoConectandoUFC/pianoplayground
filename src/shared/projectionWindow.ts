// Janela de projeção (telão), usada pelo Piano Tipográfico e pelo Piano Gelatina.
//
// Abre uma janela em branco, leva para ela as mesmas folhas de estilo e fontes
// da janela principal e devolve um elemento onde o React desenha (portal).
// Também cuida do que antes faltava:
//  - percebe quando a janela é fechada, mesmo que o navegador/Electron não
//    dispare "beforeunload" (verifica periodicamente);
//  - duplo clique na projeção liga e desliga a tela cheia (no Electron, F11
//    também funciona);
//  - pode ser fechada pelo app quando o piano sai de cena, para não sobrar
//    uma janela vazia no telão.

export interface ProjectionWindow {
    win: Window;
    container: HTMLElement;
    /** Fecha a janela (se ainda estiver aberta) e para a vigilância */
    close(): void;
}

export function openProjectionWindow(title: string, onClosed: () => void): ProjectionWindow | null {
    const win = window.open('', '_blank', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
    if (!win) return null;
    const doc = win.document;
    doc.title = title;

    // Folhas com endereço viram <link> (os caminhos relativos das fontes
    // continuam válidos); folhas embutidas são copiadas regra a regra.
    Array.from(document.styleSheets).forEach((sheet) => {
        try {
            if (sheet.href) {
                const link = doc.createElement('link');
                link.rel = 'stylesheet';
                link.href = sheet.href;
                doc.head.appendChild(link);
            } else {
                const style = doc.createElement('style');
                style.textContent = Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
                doc.head.appendChild(style);
            }
        } catch {
            /* folha de outro domínio: não pode ser lida */
        }
    });

    doc.body.style.margin = '0';
    doc.body.style.overflow = 'hidden';
    doc.body.style.background = '#000';

    const container = doc.createElement('div');
    container.id = 'projection-root';
    Object.assign(container.style, { position: 'fixed', inset: '0' } as CSSStyleDeclaration);
    doc.body.appendChild(container);

    // duplo clique ou F11: tela cheia (no Electron o F11 também é tratado
    // pelo processo principal; aqui cobre o navegador e serve de reserva)
    const toggleFullscreen = () => {
        if (doc.fullscreenElement) doc.exitFullscreen?.().catch(() => {});
        else doc.documentElement.requestFullscreen?.().catch(() => {});
    };
    doc.addEventListener('dblclick', toggleFullscreen);
    doc.addEventListener('keydown', (e) => {
        if (e.key === 'F11') { e.preventDefault(); toggleFullscreen(); }
    });

    let done = false;
    const finish = () => {
        if (done) return;
        done = true;
        window.clearInterval(watch);
        onClosed();
    };
    win.addEventListener('beforeunload', finish);
    win.addEventListener('pagehide', finish);
    const watch = window.setInterval(() => { if (win.closed) finish(); }, 600);

    return {
        win,
        container,
        close() {
            if (!win.closed) win.close();
            finish();
        },
    };
}
