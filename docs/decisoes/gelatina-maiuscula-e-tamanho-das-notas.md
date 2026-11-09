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