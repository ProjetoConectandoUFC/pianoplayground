# Genius do Piano: tela inicial nova (26/10/2026)

Decisões aplicadas no código (pianoplayground/src):

- Fundo: Noite #002036 (tema sóbrio do Design System). O índigo #20274f do mockup não existe no DS.
- Tokens do DS adicionados como --cn-* em src/shared/ui/ui.css. Só o Genius usa; Tipográfico e Gelatina seguem com os tokens antigos.
- Moldura (barra, gaveta, botão de config) com tema sóbrio quando data-ui-jogo="genius": superfície marinho, destaque amarelo #fde31f, linhas celeste #62bfff, foco amarelo.
- Marca Conectando: mesmo tamanho (46px) nos três modos; o tamanho maior do mockup foi descartado.
- Piano: moldura azul-escuro #035386, teclas brancas creme #fcfaf1, pretas título #001320; demonstração amarela #fde31f. Toque do jogador: ver "Modos de jogo e cor do jogador" abaixo (antes coral #e34a39).
- Slider "Inclinação do piano" (gaveta > Aparência): 0% a 100%, mapeado para 0° a 70°. Padrão 75% (52,5°), que reproduz o mockup. Salvo em localStorage "genius-inclinacao"; quem tinha o interruptor antigo desligado começa em 0%.
- Faixa das mãos do topo desligada (MOSTRAR_FAIXA = false). As mãos ficam no rodapé: src/assets/moldura/maos-rodape.png (912 × 276, branco).
- Rodapé das mãos (28/10/2026): 20px de folga do pé da tela (--maos-respiro em .genius-maos, genius.css). O contêiner cresce os mesmos 20px, então o traço não chega mais perto do piano.
- Laços do fundo: laco-esquerda.png (branco 20%) usado duas vezes. Espelhado no canto superior direito, na altura da tela; e menor (40vh), girado -90°, no canto inferior esquerdo, com os cortes do arquivo fora da tela. laco-direita.png saiu porque o desenho é recortado nas quatro bordas e o corte aparecia. Os amarelos não são usados.
- Pílula do estágio aparece acima do título já na tela inicial; mensagem de pronto: "Ouça a melodia e repita no teclado."

# Genius: modos de jogo e cor do jogador (04/11/2026, após testes in loco)

- Dois modos, trocados na gaveta > Partida > "Modo de jogo" (segmentado Fácil | Desafio). Trocar de modo zera a partida.
- Fácil é o modo inicial; o modo não é salvo entre execuções (o app sempre abre no fácil).
- Fácil: estágios com 2, 4 e 6 notas, tiradas do começo da versão de nível 3 de cada música já cadastrada (NOTAS_MODO_FACIL e resolveMelody(m, nivel, modo) em melodies.js). A última nota do trecho dura pelo menos 1,5 tempo.
- Ritmo como requisito só no DESAFIO (Game.setRitmoObrigatorio(modo === 'desafio'), chamado antes de cada rodada). No fácil, acertar as notas basta: a nota de ritmo aparece no cartão, mas não reprova. No desafio, nota de ritmo abaixo de 40 reprova ("Ritmo inconsistente demais."), como antes.
- Entre estágios (fácil e desafio): cartão "Estágio N conquistado!" com o botão "Próximo estágio →". Um avanço automático sem cartão (só 0,7 s + contagem) foi testado no fácil em 04/11/2026 e REVERTIDO no mesmo dia: a equipe achou a passagem abrupta demais.
- Desafio: o funcionamento anterior (versões de cada nível, com os brindes).
- Fácil não tem brindes: a etiqueta do resultado diz "Modo fácil".
- Ao vencer o estágio 3 do fácil: "Modo fácil concluído!", confete, botão principal "Avançar para o modo desafio →" e secundário "Jogar o fácil de novo". O desafio começa no estágio 1 com a mesma música do fácil.
- Pílula mostra o modo: "Fácil · Estágio 1 de 3" / "Desafio · Estágio 1 de 3".
- Cor da resposta do jogador: padrão turquesa #24C0C0 (o ciano das cores padrão do Gelatina). Gaveta > Aparência > "Cor da resposta do jogador": 7 amostras (rosa, turquesa, céu, rosa antigo, laranja, azul médio, roxo), sem roda de cores. Salva em localStorage "genius-cor-jogador". Vai para --player (tecla, partículas) e --player-tinta (letra do teclado sobre a tecla: tinta nas claras, creme em azul médio e roxo). Borda da tecla = a cor 20% mais escura (color-mix).

