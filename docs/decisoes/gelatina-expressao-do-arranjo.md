# Gelatina: curva das linhas e notas repetidas pela tela (16/11/2026)

## Pedido
As linhas das notas estavam retas e chapadas demais. A equipe pediu um arranjo mais
expressivo, com os parâmetros ajustáveis.

## O que foi testado e retirado: mexer nas letras uma a uma
- Primeira versão (mesmo dia): três deslizantes, "Espaço entre letras" (espaço extra somado
  ao natural da fonte), "Onda nas letras" (cada letra subia, descia e tombava, como uma fita)
  e "Curva das linhas". Padrões testados: +8%/50%/50% e depois +15%/75%/75%.
- Decisão da equipe: mexer nas letras individualmente não ficou satisfatório. **A palavra de
  cada nota é um bloco só, que não se altera por dentro**: letras na mesma linha de base, sem
  giro próprio e com o espaçamento natural da fonte (como em
  `gelatina-maiuscula-e-tamanho-das-notas.md`). Os dois deslizantes de letras saíram, e as
  chaves `espacoLetras` e `ondaLetras` são apagadas das preferências guardadas.

## Curva das linhas (mantida)
- Deslizante "Curva das linhas" (0 a 100%), na seção "Arranjo na tela". **Padrão 0: linhas
  retas**, como antes. Quem guardou o valor da primeira versão (curvado) volta a 0 uma vez,
  pela flag `linhasRetasV1`.
- As notas seguem uma onda que atravessa a tela (até 42% da altura da linha, uma onda inteira
  por largura da área) e giram acompanhando a subida. A curva move e gira a palavra inteira;
  as letras dela não mudam.
- A onda depende da posição na tela, e não da posição na linha: as linhas correm paralelas,
  como fitas, e não se cruzam. Cada linha desloca um pouco a fase (0,7 rad), e uma folga entre
  linhas proporcional à curva (`CURVA_FOLGA`) evita que encostem.
- Vale também no anglicano e soma-se à inclinação das notas.

## Notas na tela: 1 a 4 vezes (novo)
- Seletor "Notas na tela" (1 vez, 2 vezes, 3 vezes, 4 vezes), logo abaixo da curva. As sete
  notas se repetem em sequência (Dó a Si, Dó a Si...) para usar melhor o espaço da tela.
  Padrão: 1 vez. Preferência `copiasNotas` (inteiro de 1 a 4).
- Tocar uma nota anima todas as cópias dela juntas (mesmo pulo, cor e sustenido). O motor
  guarda em cada palavra a nota da escala que ela representa (`nota`), e as relações entre
  notas (quem encolhe ao tocar outra) usam essa nota.
- Número de linhas: com 1 vez, a regra fixa de sempre (4+3 em 16:9, 3+2+2 em 4:3, 2+2+2+1 em
  pé). Com cópias, o motor testa de 1 linha até uma por palavra e fica com o arranjo de letras
  maiores, que é o que melhor ocupa a tela. Isso pode variar de fonte para fonte (a regra fixa
  foi feita para 7 palavras). Em 1600x900 com a Modak: 2 vezes = 5+5+4; 4 vezes = 7+7+7+7.
- Os desalinhamentos de cada nota (tamanho, altura, giro) se repetem nas cópias, então cada
  cópia de uma nota tem o mesmo jeito.
- Limite de 4 vezes (`COPIAS_MAX`, 28 palavras): acima disso as palavras ficam pequenas demais
  para ler no telão.
- Telão: usa o mesmo `ProjectionScreen` com as mesmas opções, então repete igual.

## Conferido
- No navegador, em 1600x900: padrão reto; preferências antigas limpas; 2 e 4 vezes no latino;
  3 vezes no anglicano; seletor da gaveta; demonstração tocando com 4 vezes (todas as cópias
  de Mi e Fá crescem juntas). tsc e build sem erros.
- Observado: com 3 ou 4 vezes a tela fica cheia, e a nota tocada, ao crescer, encosta um pouco
  nas vizinhas durante o toque. Não foi mexido no empurrão entre notas.
- Não conferido: a janela do telão aberta lado a lado.

## Extremos ampliados (16/11/2026)
- Pedido: manter os padrões e aumentar os extremos dos ajustes já existentes, para permitir
  mudanças mais expressivas. Nenhum padrão mudou.
- Novos limites (antes entre parênteses), centralizados em `LIMITES` (`constants.ts`) e usados
  pela gaveta, pelos knobs do MPK Mini (cada knob percorre a faixa inteira) e pelo motor:
  - Densidade: 10% a 100% (30% a 100%). Acima de 100% não faz sentido: já é a tela inteira.
  - Espaçamento: até 12% da tela (6%).
  - Desalinhamento: até 200% (100%), dobrando tamanho, altura e giro de cada nota.
  - Curva das linhas: até 200% (100%).
  - Inclinação das notas: ±15° (±8°). As marcas embaixo do deslizante vão de 5 em 5; o
    deslizante continua travado nos inteiros.
  - Crescimento da nota: 1× a 4× (1,2× a 3×). Em 1× a nota só pula e acende. Acima de 3× o
    empurrão nas vizinhas pode ir além dos 10% da tela de antes, crescendo junto.
  - Notas na tela: até 6 vezes (4); os botões passaram a "1×" a "6×" para caber.
  - Sombra: distância até 20% da letra (8%) e difusão até 25% (10%).
- Conferido no navegador, em 1600x900: todos os extremos juntos (densidade 100%, desalinhamento
  200%, curva 200%, inclinação 15° em "Cada nota", crescimento 4×) sem nada sair da tela, com
  Mi e Fá quase encostando; 6 vezes com 15° e 4× tocando a demonstração. tsc e build sem erros.
