# Piano Playground (Piano Interativo)

Aplicativo desktop do projeto Conectando (UFC Virtual) que une três jogos com teclado MIDI
(AKAI MPK Mini) ou teclado do computador: Genius do Piano, Piano Tipográfico e Piano Gelatina.
Repositório: github.com/ProjetoConectandoUFC/pianoplayground (branch de trabalho: `teste`).

## Comandos

- `npm install` e depois `npm run dev` (navegador; Chrome/Edge para Web MIDI)
- `npm run electron:dev` (desktop)
- `npm run build` (Vite) e `npx tsc --noEmit -p .` (checagem de tipos) antes de dar algo por pronto
- Instaladores: `npm run dist:win` / `npm run dist:mac` (o workflow `build-installers.yml` gera em tags `v*`)

## Mapa do código

- `src/App.tsx`: monta os três jogos. O Genius fica sempre montado (só oculto); Tipográfico e Gelatina montam e desmontam.
- `src/genius/`: JS vanilla montado direto no DOM (`renderer.js`, `game.js`, `piano.js`, `melodies.js`, `tomates.js`, `espelho.js` para o telão). CSS escopado em `.genius-root` (`genius.css`).
- `src/gelatina/`: React + motor em texto (`services/gelatinaEngine.ts`). Fontes e cores em `constants.ts` (`TODAS_AS_FONTES`).
- `src/typographic/`: Piano Tipográfico (React).
- `src/shared/`: entrada MIDI/teclado, janela de projeção (`projectionWindow.ts`) e a moldura comum (`ui/`: gaveta, barra, `LacosFundo`, tokens em `ui.css`).
- `src/fonts.ts`: fontes do Google embutidas via `@fontsource`. As que não vêm de pacote ficam em `public/fontes`, declaradas no `index.html`, com licenças em `LICENCAS.txt` e `OFL-*.txt`.
- `src/assets/`: imagens e áudio (catálogo em `src/assets/LEIA-ME.md`).

## Regras do projeto

- O app precisa funcionar 100% offline (Electron em evento). Nada de CDN ou Google Fonts por link: fonte nova entra como arquivo em `public/fontes` (ou pacote `@fontsource`) e licença junto.
- Toda fonte do menu do Gelatina precisa ter ó, é, á próprios. Acento composto de outra fonte foi rejeitado pela equipe (09/11/2026).
- Visual segue o Design System Conectando: cores chapadas, sem gradiente, sem desfoque, sombras chapadas, Poppins na interface. Cores de identidade: rosa #FF6776, turquesa #24C0C0, céu #3BB8FF, rosa antigo #DD6A75, laranja #D86F33, azul médio #4074B2, roxo #A740B2.
- Textos da interface em português do Brasil, tratando por "você". Não usar travessão (só em diálogos).
- Comentários do código em português, explicando o porquê das escolhas.
- Preferências salvas em localStorage mudam de formato com flags de migração (ex.: `coresIdentidadeV2`, `lacosV2`); siga esse padrão.
- A janela de projeção (telão) precisa refletir qualquer mudança visual; teste os dois.
- Registre decisões novas em `docs/decisoes/` (data, o que mudou, por quê).

## Histórico de decisões

Leia antes de mexer em cada jogo:

- `docs/decisoes/genius-layout-decisoes.md`: Genius (tela, modos fácil e desafio, tomate, telão), laços e cores dos pianos.
- `docs/decisoes/gelatina-fontes-decisoes.md`: fontes do Gelatina.