## Banco de melodias

- 04/11/2026: "Tubarão" (id jaws) retirada a pedido da equipe. Restam 28 melodias em melodies.js.

## Botões do resultado e rodízio (04/11/2026)

- "Tentar a mesma música" (ação 'repetir'): mesma música, mesmo modo, a partir do estágio 1.
- "Nova partida" no modo desafio (ação 'rodizio') sempre volta ao modo fácil com outra música sorteada (pickRandomMelody evita a última). Vale para o cartão de campeão, para a derrota com brinde e para a derrota sem brinde.
- Fácil, derrota: principal "Tentar a mesma música", secundário "Nova música" (fica no fácil, música nova).
- Desafio, derrota sem brinde: principal "Tentar a mesma música", secundário "Nova partida" (rodízio).
- Desafio, derrota com brinde: principal "Nova partida" (rodízio), secundário "Tentar a mesma música".

## Som das notas do jogador (04/11/2026)

- Cada tecla tocada na vez do jogador soa com o mesmo timbre da demonstração (playNote), duração igual à da nota na demonstração. A nota errada também soa (420ms).
- Interruptor "Som das notas do jogador" na gaveta > Partida, ligado por padrão (Game.setPlayerSound). Desligar quando um sintetizador externo (GarageBand) já dá o som do teclado MIDI, para não dobrar.

## Modo tomate (04/11/2026)

- Interruptor "Modo tomate" na gaveta > Partida. Começa desligado a cada execução (não é salvo).
- Dispara em QUALQUER derrota com o modo ligado: nota errada, tempo esgotado ou ritmo irregular (este só existe no desafio). Antes só disparava com nota errada, e quem perdia por tempo/ritmo ficava sem tomate (corrigido 04/11/2026). game.js manda kind 'nota' | 'tempo' | 'ritmo', mais pos e total, no LOSE.
- Quantidade: 8 tomates se o erro for na primeira nota, caindo em linha reta até 2 na última (tomatoCount em renderer.js; TOMATES_MAX/MIN). Tempo esgotado conta a nota que faltou; ritmo irregular (melodia inteira tocada) dá 2. Com mais de 4, a saraivada fica mais rápida (170ms entre tomates) e as manchas menores (230 a 360px; até 4, 300 a 440px).
- Tomates voam do fundo da cena girando e crescendo até "bater na cara", com splat (playSplat) e tranco na tela. As manchas se espalham (cada uma procura distância das outras) e evitam o miolo, onde fica o cartão.
- Vaia da plateia: gravação real enviada pela equipe, src/assets/genius/vaia-plateia.mp3 (3 primeiros segundos do áudio original de 30 s, fade de 0,4 s no fim). Toca pelo MESMO AudioContext das notas (Web Audio: decodeAudioData + BufferSource), com o arquivo embutido no código via import "?inline" (base64). Antes tocava por um <audio> separado, que a política de autoplay podia bloquear (jogo só por MIDI ou comandado pelo telão) e a vaia sumia em algumas partidas (corrigido 04/11/2026). preloadBoo() decodifica no início de cada rodada (primeAudio) e ao ligar o modo; stopBoo() corta quando a rodada recomeça. Substitui o jingle de derrota.
- O cartão aparece 650ms depois do último tomate, com o título "Tomatada!" quando não há brinde. A tela é lavada (fade) quando a próxima rodada começa, ao voltar à tela inicial ou ao desligar o modo.
- Código: src/genius/tomates.js, estilos no fim de genius.css.

## Projeção (telão) do Genius (04/11/2026)

