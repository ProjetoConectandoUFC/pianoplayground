// Banco de melodias icônicas (games, filmes, séries, rock, pop).
// 04/11/2026: "Tubarão" (jaws) retirada a pedido da equipe.
// Cada música tem 3 versões — uma por nível de dificuldade — com a mesma
// linha melódica em comprimentos crescentes.
//
// Sem número no título de propósito: a contagem desatualizava a cada
// inclusão (chegou a dizer "20" com 22 melodias no array).
//
// BPMs propositadamente lentos (55-80) para que a memorização visual e
// auditiva caiba no tempo de atenção de um visitante de feira sem
// formação musical.
// C4 = MIDI 60. Todas as notas dentro de C3-C5 (48-72), o range visível.
//
// =====================================================================
// REVISÃO MUSICAL — 19/08/2026
// Auditoria das 22 melodias contra transcrições externas. Detalhes e
// fontes em AUDITORIA-musical.md.
//
// CORRIGIDO (com fonte confirmada, marcado inline em cada entrada):
//   star-wars ......... F#4 -> F4 na descida (tritono contra a tônica)
//   mission-impossible  riff estava G-G-G-Bb-F; correto é G-G-Bb-C-G-G-F-F#
//   simpsons .......... final do nível 3 estava C-E-G; correto é C-A-F#-G
//   smoke-on-the-water  nível 3 terminava em Bb; o riff fecha em Bb-G
//
// SUSPEITO, NÃO ALTERADO — não achei fonte legível que confirmasse a
// correção, e trocar um palpite por outro é pior que registrar a dúvida.
// Se alguém da equipe tocar de ouvido e confirmar, corrija e apague daqui:
//   ff-fanfare ... a subida Eb-F-G não bateu com a única fonte que achei
//                  (que mostra arpejo C-E-G-C). Fanfarra de vitória do FF.
//   james-bond ... está como arpejo de Mi menor (E-G-B). As fontes descrevem
//                  o riff como movimento por graus conjuntos numa nota só
//                  (tipo E-F#-G-F#-E), não arpejo. Provável erro.
//   ghostbusters . a descida E-D-C-B-A da melodia não foi confirmada; as
//                  fontes divergem até na tonalidade (Si vs Dó).
//   pokemon ...... 'name' genérico demais para saber qual tema é (abertura
//                  do anime? tela-título do Red/Blue?). Verificar e
//                  renomear antes da feira.
//   indiana-jones  2ª frase para em A4 porque o Ré que a resolveria cai
//                  fora do range. É truncamento consciente, não erro.
// =====================================================================

