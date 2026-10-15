# Imagens do Piano Interativo

Todas as imagens usadas na composição das telas ficam nesta pasta. Elas são
importadas pelo código e o Vite as embute no build, então o app funciona sem
internet, também no Electron empacotado. As fontes ficam à parte, em
`public/fontes` (veja o LEIA-ME de lá).

Para trocar uma imagem, substitua o arquivo mantendo o mesmo nome. O tamanho
pode mudar: as faixas das mãos medem a proporção da imagem sozinhas e ocupam
a largura da tela; logos e laços são redimensionados pelo CSS. Para as faixas
encostarem nas bordas, os braços devem terminar retos nas laterais da imagem.

Para acrescentar uma imagem nova, coloque-a na subpasta certa, importe-a no código
(`import minhaUrl from '../assets/...'`) e registre-a na tabela abaixo.

## marca/

| Arquivo | O que é | Onde aparece |
|---|---|---|
| `logo-conectando-azul.png` | Logo Conectando em azul, para fundo claro | Barra do topo, tema claro do Tipográfico e do Gelatina · `src/App.tsx` |
| `logo-conectando-creme.png` | Logo Conectando em creme, para fundo escuro | Barra do topo, tema escuro dos três jogos · `src/App.tsx` |

## moldura/

| Arquivo | O que é | Onde aparece |
|---|---|---|
| `faixa-maos.png` | Faixa das mãos azul e rosa (1974 × 128) | Logo abaixo da barra, tema escuro dos três jogos · `src/shared/ui/FaixaMaos.tsx` |
| `faixa-maos-clara.png` | Faixa das mãos azul-marinho e azul (1912 × 128) | Logo abaixo da barra, tema claro dos três jogos · `src/shared/ui/FaixaMaos.tsx` |

## genius/

| Arquivo | O que é | Onde aparece |
|---|---|---|
| `laco-esquerda.png` | Laço da marca, canto superior esquerdo, branco com 20% de opacidade no arquivo | Fundo do Genius no tema escuro · `src/genius/GeniusView.tsx` |
| `laco-esquerda-amarelo.png` | O mesmo laço em amarelo `#F2E299`, chapado | Não usada no app desde que o Genius ficou só com o tema escuro; guardada como original |
| `laco-direita.png` | Laço da marca, canto inferior direito, branco com 20% de opacidade no arquivo | Fundo do Genius no tema escuro · `src/genius/GeniusView.tsx` |
| `laco-direita-amarelo.png` | O mesmo laço em amarelo `#F2E299`, chapado | Não usada no app desde que o Genius ficou só com o tema escuro; guardada como original |
| `laco-esquerda.svg` | Versão vetorial do laço da esquerda | Não usada no app; guardada como original |
| `laco-direita.svg` | Versão vetorial do laço da direita | Não usada no app; guardada como original |