- Gaveta > seção "Projeção": o mesmo botão dos pianos (BotaoProjecao), "Abrir projeção em outra janela" / "Focar a janela de projeção". Usa openProjectionWindow (src/shared/projectionWindow.ts), então valem o duplo clique / F11 para tela cheia.
- Como o Genius é montado direto no DOM (não em React), o telão é um ESPELHO ao vivo do .genius-root (src/genius/espelho.js): MutationObserver aplica só a diferença (atributos, textos, nós que entram e saem), para as animações da cópia não recomeçarem. Jogo, som e MIDI continuam só na janela principal.
- O telão mostra palco, piano, contagem, cartões, tomates e confete; esconde o botão de configurações (visibility hidden, mantém o layout), o console do observador e a lista de melodias (.genius-projecao em genius.css). Copia os atributos do <html> (tema/variáveis) e a cor de fundo do <body>.
- Teclas apertadas com o telão em foco são repassadas para a janela principal (notas no modo Teclado, A abre a gaveta, ESC). Cliques nos botões do telão (ex.: "Tentar a mesma música") acionam o botão original.
- O telão fecha sozinho quando o Genius sai de cena.
- As partículas do toque (piano.js) passaram a ser posicionadas em % da camada, para caírem no lugar certo em telas de tamanho diferente.
- Testado com a principal em 1440×900 e o telão em 1920×1080.

## Aviso de processo (04/11/2026)

- Ao reenviar um arquivo para a pasta do computador, a ferramenta chegou a gravar a versão anterior de game.js e audio.js, o que deu tela branca (renderer.js importava funções que não existiam). Desde então: reenviar com nome de cópia novo e conferir byte a byte o arquivo no computador depois de gravar.

# Piano Gelatina e Tipográfico

- Fundo do tema claro: creme #FCFAF1 do DS (antes #F2F6FB), nos dois pianos e em --ui-ground do tema claro.
- Gelatina, cores padrão das notas (Dó a Si) = Cores de identidade do DS, na ordem do PDF: rosa #FF6776, turquesa #24C0C0, céu #3BB8FF, rosa antigo #DD6A75, laranja #D86F33, azul médio #4074B2, roxo #A740B2. Aplicadas uma vez a quem já tinha preferências salvas (flag coresIdentidadeV2); depois o painel manda.
- Laços do fundo (28/10/2026): mesma composição do Genius nos dois pianos, também na janela de projeção. Componente src/shared/ui/LacosFundo.tsx, CSS .ui-lacos em ui.css. Arquivos com opacidade cheia em src/assets/lacos/: laco-branco.png (tema escuro) e laco-azul.png (celeste #62BFFF, tema claro; antes #1666B0). Slider "Opacidade dos laços" na gaveta > Aparência, 0% a 100%, padrão 10% nos dois temas (antes 20%); campo lacosOpacidade nas configurações. Gelatina salva no localStorage e, pela flag lacosV2, quem tinha o valor da primeira versão volta uma vez para 10%. Tipográfico não guarda configurações entre sessões (como antes).
- No Gelatina, os laços da janela principal ficam fora do .gelatina-root (plano acima da barra) para passar por baixo da marca e do status; o palco principal ficou transparente (o fundo do tema já está no <body>).
- Com 10% e o celeste, as notas inativas do Tipográfico continuam legíveis sobre o laço.

# Catálogo de elementos gráficos

- Documento com imagens de todos os assets (em uso e guardados), ícones e fontes: https://claude.ai/artifact/FLYKc4B9F9oS6DEgQ3oEg5 (28/10/2026).
- Em uso: marca-azul, marca-branca, laco-esquerda (Genius), laco-branco e laco-azul (pianos), maos-rodape, vaia-plateia.mp3 (modo tomate), 5 ícones SVG no código. Guardados sem aparecer: faixas das mãos (ainda importadas, desligadas), logo-conectando azul/creme, laços amarelos, laco-direita, SVGs dos laços, onda-rodape, ufc, fundacao-cetrede, instituto-ufc-virtual.
