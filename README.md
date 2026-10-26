# Piano Interativo: Genius + Tipográfico + Gelatina

Une, num único aplicativo desktop, três projetos:

- **Genius no Piano** (`genius-do-piano`): jogo de memória musical, escrito em JS vanilla.
- **Piano Tipográfico** (`piano-tipografico`): visualizador tipográfico MIDI, em React + TypeScript.
- **Piano Gelatina** (`piano-tipografico-gelatina`): projeção tipográfica do projeto Conectando,
  com as sete notas como palavras elásticas que crescem ao serem tocadas (React + canvas).

O **botão central no topo** abre uma lista para escolher entre os três. Todos usam o mesmo
teclado (AKAI MPK Mini) via Web MIDI, ou o teclado do computador (veja abaixo).

## Como funciona a junção

- Base única **Vite + React + TypeScript**, empacotada em **Electron** (.dmg / .exe).
- O Piano Tipográfico entra como componente React (`src/typographic/`).
- O Genius entra como módulos JS originais (`src/genius/`); o antigo `renderer.js` virou
  `initGenius()` + `activate()/deactivate()`. Ele é inicializado **uma única vez** e apenas
  liga/desliga os listeners globais ao ganhar/perder foco — assim não duplica os handlers
  singleton de `game.js`/`midi.js`/`debug.js`.
- O CSS do Genius foi escopado sob `.genius-root` para conviver com o Tailwind do Tipográfico.
- O `<App>` mantém o Genius sempre montado (oculto quando fora de foco) e monta/desmonta o
  Tipográfico e o Gelatina normalmente.
- O Gelatina entra em `src/gelatina/`. O motor (`services/gelatinaEngine.ts`) não depende de
  React; a estrutura CSS que ficava no `index.html` original foi para `gelatina.css`, e o logo
  é importado pelo Vite (funciona no Electron empacotado). Ao sair do modo, a janela de projeção
  dele é fechada e o som é interrompido.
- **Motor da gelatina em texto**: as letras não são mais pintadas num canvas. Cada letra é um
  elemento de texto da página, posicionado e deformado com transformações CSS a cada quadro.
  O arranjo é o mesmo de antes (lugares fixos, a nota tocada cresce e empurra as vizinhas,
  as relacionadas encolhem, nada sai da tela). O movimento das letras segue o Laboratório
  Gelatina: o toque dá um pulo na palavra (1,45 vez, ajustável), as letras achatam, esticam e
  entortam em onda e assentam em cerca de meio segundo; segurando a tecla elas tremem de leve,
  e em repouso ficam paradas. Um canvas fora da tela continua sendo usado só para medir as
  letras. Isso permite animar os eixos de fontes variáveis:
  - **Kablammo** (eixo MORF): ao tocar, cada letra troca de desenho e dança; o toque mais forte
    no MIDI aumenta o efeito.
  - **Shantell Sans** (eixos BNCE, INFM e peso): ao tocar, as letras quicam, ganham traço de mão
    e engordam.
  Nessas duas, o efeito da fonte substitui o esticar e entortar das letras.
- **Sistema anglicano (C D E F G A B)**: como cada nota é uma letra só, ele tem arranjo próprio,
  sem afetar o latino. As sete letras ganham o mesmo tamanho e a proporção original da fonte
  (antes eram esticadas para encher a linha e ficavam largas e achatadas), numa grade folgada
  de 4 + 3 letras intercaladas (3 linhas em tela em pé), e a esticada do toque alarga menos a
  letra. Os valores ficam no topo de `services/gelatinaEngine.ts`, nas constantes `ANG_*`.

## Visual do Genius do Piano (identidade Conectando)

O Genius foi redesenhado para conversar com o Piano Gelatina, sem mexer na estrutura do piano
(mesmas 25 teclas, mapa e lógica do jogo):

- Fundo na tinta `#10263F` do Design System Conectando, com padrão de ondas e os laços da marca (`src/assets/genius/laco-*.png`, com a transparência de 20% já no arquivo),
  título "Genius do Piano" no amarelo da marca `#FCE051` (Poppins 800, embutida via `@fontsource/poppins`).
- Cabeçalho na moldura comum dos três jogos (veja "Interface comum dos três jogos").
- Feedback das teclas: **amarelo claro `#FFEC8A`** (menos forte que o título) enquanto a melodia é demonstrada (memorização) e
  **azul-brilho `#3D8AD1`** com estrelas e triângulos saindo pelos lados quando o jogador acerta
  (efeito em `piano.js`, camada `.key-fx-layer`).
- Resultados, contagem e confete usam as cores do sistema, com fundo chapado (sem gradiente,
  sem brilho e sem desfoque, como pede o sistema).