export const MELODIES = [
  {
    id: 'mario-bros',
    name: 'Super Mario Bros.',
    bpm: 75,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 1 }, { midi: 64, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 64, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 2 }, { midi: 55, beats: 2 },
      ],
    },
  },
  {
    id: 'pokemon',
    name: 'Pokémon',
    bpm: 70,
    versions: {
      1: [
        { midi: 65, beats: 1 }, { midi: 69, beats: 1 }, { midi: 72, beats: 2 },
      ],
      2: [
        { midi: 65, beats: 1 }, { midi: 69, beats: 1 }, { midi: 72, beats: 1 },
        { midi: 65, beats: 1 }, { midi: 64, beats: 1 }, { midi: 62, beats: 2 },
      ],
      3: [
        { midi: 65, beats: 1 }, { midi: 69, beats: 1 }, { midi: 72, beats: 1 },
        { midi: 65, beats: 1 }, { midi: 64, beats: 1 }, { midi: 62, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 60, beats: 2 },
      ],
    },
  },
  {
    id: 'tetris',
    name: 'Tetris (Korobeiniki)',
    bpm: 60,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 59, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 62, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 59, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 62, beats: 1 }, { midi: 60, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 59, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 62, beats: 1 }, { midi: 60, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 1 }, { midi: 57, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 64, beats: 2 },
      ],
    },
  },
  {
    id: 'ff-fanfare',
    name: 'Final Fantasy Victory',
    bpm: 58,
    versions: {
      1: [
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 1.5 },
      ],
      2: [
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 1.5 },
        { midi: 63, beats: 0.5 }, { midi: 65, beats: 0.5 }, { midi: 67, beats: 2 },
      ],
      3: [
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 1.5 },
        { midi: 63, beats: 0.5 }, { midi: 65, beats: 0.5 }, { midi: 67, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 65, beats: 0.5 }, { midi: 67, beats: 2 },
      ],
    },
  },
  {
    id: 'wii-sports',
    name: 'Wii Sports',
    bpm: 68,
    versions: {
      1: [
        { midi: 66, beats: 1 }, { midi: 69, beats: 1 }, { midi: 71, beats: 2 },
      ],
      2: [
        { midi: 66, beats: 1 }, { midi: 69, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 68, beats: 2 },
      ],
      3: [
        { midi: 66, beats: 1 }, { midi: 69, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 68, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 2 },
      ],
    },
  },
  {
    id: 'star-wars',
    name: 'Star Wars',
    bpm: 72,
    versions: {
      1: [
        { midi: 55, beats: 1 }, { midi: 55, beats: 1 }, { midi: 55, beats: 1 },
      ],
      2: [
        { midi: 55, beats: 1 }, { midi: 55, beats: 1 }, { midi: 55, beats: 1 },
        { midi: 60, beats: 3 },
      ],
      // CORRIGIDO 19/08/2026: a 6ª nota era 66 (F#4). O tema é diatônico
      // em maior — a descida depois da dominante é G-F-E-D com FÁ NATURAL.
      // Com F# formava um trítono contra a tônica C4, o erro mais audível
      // que havia no banco. Confirmado em duas fontes independentes
      // (piano letter notes + tutorial de trompete).
      3: [
        { midi: 55, beats: 1 }, { midi: 55, beats: 1 }, { midi: 55, beats: 1 },
        { midi: 60, beats: 3 },
        { midi: 67, beats: 1 }, { midi: 65, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 62, beats: 2 },
      ],
    },
  },
  {
    id: 'imperial-march',
    name: 'Imperial March (Darth Vader)',
    bpm: 68,
    versions: {
      1: [
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
      ],
      2: [
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 70, beats: 0.25 }, { midi: 67, beats: 1 },
      ],
      3: [
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 70, beats: 0.25 },
        { midi: 67, beats: 1 }, { midi: 63, beats: 0.75 },
        { midi: 70, beats: 0.25 }, { midi: 67, beats: 2 },
      ],
    },
  },
  {
    id: 'pirates',
    name: 'Piratas do Caribe',
    bpm: 62,
    versions: {
      1: [
        { midi: 62, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
      ],
      2: [
        { midi: 62, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 70, beats: 2 },
      ],
      3: [
        { midi: 62, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 70, beats: 1 }, { midi: 70, beats: 1 },
        { midi: 70, beats: 0.5 }, { midi: 72, beats: 0.5 },
      ],
    },
  },
  {
    id: 'harry-potter',
    name: 'Harry Potter (Hedwig)',
    bpm: 62,
    versions: {
      1: [
        { midi: 59, beats: 1 }, { midi: 64, beats: 1.5 }, { midi: 67, beats: 0.5 },
      ],
      2: [
        { midi: 59, beats: 1 }, { midi: 64, beats: 1.5 }, { midi: 67, beats: 0.5 },
        { midi: 66, beats: 1 }, { midi: 64, beats: 2 },
      ],
      3: [
        { midi: 59, beats: 1 }, { midi: 64, beats: 1.5 }, { midi: 67, beats: 0.5 },
        { midi: 66, beats: 1 }, { midi: 64, beats: 2 },
        { midi: 71, beats: 2 }, { midi: 69, beats: 2 },
      ],
    },
  },
  {
    id: 'indiana-jones',
    name: 'Indiana Jones',
    bpm: 66,
    versions: {
      1: [
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.25 },
        { midi: 67, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.25 },
        { midi: 67, beats: 2 },
        { midi: 72, beats: 3 },
      ],
      3: [
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.25 },
        { midi: 67, beats: 2 },
        { midi: 72, beats: 3 },
        { midi: 65, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 69, beats: 2 },
      ],
    },
  },
  {
    id: 'pink-panther',
    name: 'Pantera Cor-de-Rosa',
    bpm: 62,
    versions: {
      1: [
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 2 },
      ],
      2: [
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 2 },
      ],
      3: [
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 1 },
        { midi: 72, beats: 1 }, { midi: 71, beats: 2 },
      ],
    },
  },
  {
    id: 'mission-impossible',
    name: 'Missão Impossível',
    bpm: 64,
    // CORRIGIDO 19/08/2026: as três versões tinham três G4 repetidos na
    // abertura (padrão de Star Wars / Marcha Imperial, provável
    // copiar-e-colar) e um F4 no lugar do C5. O ostinato do Lalo Schifrin,
    // em Sol menor, é G-G-Bb-C | G-G-F-F# — só duas notas repetidas, e a
    // célula sobe até o C. Fonte: transcrição em nomes de notas
    // (notationsworld) + tonalidade confirmada no Hooktheory.
    // Em MIDI: G4=67, Bb4=70, C5=72, F4=65, F#4=66 — tudo dentro de 48-72.
    versions: {
      // Nível 1: a primeira célula completa, G-G-Bb-C.
      1: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 70, beats: 1 }, { midi: 72, beats: 2 },
      ],
      // Nível 2: + o início da resposta (G-G-F).
      2: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 70, beats: 1 }, { midi: 72, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 65, beats: 2 },
      ],
      // Nível 3: o riff inteiro, fechando no F# que reconduz ao G.
      3: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 70, beats: 1 }, { midi: 72, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 65, beats: 1 }, { midi: 66, beats: 2 },
      ],
    },
  },
  {
    id: 'james-bond',
    name: 'James Bond',
    bpm: 70,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 67, beats: 1 }, { midi: 71, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 64, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 66, beats: 1 }, { midi: 64, beats: 2 },
      ],
    },
  },
  {
    id: 'ghostbusters',
    name: 'Ghostbusters',
    bpm: 64,
    versions: {
      1: [
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
      ],
      2: [
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 1 },
      ],
      3: [
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 1.5 },
      ],
    },
  },
  {
    id: 'stranger-things',
    name: 'Stranger Things',
    bpm: 64,
    versions: {
      1: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 67, beats: 2 },
      ],
      2: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 2 },
      ],
      3: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 2 },
      ],
    },
  },
  {
    id: 'game-of-thrones',
    name: 'Game of Thrones',
    bpm: 70,
    versions: {
      1: [
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 }, { midi: 63, beats: 2 },
      ],
      2: [
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 63, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 63, beats: 2 },
      ],
      3: [
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 63, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 63, beats: 1 }, { midi: 65, beats: 1 },
      ],
    },
  },
  {
    id: 'simpsons',
    name: 'Os Simpsons',
    bpm: 72,
    versions: {
      1: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 2 },
      ],
      2: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 67, beats: 1 }, { midi: 64, beats: 2 },
      ],
      // CORRIGIDO 19/08/2026: as duas últimas notas eram 64-67 (E-G), que
      // não existem no tema. A frase de Danny Elfman, em Dó lídio, é
      // C-E-F#-A-G-E-C-A-F#-G. Repus o A-F# antes do G final.
      // Fontes: tonalidade C lídio no Hooktheory + tab em nomes de notas.
      3: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 67, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 69, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 67, beats: 2 },
      ],
    },
  },
  {
    id: 'smoke-on-the-water',
    name: 'Smoke on the Water',
    bpm: 68,
    versions: {
      1: [
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 60, beats: 2 },
      ],
      2: [
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 61, beats: 1 },
        { midi: 60, beats: 2 },
      ],
      // CORRIGIDO 19/08/2026: as duas últimas notas estavam invertidas
      // (55-58, G subindo para Bb) e o nível terminava no Bb, a terça
      // menor — final sem repouso. O riff tem quatro células:
      // G-Bb-C | G-Bb-Db-C | G-Bb-C | Bb-G. Aqui a terceira célula (que é
      // repetição literal da primeira) é omitida para caber no nível, e o
      // fecho vai direto para a quarta: Bb-G, descendo para a tônica.
      // Fonte: transcrição em nomes de notas, confere nota a nota; a
      // Wikipedia confirma "melodia de quatro notas em Sol menor".
      3: [
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 61, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 58, beats: 1 }, { midi: 55, beats: 2 },
      ],
    },
  },
  {
    id: 'seven-nation-army',
    name: 'Seven Nation Army',
    bpm: 70,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 64, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 1 }, { midi: 60, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 59, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // NOVA ENTRADA — adicionada em 19/08/2026
  //
  // Registro das decisões tomadas (para quem revisar depois):
  //
  // 1. POSIÇÃO NO ARRAY: entrou no fim, logo após 'smoke-on-the-water' e
  //    'seven-nation-army', porque o arquivo já termina com o bloco de rock.
  //    Anexar no fim também é a alteração menos invasiva possível: nenhuma
  //    linha preexistente foi tocada.
  //
  // 2. CABEÇALHO NÃO ALTERADO: o comentário do topo continua dizendo
  //    "Banco de 20 melodias", embora o array agora tenha 21 itens. Foi uma
  //    decisão deliberada de não mexer em nada do código original. Fica
  //    aqui o apontamento para atualização futura, se for desejado.
  //
  // 3. ESCOLHA DA MÚSICA: o banco tinha só duas faixas de rock; o riff do
  //    Nirvana reforça essa vertente e é dos mais reconhecíveis já nos
  //    primeiros compassos — requisito importante para o público de feira.
  //
  // 4. TRANSCRIÇÃO: o riff é uma sequência de power chords F–Bb–Ab–Db.
  //    Como o banco é monofônico, usei apenas as fundamentais:
  //      F3  = 53 | Bb3 = 58 | Ab3 = 56 | Db4 = 61
  //    Todas dentro de C3-C5 (48-72), no mesmo registro grave usado por
  //    'smoke-on-the-water' (55/58/60) — coerente com riffs de guitarra.
  //
  // 5. BPM 66: o original roda a ~117 BPM, inviável para memorização.
  //    66 fica dentro da faixa 55-80 do projeto e mantém o balanço
  //    característico do riff sem virar marcha.
  //
  // 6. DURAÇÕES: só valores já usados no arquivo (0.5, 1 e 2 beats),
  //    para não introduzir nenhuma subdivisão nova no motor de áudio.
  // ---------------------------------------------------------------------
  {
    id: 'teen-spirit',
    name: 'Smells Like Teen Spirit',
    bpm: 66,
    versions: {
      // Nível 1: a célula de 4 fundamentais, 1 beat cada (4 beats no total).
      // É o mínimo que já soa como o riff.
      1: [
        { midi: 53, beats: 1 }, { midi: 58, beats: 1 },
        { midi: 56, beats: 1 }, { midi: 61, beats: 1 },
      ],
      // Nível 2: mesma célula + início da repetição, fechando em nota longa
      // (6 notas / 7 beats) — na média dos níveis 2 já existentes no banco.
      2: [
        { midi: 53, beats: 1 }, { midi: 58, beats: 1 },
        { midi: 56, beats: 1 }, { midi: 61, beats: 1 },
        { midi: 53, beats: 1 }, { midi: 58, beats: 2 },
      ],
      // Nível 3: as duas frases completas. As colcheias (0.5) em Ab-Db
      // imitam a aceleração do riff antes de voltar ao F, que encerra
      // em 2 beats dando a sensação de ciclo fechado.
      3: [
        { midi: 53, beats: 1 }, { midi: 58, beats: 1 },
        { midi: 56, beats: 1 }, { midi: 61, beats: 1 },
        { midi: 53, beats: 1 }, { midi: 58, beats: 1 },
        { midi: 56, beats: 0.5 }, { midi: 61, beats: 0.5 },
        { midi: 53, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // NOVA ENTRADA — pop, adicionada em 19/08/2026
  // Primeira música construída já pelo processo padronizado:
  // molde de melody-template.js -> regras do GUIA-melodias.md ->
  // node validate-melodies.mjs melodies.js --stats
  //
  // 1. TRECHO ESCOLHIDO: a abertura do refrão, "You can dance, you can
  //    jive". É onde a música vira reconhecível para quem não é fã, e a
  //    frase é literalmente repetida na canção — o que casa com a regra de
  //    prefixo do banco: o nível 2 é a mesma célula do nível 1 outra vez.
  //
  // 2. TONALIDADE E TRANSPOSIÇÃO: original em Lá maior. Nessa altura o
  //    refrão começa em C#5 = MIDI 73, um semitom acima do teto do teclado
  //    visível (72). Desci a melodia INTEIRA uma oitava (-12), conforme a
  //    regra R1 — nunca mexer numa nota só:
  //      C#4 = 61 | B3 = 59 | A3 = 57 | G#3 = 56 | F#3 = 54
  //
  // 3. BPM 68: o original roda a ~100 BPM, fora da faixa 55-80 do projeto.
  //    68 mantém as colcheias em 0,44 s por nota — mesma ordem de grandeza
  //    de 'tetris' (0,50 s) e 'ghostbusters' (0,47 s), ou seja, já provado
  //    como tocável pelo público da feira.
  //
  // 4. RITMO: "You can" são duas colcheias e "dance" é a nota sustentada.
  //    Daí o padrão 0.5 / 0.5 / longa que se repete a cada célula.
  //
  // 5. ATENÇÃO NA REVISÃO — o rabo do nível 3 (A-G#-F#, o "having the time
  //    of your life") é a parte menos verificada da transcrição: veio de
  //    uma única fonte e eu simplifiquei para uma descida por graus
  //    conjuntos. Os níveis 1 e 2 estão sólidos. Antes da feira, ouça o
  //    nível 3 no jogo e ajuste as três últimas notas se soar estranho —
  //    mexer nelas não quebra nenhuma regra, porque são o sufixo.
  // ---------------------------------------------------------------------
  {
    id: 'dancing-queen',
    name: 'Dancing Queen',
    bpm: 68,
    versions: {
      // Nível 1: "You can dance" — 3 notas, 3 beats, 2,6 s.
      1: [
        { midi: 61, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 59, beats: 2 },
      ],
      // Nível 2: + "you can jive", a repetição literal da célula.
      // A 3ª nota encurta de 2 para 1 beat porque a frase continua.
      2: [
        { midi: 61, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 59, beats: 1 },
        { midi: 61, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 59, beats: 2 },
      ],
      // Nível 3: + a descida A-G#-F# que fecha a frase, pousando em F#
      // (a 6ª de Lá maior) com 2 beats para dar sensação de encerramento.
      3: [
        { midi: 61, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 59, beats: 1 },
        { midi: 61, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 59, beats: 1 },
        { midi: 57, beats: 0.5 }, { midi: 56, beats: 0.5 },
        { midi: 54, beats: 2 },
      ],
    },
  },
  // =====================================================================
  // LOTE 27/08/2026 — 8 novas músicas (pedido da produção)
  //
  // Processo: pesquisa de transcrições externas ANTES de escrever cada
  // entrada (letter notes com oitava quando havia, tonalidade e BPM do
  // original conferidos no Hooktheory quando a música existia lá).
  // Fontes e decisões anotadas inline, entrada por entrada.
  //
  // Como nos lotes anteriores: nenhuma linha preexistente foi tocada;
  // só append no fim do array. Regras seguidas: range C3-C5 (48-72),
  // BPM 55-80, nível N é prefixo do nível N+1 (só a duração da nota de
  // fronteira muda), durações já usadas no arquivo (0.5 / 1 / 2).
  //
  // REVISADO NO MESMO DIA (27/08): a produção apontou que a 1ª versão
  // do lote estourava o comprimento padrão do banco. Medido nas 22
  // entradas anteriores, o padrão é: nível 1 com 3-4 notas, nível 2
  // com 4-7, nível 3 com 7-10. Sete foram comprimidas para dentro
  // dessas faixas ('in-the-end' já nasceu no padrão) — o que exigiu
  // cortar letra/células em várias (corte documentado entrada a
  // entrada, com os MIDIs do material removido anotados para o caso de
  // o padrão mudar um dia). Nenhuma música precisou ser removida.
  //
  // SUSPEITOS DESTE LOTE (mesma lógica da revisão de 19/08 — dúvida
  // registrada é melhor que palpite silencioso):
  //   golden ......... as OITAVAS da 2ª célula ("now I'm shinin'") são
  //                    leitura minha; as fontes dão as letras sem oitava.
  //   fate-of-ophelia  o fecho "li-a" (F-E) veio de fonte única.
  //   popipo ......... fonte única; o padrão bate sílaba a sílaba com o
  //                    "po pi po", mas ninguém conferiu de ouvido.
  //   perry .......... registro baixo/metais comprimido de propósito e
  //                    resposta dos metais simplificada; ver nota.
  //   bluey .......... nível 3 termina na 5ª (B) porque o tema é um loop
  //                    sem nota de repouso no trecho; truncamento
  //                    consciente, como em 'indiana-jones'.
  // =====================================================================
  // ---------------------------------------------------------------------
  // Golden — HUNTR/X (KPop Demon Hunters, 2025)
  //
  // 1. TRECHO: o pré-refrão "I'm done hidin', now I'm shinin', like I'm
  //    born to be" — a linha mais cantada da música, com estrutura
  //    natural de 3 células que casa perfeitamente com os 3 níveis.
  //
  // 2. FONTES: letter notes (Mint Music) + notas com oitava
  //    ("E* G* C** B*" = E4 G4 C5 B4, pianokeyboardnotes) + Hooktheory
  //    (Sol maior, ~123 BPM; pré-refrão entre D4 e E5). Duas fontes
  //    independentes concordam nas letras: E G C B | D G E D | F# A D C B.
  //
  // 3. OITAVAS DA 2ª CÉLULA — SUSPEITO: as fontes não marcam oitava em
  //    "now I'm shinin'". Adotei D4 G4 E5 D5 (usa exatamente os dois
  //    extremos D4-E5 que o Hooktheory registra para o pré-refrão).
  //    A alternativa seria D5 G4 E4 D4. Se soar estranho, é aqui.
  //
  // 4. TRANSPOSIÇÃO: em Sol maior o topo é E5 = 76, acima do teto 72.
  //    Desci a melodia INTEIRA -4 semitons (regra R1) — fica em Mi♭
  //    maior, e o topo vira C5 = 72, exatamente no teto:
  //      C4=60 Eb4=63 Ab4=68 G4=67 | Bb3=58 Eb4=63 C5=72 Bb4=70
  //
  // 5. CORTE (revisão 27/08): a 3ª célula, "like I'm born to be",
  //    ficou DE FORA — com ela o nível 3 ia a 13 notas, muito acima do
  //    teto de 10 do padrão. O nível 3 fecha a frase em "shinin'"
  //    (C5 -> Bb4). Se o padrão de comprimento mudar um dia, os MIDIs
  //    da célula cortada são: 62 65 70 68 67 (0.5/0.5/1/1/2).
  //
  // 6. BPM 64: original ~123; colcheias a 0,47 s, faixa já provada.
  // ---------------------------------------------------------------------
  {
    id: 'golden',
    name: 'Golden (HUNTR/X)',
    bpm: 64,
    versions: {
      // Nível 1: "I'm done hidin'" — o salto E-G-C que abre a linha.
      1: [
        { midi: 60, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 68, beats: 1 }, { midi: 67, beats: 2 },
      ],
      // Nível 2: + "now I'm shi—", parando no pico C5 sustentado.
      2: [
        { midi: 60, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 68, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 58, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 72, beats: 2 },
      ],
      // Nível 3: + o "-nin'" (C5 -> Bb4) que resolve a palavra e fecha
      // a frase. Acrescenta uma nota só, como 'seven-nation-army'.
      3: [
        { midi: 60, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 68, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 58, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 72, beats: 1 }, { midi: 70, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // The Fate of Ophelia — Taylor Swift (The Life of a Showgirl, 2025)
  //
  // 1. TRECHO (revisado 27/08): "saved my heart from the fate of
  //    Ophelia" — a metade do refrão que carrega o TÍTULO. A 1ª versão
  //    do lote começava em "dug me out of my grave and" (Bb4 pulsando
  //    6x e caindo no A), mas o refrão inteiro precisa de 18-19 notas,
  //    o dobro do teto do padrão. Cortei a primeira metade; MIDIs do
  //    material removido: 70 70 70 70 70 70 69 (0.5 cada, último 2).
  //
  // 2. FONTES: Hooktheory (refrão em FÁ MAIOR, ~124 BPM, melodia entre
  //    C4 e C5 — caso raro: cabe INTEIRA no range sem transposição) +
  //    notas com oitava do pianokeyboardnotes (A4 repetido com pico
  //    rápido em C5, fecho descendo C5-F4-E4).
  //
  // 3. FUSÃO DE UMA SÍLABA: "...the fate of O-phe-li-a" tem uma nota
  //    por sílaba; para caber em 10, "of" e "O" (dois A4 seguidos)
  //    viraram UM A4 de 1 beat. É o único retoque rítmico.
  //
  // 4. SUSPEITO: o fecho "li-a" (F4-E4) veio de fonte única; o resto
  //    (A repetido -> pico C5) confere com o range do Hooktheory.
  //
  // 5. BPM 64: original ~124; colcheias a 0,47 s.
  // ---------------------------------------------------------------------
  {
    id: 'fate-of-ophelia',
    name: 'The Fate of Ophelia',
    bpm: 64,
    versions: {
      // Nível 1: "saved my heart from" — o pulso em A4, marca do refrão.
      1: [
        { midi: 69, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 69, beats: 0.5 }, { midi: 69, beats: 2 },
      ],
      // Nível 2: + "the fate of" — o pico rápido em C5 ("the", conforme
      // a fonte) voltando ao A.
      2: [
        { midi: 69, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 69, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 72, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 69, beats: 2 },
      ],
      // Nível 3: + "O-phe-li-a" ("of O" fundidos no A anterior), o
      // título caindo em E4 sobre o acorde de Dó (fonte única para o
      // F-E final — ver SUSPEITOS).
      3: [
        { midi: 69, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 69, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 72, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 69, beats: 1 },
        { midi: 72, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 64, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // POP/STARS — K/DA (League of Legends, 2018)
  //
  // 1. TRECHO: o riff de abertura — o sintetizador pulsante sobre pedal
  //    de Ré, antes de "You know who it is". É a assinatura sonora da
  //    faixa e só usa nota repetida em três alturas: dos trechos mais
  //    fáceis de memorizar do banco.
  //
  // 2. FONTE: letter notes (pianoletternotes): g-g-g-g F#-F#-F#-F#
  //    A-A-A na oitava 5, com baixo d-a. Hooktheory dá ~170 BPM no
  //    original (o refrão de lá está anotado em Ré menor; o riff usa o
  //    F#, então o modo do trecho é ambíguo de propósito — mantive as
  //    notas da fonte, sem "corrigir" nada).
  //
  // 3. TRANSPOSIÇÃO: -12 (regra R1): G4=67, F#4=66, A4=69.
  //
  // 4. COMPRESSÃO DOS PULSOS (revisão 27/08): na fonte cada degrau
  //    pulsa 4x (G) / 4x (F#) / 3x (A) = 11 notas, acima do teto de 10.
  //    Aqui cada degrau pulsa 3x e o 4º pulso vira o SUSTAIN da última
  //    nota do degrau (0.5+0.5+2 beats ocupam o mesmo tempo dos 4
  //    pulsos). O desenho G->F#->A e o tempo total ficam idênticos.
  //
  // 5. BPM 70: os pulsos de colcheia ficam a 0,43 s — próximos das
  //    colcheias do original a 170 (0,35 s), sem perder o caráter.
  // ---------------------------------------------------------------------
  {
    id: 'pop-stars',
    name: 'POP/STARS (K/DA)',
    bpm: 70,
    versions: {
      // Nível 1: o degrau do G (3 pulsos + sustain).
      1: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 2 },
      ],
      // Nível 2: + o degrau do F#.
      2: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 66, beats: 0.5 }, { midi: 66, beats: 0.5 },
        { midi: 66, beats: 2 },
      ],
      // Nível 3: o ciclo inteiro, fechando no degrau do A.
      3: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 66, beats: 0.5 }, { midi: 66, beats: 0.5 },
        { midi: 66, beats: 0.5 },
        { midi: 69, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 69, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // Tema do Perry, o Ornitorrinco — Phineas e Ferb (Danny Jacob)
  //
  // 1. TONALIDADE: Sol menor (a versão piano do Sheet Music Boss está em
  //    Sol menor; a partitura fácil da Musicnotes em Ré menor é arranjo
  //    transposto — usei Sol menor, que também casa com o registro de
  //    'smoke-on-the-water').
  //
  // 2. FONTE: letter notes (pianoletternotes): baixo G-G-A-G-Bb | C-G na
  //    oitava 2 + resposta dos metais d-f-g-f-d na oitava 5.
  //
  // 3. REGISTRO COMPRIMIDO — DECISÃO CONSCIENTE: o baixo subiu +12
  //    (G3=55, A3=57, Bb3=58, C4=60) e a resposta dos metais desceu -12
  //    (D4=62, F4=65, G4=67) para os DOIS caberem nas 2 oitavas do
  //    teclado. O intervalo real entre baixo e metais foi encolhido; o
  //    contorno DENTRO de cada célula está preservado. O jogo é
  //    monofônico, então emendar baixo + resposta em sequência (nível 3)
  //    é liberdade de arranjo, registrada aqui.
  //
  // 4. SUSPEITO: a resposta "d-f-g-f-d" veio de fonte única e foi
  //    simplificada (o lick original tem mais notas de passagem).
  //
  // 5. CORTES (revisão 27/08): o nível 1 para no 4º "dun" (o Bb, a
  //    nota que colore o riff, entra no nível 2 — mesmo espírito de
  //    'star-wars', cujo nível 1 são só os três G). E a resposta dos
  //    metais perdeu a volta F-D: fica D-F-G, fechando sustentado no
  //    G4, a tônica uma oitava acima do baixo. MIDIs da volta cortada:
  //    65 62 (0.5 / 2).
  //
  // 6. BPM 72: o "dun dun dun" grave precisa de algum balanço para ser
  //    reconhecido; 72 é o teto confortável da faixa do projeto.
  // ---------------------------------------------------------------------
  {
    id: 'perry-ornitorrinco',
    name: 'Perry, o Ornitorrinco',
    bpm: 72,
    versions: {
      // Nível 1: o baixo "dun dun dun dun—" (G-G-A-G).
      1: [
        { midi: 55, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 55, beats: 2 },
      ],
      // Nível 2: + o Bb que colore o riff e a virada C-G.
      2: [
        { midi: 55, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 58, beats: 1 }, { midi: 60, beats: 0.5 },
        { midi: 55, beats: 2 },
      ],
      // Nível 3: + a resposta dos metais ("dooby dooby doo"), subindo
      // D-F-G e fechando na tônica aguda.
      3: [
        { midi: 55, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 58, beats: 1 }, { midi: 60, beats: 0.5 },
        { midi: 55, beats: 1 },
        { midi: 62, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 67, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // PoPiPo — Hatsune Miku (Lamaze-P, 2008)
  //
  // 1. TRECHO: o refrão "po pi po pi po po pi po" (a do suco de vegetais).
  //
  // 2. FONTE ÚNICA — SUSPEITO: letter notes (pianoletternotes). O padrão
  //    decodificado — C5-G4-C5-G4-C5-D5-G5-D5, oito pulsos iguais —
  //    bate SÍLABA A SÍLABA com "po pi po pi po po pi po", o que dá
  //    confiança na leitura; mas ninguém da equipe conferiu de ouvido, e
  //    o BPM do original não foi confirmado em fonte nenhuma (a faixa é
  //    bem rápida, na casa dos 150+).
  //
  // 3. TRANSPOSIÇÃO: -12 (regra R1): C4=60, G3=55, D4=62, G4=67. O
  //    quique de oitava C<->G é o charme do trecho e sobreviveu inteiro.
  //
  // 4. BPM 70: pulsos de colcheia a 0,43 s.
  //
  // 5. REVISÃO 27/08: níveis comprimidos para 4/7/9. O nível 3 agora
  //    fecha a célula de 8 sílabas e pousa no C do reinício (fecho de
  //    ciclo, como 'teen-spirit') em vez de repetir a célula inteira.
  // ---------------------------------------------------------------------
  {
    id: 'popipo',
    name: 'PoPiPo (Hatsune Miku)',
    bpm: 70,
    versions: {
      // Nível 1: "po pi po pi—" — o quique C-G-C-G.
      1: [
        { midi: 60, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 55, beats: 2 },
      ],
      // Nível 2: + "po po pi", subindo ao pico G4 sustentado.
      2: [
        { midi: 60, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 62, beats: 0.5 },
        { midi: 67, beats: 2 },
      ],
      // Nível 3: + o "po" final da célula (D) e o C do reinício como
      // fecho de ciclo.
      3: [
        { midi: 60, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 55, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 62, beats: 0.5 },
        { midi: 67, beats: 0.5 }, { midi: 62, beats: 0.5 },
        { midi: 60, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // Hakuna Matata — O Rei Leão (Elton John / Tim Rice)
  //
  // 1. FONTES: DUAS independentes concordam no desenho cromático de
  //    "Ha-ku-na ma-ta-ta" = D-Eb-D Eb-D-C (noobnotes, com oitavas;
  //    pianoletternotes, mesmo contorno). "What a wonderful phrase" =
  //    A-C-C-A-C-D e "Ain't no passing craze" = A-C-Eb-D-D (noobnotes).
  //
  // 2. TRANSPOSIÇÃO: -12 (regra R1) — a fonte está na oitava 5 (D5=74 e
  //    Eb5=75 estouram o teto 72): D4=62, Eb4=63, C4=60, A3=57.
  //
  // 3. CORTES (revisão 27/08): a frase-resposta inteira tem 6 sílabas
  //    ("what a wonderful phrase") e estourava o teto de 10 notas do
  //    padrão. Ficou de fora o pickup "what a" (MIDIs 57 60, 0.5 cada)
  //    — o nível 3 emenda direto em "won-der-ful phrase" (C-A-C-D), a
  //    parte melódica da resposta. "Ain't no passing craze" nunca
  //    coube (MIDIs, se um dia servir: 57 60 63 62 62).
  //
  // 4. BPM 64: original ~132; as colcheias ficam a 0,47 s.
  // ---------------------------------------------------------------------
  {
    id: 'hakuna-matata',
    name: 'Hakuna Matata (O Rei Leão)',
    bpm: 64,
    versions: {
      // Nível 1: "Ha-ku-na ma—" — o balanço cromático D-Eb-D-Eb.
      1: [
        { midi: 62, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 62, beats: 1 }, { midi: 63, beats: 2 },
      ],
      // Nível 2: "Ha-ku-na ma-ta-ta!" completo, assentando no C.
      2: [
        { midi: 62, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 62, beats: 1 },
        { midi: 63, beats: 0.5 }, { midi: 62, beats: 0.5 },
        { midi: 60, beats: 2 },
      ],
      // Nível 3: + "won-der-ful phrase" (C-A-C-D), a resposta sem o
      // pickup "what a" — ver CORTES acima.
      3: [
        { midi: 62, beats: 0.5 }, { midi: 63, beats: 0.5 },
        { midi: 62, beats: 1 },
        { midi: 63, beats: 0.5 }, { midi: 62, beats: 0.5 },
        { midi: 60, beats: 1 },
        { midi: 60, beats: 0.5 }, { midi: 57, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 62, beats: 2 },
      ],
    },
  },
  // ---------------------------------------------------------------------
  // In The End — Linkin Park (Hybrid Theory, 2000)
  //
  // 1. TRECHO: o riff de piano da introdução — reconhecível na primeira
  //    nota longa seguida do desenho descendente.
  //
  // 2. FONTE: transcrição em nomes de notas (pianokeyboardnotes):
  //    D | A-A-F | E-E-E | (E-F), sobre acordes Dm-C-Bb-C — arranjo em
  //    teclas brancas (Ré menor); o original está um semitom ACIMA, em
  //    Mi♭ menor. Mantive o arranjo em Ré menor: mesma decisão de
  //    praticidade das fontes, e a transposição global não altera o
  //    reconhecimento.
  //
  // 3. TRANSPOSIÇÃO: -12 do arranjo (o riff original toca na oitava 5;
  //    D5=74 estoura o teto): D4=62, A3=57, F3=53, E3=52.
  //
  // 4. NÍVEL 3 fecha no D da repetição do ciclo (2 beats) — mesmo
  //    recurso de 'teen-spirit' e 'popipo': o riff é um loop, e o D de
  //    retorno é o que dá sensação de fechamento.
  //
  // 5. BPM 66: original ~105.
  // ---------------------------------------------------------------------
  {
    id: 'in-the-end',
    name: 'In The End (Linkin Park)',
    bpm: 66,
    versions: {
      // Nível 1: D longo e a queda A-A-F — o gesto que abre o riff.
      1: [
        { midi: 62, beats: 1 }, { midi: 57, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 53, beats: 2 },
      ],
      // Nível 2: + o E repetido três vezes.
      2: [
        { midi: 62, beats: 1 }, { midi: 57, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 53, beats: 1 },
        { midi: 52, beats: 0.5 }, { midi: 52, beats: 0.5 },
        { midi: 52, beats: 2 },
      ],
      // Nível 3: + a passagem E-F e o D de retorno do loop.
      3: [
        { midi: 62, beats: 1 }, { midi: 57, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 53, beats: 1 },
        { midi: 52, beats: 0.5 }, { midi: 52, beats: 0.5 },
        { midi: 52, beats: 1 },
        { midi: 52, beats: 0.5 }, { midi: 53, beats: 0.5 },
        { midi: 62, beats: 2 },
      ],
    },
  },
];

export function pickRandomMelody(excludeId) {
  let pool = MELODIES.filter((m) => m.id !== excludeId);
  if (pool.length === 0) pool = MELODIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Modo fácil: quantas notas cada estágio usa. As notas são o começo da versão
// mais longa (nível 3) da mesma música, então a melodia cresce de estágio em
// estágio (2, depois 4, depois 6 notas) sem precisar de transcrições novas.
export const NOTAS_MODO_FACIL = { 1: 2, 2: 4, 3: 6 };

// modo: 'facil' | 'desafio'. O modo desafio usa as versões escritas para
// cada nível (o funcionamento original do jogo).
export function resolveMelody(melody, level, modo = 'desafio') {
  if (modo === 'facil') {
    const longa = melody.versions[3] || melody.versions[2] || melody.versions[1];
    const qtd = NOTAS_MODO_FACIL[level] || NOTAS_MODO_FACIL[1];
    const notes = longa.slice(0, qtd).map((n) => ({ ...n }));
    // A última nota ganha pelo menos 1,5 tempo: o trecho cortado termina com
    // respiro, em vez de parar seco numa colcheia.
    const ultima = notes[notes.length - 1];
    if (ultima && ultima.beats < 1.5) ultima.beats = 1.5;
    return { id: melody.id, name: melody.name, bpm: melody.bpm, notes };
  }
  const notes = melody.versions[level] || melody.versions[1];
  return {
    id: melody.id,
    name: melody.name,
    bpm: melody.bpm,
    notes,
  };
}
