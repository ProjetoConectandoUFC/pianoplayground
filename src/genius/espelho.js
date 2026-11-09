// Espelho do Genius para a janela de projeção (telão).
//
// Os pianos desenham a projeção com uma segunda cópia do React. O Genius é
// montado direto no DOM (renderer.js mexe nos elementos por id), então aqui a
// projeção é um ESPELHO: uma cópia da árvore do .genius-root que acompanha
// cada mudança da original (MutationObserver), aplicando só a diferença:
//   - atributo mudou (classe, style, variáveis CSS) → copia o atributo;
//   - texto mudou → copia o texto;
//   - nó entrou/saiu (teclas acesas, partículas, tomates, confete) → clona ou
//     remove só aquele nó.
// Como só o que mudou é tocado, as animações CSS da cópia correm normalmente
// (um tomate voando não recomeça a cada tecla apertada).
//
// Cliques em botões da projeção (ex.: "Tentar a mesma música" no cartão) são
// repassados ao botão original.

export function criarEspelho(origem, destinoDoc, container) {
  const mapa = new WeakMap();    // original → cópia
  const inverso = new WeakMap(); // cópia → original

  function clonar(no) {
    const copia = destinoDoc.importNode(no, false);
    mapa.set(no, copia);
    inverso.set(copia, no);
    for (let filho = no.firstChild; filho; filho = filho.nextSibling) {
      copia.appendChild(clonar(filho));
    }
    return copia;
  }

  container.appendChild(clonar(origem));

  function aplicar(registros) {
    for (const r of registros) {
      if (r.type === 'attributes') {
        const copia = mapa.get(r.target);
        if (!copia || !copia.setAttribute) continue;
        const valor = r.target.getAttribute(r.attributeName);
        if (valor === null) copia.removeAttribute(r.attributeName);
        else if (copia.getAttribute(r.attributeName) !== valor) copia.setAttribute(r.attributeName, valor);
      } else if (r.type === 'characterData') {
        const copia = mapa.get(r.target);
        if (copia && copia.data !== r.target.data) copia.data = r.target.data;
      } else if (r.type === 'childList') {
        const paiCopia = mapa.get(r.target);
        for (const no of r.removedNodes) {
          const copia = mapa.get(no);
          // Só remove se a cópia ainda está sob este pai (o nó pode ter
          // voltado para outro lugar depois)
          if (copia && copia.parentNode === paiCopia && no.parentNode !== r.target) copia.remove();
        }
        if (!paiCopia) continue;
        for (const no of r.addedNodes) {
          if (no.parentNode !== r.target) continue; // já saiu de novo
          const existente = mapa.get(no);
          if (existente && existente.parentNode === paiCopia) continue; // já veio num clone
          const copia = clonar(no);
          let ref = no.nextSibling;
          while (ref && !(mapa.get(ref) && mapa.get(ref).parentNode === paiCopia)) ref = ref.nextSibling;
          paiCopia.insertBefore(copia, ref ? mapa.get(ref) : null);
        }
      }
    }
  }

  const observador = new MutationObserver(aplicar);
  observador.observe(origem, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });

  // Clique num botão da projeção = clique no botão original
  function onClick(e) {
    let n = e.target;
    while (n && n !== container) {
      const original = inverso.get(n);
      if (original && original.tagName === 'BUTTON') {
        if (!original.disabled) original.click();
        return;
      }
      n = n.parentNode;
    }
  }
  container.addEventListener('click', onClick);

  return {
    desligar() {
      observador.disconnect();
      container.removeEventListener('click', onClick);
    },
  };
}
