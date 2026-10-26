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

Arquivos do Design System Conectando (400 × 194, fundo transparente). Nunca
recolorir, distorcer nem aplicar sombra.

| Arquivo | O que é | Onde aparece |
|---|---|---|
| `marca-azul.png` | Marca em azul `#1666B0`, para fundo claro | Barra do topo, tema claro do Tipográfico e do Gelatina · `src/App.tsx` |
| `marca-branca.png` | Marca branca, para a tinta `#10263F` ou o azul | Barra do topo, tema escuro dos três jogos · `src/App.tsx` |

## moldura/

| Arquivo | O que é | Onde aparece |
|---|---|---|
| `faixa-maos.png` | Faixa das mãos azul e rosa (1974 × 128) | Desligada (`MOSTRAR_FAIXA = false` em `src/shared/ui/FaixaMaos.tsx`): no layout novo do Genius as mãos ficam no rodapé (`maos-rodape.png`) |
| `maos-rodape.png` | Traço branco com as mãos se cumprimentando (912 × 276, fundo transparente) | Rodapé do Genius, centralizado · `src/genius/GeniusView.tsx` |
| `faixa-maos-clara.png` | Faixa das mãos azul-marinho e azul (1912 × 128) | Desligada, como a anterior; guardada como original |

## genius/

| Arquivo | O que é | Onde aparece |
|---|---|---|
| `laco-esquerda.png` | Laço da marca, branco com 20% de opacidade no arquivo. Usado duas vezes: espelhado no canto superior direito e, menor e girado, no canto inferior esquerdo | Fundo do Genius · `src/genius/GeniusView.tsx` (posição em `genius.css`) |
| `laco-esquerda-amarelo.png` | O mesmo laço em amarelo `#F2E299`, chapado | Não usada no app desde que o Genius ficou só com o tema escuro; guardada como original |
| `laco-direita.png` | Laço da marca, branco com 20% de opacidade no arquivo | Não usada desde o layout novo do Genius: o desenho é recortado nas quatro bordas e o corte aparecia no canto da tela; guardada como original |
| `laco-direita-amarelo.png` | O mesmo laço em amarelo `#F2E299`, chapado | Não usada no app desde que o Genius ficou só com o tema escuro; guardada como original |
| `laco-esquerda.svg` | Versão vetorial do laço da esquerda | Não usada no app; guardada como original |
| `laco-direita.svg` | Versão vetorial do laço da direita | Não usada no app; guardada como original |