- A tecla desce e muda de cor com curvas de entrada e saída (rápida ao apertar, suave ao soltar).

**Depois de atualizar o projeto, rode `npm install`** para baixar as fontes Poppins e IBM Plex Mono.

## Interface comum dos três jogos

Genius, Tipográfico e Gelatina dividem a mesma moldura (`src/shared/ui/`), sem mudar o
funcionamento nem a jogabilidade de nenhum deles. Cada jogo mantém o próprio palco.

- **Barra do topo** (`src/App.tsx`, `src/shell.css`), enxuta e mais baixa (68px): à esquerda
  a marca Conectando (azul no tema claro, creme no escuro); à direita o status da entrada e o
  botão de configurações do jogo. O status é mínimo: um ponto verde quando a entrada está
  pronta e vermelho quando não está, com o nome do modo (MIDI ou Teclado); o detalhe (aparelho,
  erro) aparece ao passar o mouse. Ele vem de `statusEntrada.ts`, publicado por cada jogo.
  A troca de jogo e o MIDI | Teclado foram para a gaveta de configurações.
- **Faixa das mãos** (`FaixaMaos.tsx`): só no Genius. No Tipográfico e no Gelatina ela sai
  para os pianos ficarem livres na tela (regras em `ui.css` e `shell.css`). Fica logo abaixo da barra, de uma borda à outra da tela
  (a altura acompanha a largura, na proporção da ilustração). As pontas dos braços foram cortadas
  retas para encostar nas bordas e parecer que continuam para fora da tela. Há uma faixa por tema:
  azul e rosa no escuro, azul-marinho e azul no claro (`src/assets/moldura/`). A proporção de
  cada imagem é medida no próprio arquivo, então o desenho nunca é esticado. Para tirar, troque
  `MOSTRAR_FAIXA` para `false`: os palcos sobem e ocupam o espaço.
- **Gaveta de configurações** (`componentes.tsx`): abre pela direita nos três jogos. A primeira
  seção, "Jogo e entrada" (`SecaoJogo`), é igual nos três: a lista dos jogos e o MIDI | Teclado.
  Depois vêm as seções de cada jogo (Projeção, Execução ou Partida, Entrada, Aparência, Arranjo
  e Controlador), tudo em português. A tecla A abre e fecha a gaveta nos três jogos e o ESC
  fecha; no Tipográfico e no Gelatina, o A também funciona com a janela de projeção em foco
  (a gaveta abre na janela principal, que vem para a frente). O jogo em cena fica em
  `src/shared/ui/jogoAtual.ts`.
  No Genius, a lista de melodias (modo desenvolvedor) abre pelo botão "Escolher melodia" da
  seção Partida, antes da demonstração começar.
- **Temas** (`ui.css`, `temaUi.ts`): claro (fundo n1, branco, tinta e azul) e escuro (tinta
  n12 e amarelo) no Tipográfico e no Gelatina. O Genius tem só o tema escuro. No Tipográfico, o
  tema também escolhe as cores de fundo, das notas inativas e das notas tocadas; fundo e notas
  inativas continuam editáveis.
- **Fontes mutáveis** (Gelatina): a lista de fontes tem duas categorias, "Fontes" e
  "Fontes mutáveis". As mutáveis são variáveis com efeito próprio (os eixos mudam ao tocar, no
  lugar de esticar a letra): Kablammo,
  Shantell Sans e Tilt Warp (gira em 3D). Cheee, Camelion e Hela vieram como fontes de teste
  estáticas (pastas de demo/trial em `public/fontes`): o efeito `estilos` troca o estilo da
  letra conforme a força do toque (Cheee incha, Hela engorda peso a peso, Camelion engorda e
  balança para o itálico). Há também o efeito automático para fontes variáveis
  (`vite-eixos-fontes.ts` lê os eixos no build), pronto para a Graduate se o arquivo
  `GraduateGX.woff2` for colocado na pasta. Licenças em `public/fontes/LICENCAS.txt`: Cheee e
  Camelion de demo só podem ser usadas em testes; a Hela trial, só sem fins comerciais.
- **Letras do Gelatina no plano mais alto**: na janela principal elas passam por cima da barra,
  da marca e do status (sem bloquear os cliques) em vez de serem cortadas pela borda do palco; o
  fundo do tema vai para o `<body>`. O tamanho inicial ficou menor (densidade padrão 0,8, aplicada
  uma vez também a quem já tinha preferências salvas) e o motor deixa uma folga em volta de cada
  palavra (maior nas fontes mutáveis), para nenhuma sair da tela. No efeito `estilos`, a palavra é
  medida pelo estilo mais largo.