- Observado: nos extremos de cópias e crescimento juntos, a nota tocada cresce por cima das
  vizinhas (fica na frente). É o efeito mais forte possível e fica a critério de quem opera.

## Cópias sem colunas (16/11/2026)
- Problema: algumas opções de "Notas na tela" destoavam das outras. Quando o arranjo de letras
  maiores caía em linhas de 7 palavras (3× ou 4× em umas telas; 4×, 5× e 6× com densidade 100%
  em 1600x900), toda linha começava no Dó e as cópias de cada nota ficavam empilhadas em
  colunas, como uma tabela. Em 2× a sequência escorrega de uma linha para a outra.
- Correção (`semColunas` no motor): com cópias, arranjos com alguma linha de múltiplo de 7
  palavras são descartados, no latino e no anglicano. Entre os que sobram, vale o de letras
  maiores, como antes. Com 1× nada muda.
- Conferido em 1600x900 (Modak, densidade 100%, curva e inclinação ligadas): 3× = 6+5+5+5,
  4× = 6+6+6+5+5, 5× = 9+9+9+8, 6× = 11+11+10+10, todas com a sequência escorregando como em 2×.
  tsc e build sem erros.

## Encaixe sem sobreposição (16/11/2026)
- Problema: em algumas combinações de ajustes e fontes, as notas paradas se sobrepunham ou
  saíam da tela. Exemplo: Bungee com inclinação de 15°, desalinhamento e curva em 200% e
  densidade 100% (em 1600x900, Mi e Fá se cruzavam, Ré encostava em Mi e o Dó saía pela
  esquerda). Causa: o arranjo põe as palavras em linhas sem contar o giro (inclinação, curva,
  desalinhamento), e o confinamento de cada quadro só empurrava a palavra para dentro da
  tela, por cima da vizinha.
- Correção (`encaixar` no motor, chamado depois de todo arranjo e quando muda a inclinação):
  com as notas em repouso, cada palavra vira um retângulo girado (com a mesma folga do
  confinamento) e o encaixe resolve em duas etapas, sempre por igual para todas:
  1. se algum par se cruza (teste do eixo separador), as palavras encolhem em torno do
     próprio centro até se separarem;
  2. se alguma passa da margem, o conjunto inteiro (lugares e tamanhos) se aproxima do
     centro da tela, o que não cria sobreposição nova.
  Uma etapa só (encolher em torno do centro) foi testada antes e deixava tudo minúsculo
  quando uma palavra tinha o centro perto da borda.
- Quando nada se cruza nem sai da tela, nada muda: o padrão continua igual.
- A troca de inclinação refaz só o encaixe, sem refazer o arranjo; a mudança de tamanho
  chega suave pela mola.
- Conferido no navegador: o caso acima (sem sobreposição, tudo dentro, palavras um pouco
  menores), o padrão igual ao de antes, Kablammo com 6 cópias a 15°, Bungee em tela em pé
  (600x900) com 15° em "Cada nota" e curva em 200%. tsc e build sem erros.
- Limite: vale para as notas paradas. Ao tocar, a nota que cresce ainda pode passar por
  cima das vizinhas (fica na frente), como sempre foi, principalmente com crescimento alto
  e muitas cópias.

## Encaixe que preenche a tela (16/11/2026)
- Problema: nos testes, o encaixe deixava espaços em branco. Ele encolhia tudo por igual
  (lugares e tamanhos, largura e altura juntas), então quando só a altura estourava a
  largura encolhia junto e sobravam faixas dos lados. E quando um único par de palavras se
  cruzava, todas encolhiam, mesmo com espaço livre para afastá-las. Exemplo: em 1183x905,
  Modak com 4×, curva 200%, desalinhamento 194% e -10° em "Cada nota", as notas ocupavam
  só 66% da largura.
- Correção (`encaixar` no motor): o encaixe procura o maior tamanho de palavra, igual para
  todas, em que nada se cruza nem passa da margem. Para cada tamanho, os lugares podem se
  afastar do centro até a borda da área da densidade, ou se aproximar dele até a margem,
  na largura e na altura em separado. Afastar tem limite de 1,3 vez (`ESPALHAR_MAX`) para
  a linha não virar palavras soltas. Quando o encaixe age, o conjunto também é
  centralizado na tela (a curva e o desalinhamento podiam deixá-lo torto para um lado).
- Com cópias, o número de linhas passou a ser escolhido depois do encaixe
  (`melhorDepoisDoEncaixe`): vale o arranjo de letras maiores já contando a inclinação e
  a curva, e não só o de antes delas.
- Se o arranjo já cabe sem cruzamentos, nada muda: o padrão ficou idêntico, conferido
  letra por letra na tela antes e depois.
- Conferido no navegador: o exemplo acima passou a ocupar 95% da largura, com letras
  cerca de 16% maiores; Bungee com 15° em "Cada nota", curva e desalinhamento em 200%
  (maior e centralizada); Bungee em tela em pé (600x900) com 2×. tsc e build sem erros.
- Não mudou: no anglicano, os vãos entre as letras vêm da grade (cada letra ocupa 70% da
  largura da sua célula), e a grade ficou como era. Também não conferido: o telão aberto
  lado a lado (usa o mesmo motor).

## Densidade padrão em 100% (16/11/2026)
- Pedido da equipe: o Gelatina abre com densidade 100% (antes 80%), as notas ocupando a área
  toda. O deslizante continua de 10% a 100%.
- Quem tinha preferências guardadas vai para 100% uma vez (flag `densidadeCheiaV1`); depois
  o valor escolhido no deslizante fica. Conferido no navegador: 80% guardado abre em 100%; 50%
  escolhido depois continua 50%.
