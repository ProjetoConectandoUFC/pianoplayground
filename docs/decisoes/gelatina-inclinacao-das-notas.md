# Gelatina: inclinação das notas

## 11/11/2026: primeira versão (±2°)

- Pedido: poder inclinar as notas do Piano Gelatina por um deslizante que começa no meio (0°, o arranjo de sempre) e só aceita -2°, -1°, 1° e 2°.
- Gaveta, seção "Arranjo na tela": deslizante "Inclinação das notas", com passo 1, então ele trava nos graus inteiros. As posições aparecem escritas embaixo da trilha (opção nova `marcas` do `Deslizante` comum, em `src/shared/ui/componentes.tsx`), com a atual destacada.
- Sentido: positivo faz a palavra subir para a direita (como o ângulo da escola); negativo, descer. Na tela a rotação positiva é horária, por isso o motor inverte o sinal.
- Como funciona (src/gelatina/services/gelatinaEngine.ts, opção `anguloGraus`): cada palavra gira no próprio centro, somando a inclinação à leve rotação do desalinhamento. Entra no alvo de cada quadro, não nos lugares fixos, então o arranjo não é refeito e a mudança chega suave pela mesma mola da rotação. O confinamento já usa a caixa girada, então nada sai da tela.
- Preferência guardada em `anguloNotas` (localStorage). Valor ausente (preferências antigas) vira 0; valor fora da faixa é limitado e arredondado. Não precisou de flag de migração porque o padrão é igual ao comportamento anterior.
- Telão: usa o mesmo `ProjectionScreen` com as mesmas configurações, então inclina junto.

## 11/11/2026: até ±8° e modo individual

- Pedido: ampliar o deslizante para -8° a 8°, passando por todos os inteiros, e um segundo controle para escolher como a inclinação afeta as notas: todas ou cada uma com a sua.
- Deslizante: de -8 a 8, passo 1 (17 posições). Embaixo aparecem todos os números; nas marcas vai só o número, sem o símbolo de grau, para não encostarem umas nas outras (opção `rotuloMarca` do `Deslizante`). O valor atual, acima da trilha, continua com o grau.
- Segundo controle: como são só duas opções, virou um seletor de duas posições ("Todas iguais" / "Cada nota"), no mesmo estilo do seletor de tema, em vez de uma barra de arrastar. Preferência `anguloModo` ('todas' por padrão; qualquer outro valor guardado volta a 'todas').
- "Cada nota": cada nota recebe uma fração fixa do ângulo (`FATOR_INCLINACAO`: 1, -0,75, 0,5, -1, 0,75, -0,5, 0,875, de Dó a Si). O lado alterna entre vizinhas e o tamanho varia, para parecer solto. É fixo, e não sorteado, para a tela e o telão ficarem iguais e o desenho não mudar a cada abertura. A maior fração é 1, então o deslizante continua sendo o limite.
- Conferido no navegador a 8° nos dois modos, inclusive com densidade e desalinhamento em 100%: as palavras não se sobrepõem e nada sai da tela, sem precisar mudar o arranjo. tsc e build sem erros.

## 16/11/2026: até ±15°
- Ampliado para -15° a 15° junto com os outros extremos do arranjo (ver
  `gelatina-expressao-do-arranjo.md`). Com 31 posições, as marcas embaixo da trilha passaram a
  ir de 5 em 5 (−15, −10, −5, 0, 5, 10, 15); o deslizante continua travado nos inteiros.
