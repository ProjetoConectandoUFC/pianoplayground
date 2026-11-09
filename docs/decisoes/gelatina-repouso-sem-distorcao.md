# Gelatina: letras sem distorção em repouso (09/11/2026)

- Problema: no sistema latino (Dó, Ré, Mi...), as letras paradas saíam deformadas, a ponto de mudar a cara da fonte. Havia duas causas no motor (src/gelatina/services/gelatinaEngine.ts):
  1. Cada letra tinha largura e altura sorteadas separadas (0,88 a 1,22 cada), então ficava gorda ou espichada.
  2. A palavra inteira era esticada só na vertical (sy = sx * kv) para encher a altura da tela.
- Correção: em repouso, a letra e a palavra usam a mesma escala na largura e na altura, nos dois sistemas. O sorteio por letra continua mudando o tamanho (média das duas escalas), sem mudar a proporção. Desalinho de altura e leve rotação continuam, porque não deformam o desenho.
- Arranjo (buildHomes): em vez de esticar, o motor testa de 1 a 5 linhas e fica com a que ocupa mais área sem passar da tela. Se sobra altura, o bloco fica centralizado; se falta, tudo encolhe por igual.
- A deformação durante o toque (esticar, entortar, tremer) e os efeitos das fontes mutáveis continuam como estavam: são parte da brincadeira.
- O sistema anglicano já usava escala igual nos dois sentidos e não mudou.
- Conferido: as 29 fontes do menu, nos dois sistemas, ficam com proporção 1:1 em repouso (medida nos transforms de palavras e letras). Arranjo visto em tela padrão, larga (1280x560) e em pé (600x900). tsc e build sem erros.