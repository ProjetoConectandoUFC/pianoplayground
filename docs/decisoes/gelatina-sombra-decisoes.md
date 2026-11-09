# Gelatina: sombra das letras configurável e desligada por padrão (09/11/2026)

- A sombra chapada que o motor sempre desenhava atrás das letras (deslocamento na cor de contorno do tema, chamada de "contorno" no código) virou opcional. O app abre sem sombra.
- Em Configurações > Aparência entrou o interruptor "Sombra". Ligado, ele mostra os ajustes: cor (segue a do tema até alguém escolher outra; "Usar a cor do tema" volta a seguir), opacidade, distância, difusão e ângulo (0° = direita, 90° = baixo).
- Ao ligar, os valores iniciais repetem a sombra antiga: cor do tema, 100%, distância 1,3% da letra, difusão 0 (chapada), 45°.
- Distância e difusão são frações da altura da letra, para crescer junto com a nota tocada. O motor gira o vetor de volta pela rotação da palavra, para o ângulo valer na tela, e reserva espaço para a sombra no confinamento, para nada sair da tela.
- A difusão é um desfoque, que o Design System Conectando evita. Fica disponível a pedido da equipe, mas começa em 0.
- Preferências: campos sombraAtiva, sombraCor, sombraOpacidade, sombraDistancia, sombraDifusao, sombraAngulo. A flag sombraV1 desliga a sombra uma vez para quem vinha da versão em que ela era fixa.
- A janela de projeção usa as mesmas configurações (optionsFromSettings em ProjectionScreen.tsx).
- Conferido: tsc e build sem erros; no navegador, a sombra começa desligada, liga pelo interruptor e responde aos ajustes. A janela de projeção não foi aberta no teste.