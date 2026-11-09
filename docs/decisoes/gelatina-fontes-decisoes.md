# Gelatina: fontes de acento composto fora do menu e Oi (09/11/2026)

- Saíram do menu do Gelatina as 4 fontes sem acentos que usavam acento composto de outra fonte (Anak Gedong, Howdybun, Cheee demo, Camelion demo): a equipe achou o resultado artificial. Retiradas de TODAS_AS_FONTES (src/gelatina/constants.ts) e os @font-face delas saíram do index.html. Os arquivos seguem em public/fontes, sem uso; o recurso comporAcento continua no motor, sem nenhuma fonte usando.
- Quem tinha uma delas salva no localStorage cai no padrão (Modak), pela checagem que já existia em GelatinaApp.
- Entrou a Oi (Google Fonts, Kostas Bartsokas, SIL OFL 1.1), embutida como arquivo para funcionar offline: public/fontes/Oi.woff2 (subconjunto latino do @fontsource/oi 5.3.0) + OFL-Oi.txt, @font-face no index.html, categoria "Fontes", entre Modak e Papyrus. Tem ó, é, á próprios (acento desenhado pelo autor, fundido à letra).
- Todas as fontes do menu agora têm acentos próprios. LEIA-ME.txt e LICENCAS.txt de public/fontes atualizados.
- Conferido: build e tsc sem erros; arquivos gravados no computador conferidos byte a byte.