- **Fontes pixel (teste)** no Gelatina: Doto e Pixelify Sans, numa categoria própria (Handjet,
  Bitcount e Tiny5 saíram). Aparecem com o desenho original, sem suavização (o teste com
  anti-aliasing por filtro SVG foi descartado). O efeito
  dessas fontes (`eixos`) só acompanha a força do toque, sem vai e vem.
- **Acentos compostos**: Anak Gedong, Howdybun, Cheee e Camelion não têm ó, é, á. A letra base
  fica na fonte original e o acento vem de uma fonte doadora do acervo, escolhida por comparação
  visual (Blue Winter, Baloo 2, Caprasimo e Poppins). Detalhes em `public/fontes/LEIA-ME.txt`.
- **Comic Sans, Papyrus e Helvetica** (Gelatina, categoria "Fontes"): são fontes comerciais e
  não podem ser distribuídas com o projeto. O `@font-face` usa a versão instalada no computador
  e, na falta dela, uma fonte livre parecida guardada em `public/fontes`: Comic Neue, Macondo e
  TeX Gyre Heros. O Windows já traz a Comic Sans; a Papyrus vem com o Office; a Helvetica
  normalmente não está no Windows, então ali aparece a TeX Gyre Heros, desenhada a partir dela.
- **Sorteios no Gelatina**: dois botões na barra, à esquerda do de configurações. Um sorteia
  uma fonte da lista (nunca a atual) e o outro uma paleta nova de sete cores bem separadas.
- **Piano em perspectiva** (Genius): interruptor "Piano em perspectiva" na seção Aparência da
  gaveta, ligado por padrão e lembrado entre execuções, com inclinação fixa de 26°. O piano
  deita num chão com grade azul que some ao longe, sem linha de horizonte; teclas, cores e
  partículas são as mesmas. Desligado, volta ao piano chapado. O piano (1500 × 300px) e o
  botão "Iniciar partida" têm tamanho fixo e não acompanham a proporção da tela; em janelas
  com menos de 1500px de largura as pontas do piano ficam cortadas. CSS no fim de `genius.css`.
- **Design System Conectando** (aplicado em outubro de 2026): a moldura comum segue os tokens
  do sistema, declarados no topo de `src/shared/ui/ui.css` (azul `#1666B0`, azul profundo
  `#0E5395`, amarelo `#FCE051`, coral `#EB5F3E`, neutros derivados do azul de `#FFFFFF` a
  `#10263F`, verde e vermelho semânticos no status). Botões em pílula com hover mais escuro
  (nunca opacidade) e pressionado de 1px, campos com borda de 2px e raio 6, foco em anel coral
  de 3px, sombras azuladas, alvos de toque de 44px e nada de desfoque. Tipografia: Poppins
  para o que se lê e IBM Plex Mono para o que se identifica (títulos de seção, valores,
  teclas e status), as duas embutidas pelo Fontsource. Nos pianos com fontes escolhíveis, só a
  interface de configurações mudou de fonte; as notas continuam na fonte escolhida. As cores
  padrão do Tipográfico e do Gelatina começam pelas do sistema e seguem editáveis. No Gelatina,
  as sete notas usam só as cores de identidade (cor da marca e cores de apoio: azul, coral,
  amarelo, azul profundo, coral suave, azul brilho e amarelo suave), e quem já tinha
  preferências salvas recebe essa paleta uma vez. Logotipos trocados pelos do
  sistema: `marca-azul.png` no claro e `marca-branca.png` no escuro.
- **Imagens**: todas em `src/assets` (marca, moldura e genius), catalogadas em
  `src/assets/LEIA-ME.md`. São importadas pelo código e embutidas no build, então funcionam
  sem internet. As fontes continuam em `public/fontes`.
- A lista de melodias do Genius (modo desenvolvedor) abre por cima da barra e da faixa, como a
  gaveta de configurações.
- Na janela principal, o palco de cada jogo fica em `.ui-palco`, abaixo da barra e da faixa.
  A janela de projeção não muda: continua tela cheia, só com o palco.

## Modo de entrada: MIDI ou teclado do computador

Na seção "Jogo e entrada" da gaveta de configurações há um seletor **MIDI | Teclado**, que vale para os três jogos
(a escolha fica salva entre execuções). O Piano Gelatina segue o mesmo modo.

- **MIDI**: comportamento original, notas vindas do teclado MIDI via Web MIDI.
- **Teclado**: as teclas do computador (layout ABNT2) simulam o piano em duas oitavas,
  sempre com as teclas pretas na fileira de cima:

