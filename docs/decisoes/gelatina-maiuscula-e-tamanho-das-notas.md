# Gelatina: maiúscula inicial mais clara e notas com tamanhos equilibrados (09/11/2026)

## Maiúscula e minúscula
- Problema: em várias fontes, a maiúscula inicial (D de Dó, M de Mi...) não se distinguia das minúsculas.
- Causas: (1) o sorteio de tamanho por letra ia de 0,88 a 1,22 e podia deixar a minúscula maior que a inicial; (2) algumas fontes só têm maiúsculas, ou têm minúsculas quase da mesma altura. Medido no app (altura da maiúscula ÷ altura da minúscula): Bungee, Hela, Kablammo e Luckiest Guy ≈ 1,0; Matcha e Oi ≈ 1,08; Modak e Blue Winter ≈ 1,17. Nas fontes comuns, de 1,3 a 1,5.
- Correção (src/gelatina/services/gelatinaEngine.ts):
  - A variação entre letras caiu para ±3%. A inicial nunca fica menor que 1 e as minúsculas nunca passam de 1.
  - O motor mede essa razão em cada fonte e aumenta a inicial até a maiúscula ficar 1,32 vez a minúscula, com no máximo +30% (MAIUSCULA_ALVO, MAIUSCULA_MAX). Fontes comuns quase não mudam; nas só de maiúsculas, a inicial vira uma capitular, cerca de 30% maior. O aumento é igual na largura e na altura, sem distorcer, e a letra continua na linha de base.
  - Só vale para o sistema latino. No anglicano cada nota é uma letra só.

## Tamanho entre as notas
- Problema: o Dó saía bem maior que o Si. Cada nota tinha um fator fixo de 0,84 a 1,20 (Q_SIZE), e cada linha ainda era ampliada até encher a largura, então uma linha curta saía enorme.
- Correção: todas as linhas usam a mesma escala, a da linha que mais limita. As linhas mais curtas ficam centralizadas. Do fator por nota, sobra 35%, ligado ao Desalinhamento: em 100% vai de 0,94 a 1,07; em 0% todas as notas ficam do mesmo tamanho.
- Medido nas 29 fontes, com desalinhamento padrão (80%), em tela larga e em pé: a maior nota fica 14% a 16% maior que a menor.

- Conferido: tsc e build sem erros; vistas no navegador a Oi, a Bungee (só maiúsculas) e a Playfair (comum).

## Divisão das notas em linhas, igual para todas as fontes (09/11/2026)
- Problema: depois dos ajustes de proporção, cada fonte se organizava de um jeito (4+3, 2+5, 3+2+2...). O motor testava de 1 a 5 linhas e escolhia a que mais enchia a tela, com a quebra decidida pela largura das palavras, que muda de fonte para fonte.
- Correção: o número de linhas depende só do formato da área das notas (largura ÷ altura), e as primeiras linhas levam uma nota a mais:
  - 1,6 ou mais (16:9 e telas largas): 4+3 (Dó Ré Mi Fá / Sol Lá Si);
  - de 1,05 a 1,6 (4:3 e parecidas): 3+2+2;
  - abaixo de 1,05 (tela quadrada ou em pé): 2+2+2+1.
- Os limites saíram da medida das 29 fontes: abaixo de 1,6 o 3+2+2 deixa as letras maiores em quase todas. Em 16:9 o 4+3 fica só cerca de 9% menor que o melhor arranjo e foi mantido por ser a divisão mais regular (a mesma do sistema anglicano).
- Conferido: as 29 fontes saem 4+3 em 1920x1080, 3+2+2 em 1024x768 e 2+2+2+1 em 600x900. tsc e build sem erros.

## Espaços padronizados e maiúscula mais forte em Modak e Oi (09/11/2026)
- Problema: letras coladas em umas palavras e afastadas em outras, e notas quase encostando nas vizinhas.
- Causas e correções (src/gelatina/services/gelatinaEngine.ts):
  - Entre letras: o espaço era sorteado por letra (1,2% a 3,4% do tamanho da fonte), e a leve rotação de cada letra abria ou fechava esse espaço. Agora é fixo, GAP_LETRA = 7% do tamanho da fonte, de tinta a tinta, sem contar a rotação, e acompanha o tamanho das duas letras vizinhas (cresce depois da maiúscula ampliada).
  - Entre notas: o espaço horizontal variava de nota para nota (Q_GAP, 8% a 19%). Agora é fixo, GAP_NOTA = 22%. Entre linhas, o mesmo espaço mais uma folga para o desalinhamento vertical (antes eram só 4,5% da altura da linha). O desalinhamento vertical das palavras caiu de 0,5 para 0,3 da altura da linha (DY_NOTA).
  - Hela (efeito 'estilos'): a largura das letras era medida no estilo mais forte (Hela 700), mas em repouso aparece o Hela 300, com M mais largo e i mais fino; o M encostava no i. Agora a largura vem do estilo de repouso, e a altura continua vindo do mais forte.
- Maiúscula: o alvo da altura da inicial em relação à minúscula sobe de 1,32 até 1,52 quando a fonte tem minúsculas quase da altura das maiúsculas, com teto de +50%. Modak: inicial +21% (antes +13%); Oi: +36% (antes +22%); Bungee, Hela, Kablammo e Luckiest: +50%. Fontes comuns não mudam.
- Conferido no navegador: as 29 fontes lado a lado. Nas itálicas (Shrikhand, Berkshire), o espaço de tinta a tinta parece um pouco mais aberto por causa da inclinação. tsc e build sem erros.
## Grafia das notas e espaçamento natural das fontes (11/11/2026)
- Checagem das 29 fontes do menu com Dó, Ré, Mi, Fá, Sol, Lá, Si:
  - Rótulos certos no código (src/gelatina/constants.ts) e nenhuma letra caindo em fonte reserva: todas têm D, ó, R, é, M, i, F, á, S, o, l, L próprios.
  - Quatro fontes só têm maiúsculas: Bungee, Hela, Kablammo e Luckiest Guy. Nelas a "minúscula" é a maiúscula, e as notas aparecem como MI, SOL, SI; a inicial maior (reforço de maiúscula) é a única diferença possível. Na Kablammo o I e o L decorados ficam difíceis de ler ("ME", "tá") em qualquer valor do eixo MORF.
  - Nas demais, só o "o" repete o desenho do "O", o que é normal.
  - Decisão da equipe (11/11/2026): as quatro fontes só de maiúsculas continuam no menu como estão.
- Espaço entre letras: em vez do espaço fixo de 7% (de tinta a tinta), o motor usa o espaçamento da própria fonte, como num editor de texto: margem depois da letra anterior, kerning do par e margem antes da letra, cada parte na escala da sua letra. O espaço fixo abria buracos ("M i") nas fontes de letras justas e nas itálicas. GAP_LETRA só vale quando falta a medida (acento composto, sem uso hoje). No Hela, a medida vem do estilo de repouso (Hela 300).
- Letras da mesma palavra agora ficam na mesma linha de base e sem giro próprio (rot0 e dy0 sem uso). Com o espaçamento natural, esse balanço encavalava as letras das fontes justas (Oi, Modak, Luckiest Guy, Matcha). O desalinhamento continua entre as notas, e a deformação ao tocar não mudou.
- A Oi foi desenhada com as letras encostando: escrita como texto comum, fica igual ao que o motor mostra agora.
- Conferido: as 29 fontes lado a lado no navegador, comparadas com o texto comum da fonte; toque no Mi deformando como antes. tsc e build sem erros.