```
1ª oitava (Dó3 a Si3)              2ª oitava (Dó4 a Si4)
     2   3       5   6   7              S   D       G   H   J
   Q   W   E   R   T   Y   U          Z   X   C   V   B   N   M

Q/Z Dó   2/S Dó#   W/X Ré   3/D Ré#   E/C Mi   R/V Fá
5/G Fá#  T/B Sol   6/H Sol# Y/N Lá    7/J Lá#  U/M Si
```

Detalhes:

- Os modos são exclusivos: no modo Teclado as mensagens MIDI são ignoradas, e vice-versa.
- Usa a posição física da tecla (`KeyboardEvent.code`), então funciona com Caps Lock.
  Segurar a tecla gera uma única nota; combinações com Ctrl/Alt/Shift são ignoradas.
- A tecla **A** fica fora do mapeamento e abre/fecha a gaveta de configurações nos três jogos,
  que começa fechada (também abre pelo botão da direita na barra; ESC fecha). No Tipográfico e
  no Gelatina, o A vale também com a janela de projeção em foco. No Genius, a lista
  de melodias passou para o botão "Escolher melodia" dentro da gaveta; com ela aberta, A ou ESC
  fecha a lista.
- No Genius, o botão "Iniciar partida" fica liberado sem dispositivo MIDI e as letras aparecem
  sobre as teclas do piano virtual (24 das 25 teclas; o Dó5 da ponta não tem atalho).
- No Tipográfico, o modo demonstração automático é desligado e o painel mostra o mapa de
  teclas. As notas também funcionam com a janela de projeção em foco.
- No Gelatina, o painel mostra o mapa de teclas no modo Teclado e a escolha do aparelho no modo
  MIDI (os knobs do MPK Mini continuam controlando crescimento, densidade, espaçamento e
  desalinhamento). As notas também funcionam com a janela de projeção em foco.
- Código em `src/shared/` (`inputMode.ts`, `keyboardInput.ts`, `useInputMode.ts`).

## Rodar

Desenvolvimento (web, no navegador — use Chrome/Edge para Web MIDI):

```bash
npm install
npm run dev
```

Desenvolvimento no Electron (desktop):

```bash
npm run electron:dev
```

Gerar instaladores:

```bash
npm run dist:mac   # .dmg (arm64 + x64)
npm run dist:win   # .exe (NSIS + portable, x64)
```

## Pendências

Situação dos itens que estavam pendentes:

- **App desktop não abria (resolvido)**: o `electron/main.js` usava `require()`, mas o
  `package.json` declara `"type": "module"`; o Electron travava ao carregar ("require is not
  defined"). O arquivo foi convertido para `import`. Também passou a liberar a permissão de
  tela cheia (antes só MIDI era permitido) e o F11 alterna tela cheia em qualquer janela.
- **Fontes offline (resolvido)**: as 26 fontes que vinham do Google Fonts (10 do Tipográfico,
  15 do Gelatina e a DM Mono da interface) agora são pacotes `@fontsource`, importados em
  `src/fonts.ts` (só o subconjunto latino). Junto com as que já ficam em `public/fontes`
  (Khurasan, Kablammo e Shantell Sans, licenças em `LICENCAS.txt` e `OFL-*.txt`), o app não
  faz mais nenhum pedido à internet. Howdybun e Anak Gedong continuam sem acentos: no sistema
  latino o painel avisa e as letras acentuadas saem de uma fonte reserva.
  **Depois de atualizar o projeto, rode `npm install`** para baixar esses pacotes.
- **Janela de projeção (resolvido e testado no app empacotado)**: Tipográfico e Gelatina usam
  o mesmo código (`src/shared/projectionWindow.ts`), que:
  - percebe quando a janela é fechada (antes o Tipográfico podia não perceber);
  - fecha a projeção quando o piano sai de cena (antes sobrava uma janela vazia no telão);
  - liga a tela cheia com duplo clique ou F11.
  No Gelatina, fechar a projeção deixava o motor dela na lista e ele seguia recebendo notas;
  agora cada tela tem o seu lugar. Testado com `electron-builder --linux dir`: as duas
  projeções abrem, desenham com as fontes embutidas, fecham, reabrem e entram em tela cheia.
- **Repo de origem quebrado (fora deste projeto)**: no `piano-tipografico`, o commit "Código
  comentado" truncou `components/Note.tsx`. Aqui foi restaurada a versão íntegra do commit
  anterior (`17dd43c`). O conserto precisa ser feito no repositório original.
- **Chave Gemini (resolvido)**: o `vite.config.ts` original do Tipográfico referenciava
  `GEMINI_API_KEY` sem uso; foi removido nesta unificação.
