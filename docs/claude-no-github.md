# Como ligar o Claude ao repositório no GitHub

Repositório: github.com/ProjetoConectandoUFC/pianoplayground

Quem faz a configuração precisa ser administrador do repositório (ou da organização
ProjetoConectandoUFC).

## Caminho rápido (pelo Claude Code)

1. Instale o GitHub CLI (cli.github.com) e rode `gh auth login`.
2. Abra o Claude Code dentro da pasta do projeto e digite `/install-github-app`.
3. Siga as telas: ele instala o app Claude no repositório, grava o segredo (assinatura ou
   chave da API) e abre um pull request com o arquivo do workflow.
4. Aprove o pull request. Pronto.

Se usar este caminho, o `.github/workflows/claude.yml` deste pacote pode ser descartado
(o comando cria o dele).

## Caminho manual

1. Instale o app Claude no repositório: https://github.com/apps/claude
   (permissões de leitura e escrita em Contents, Issues e Pull requests).
2. Crie um segredo em Settings > Secrets and variables > Actions > New repository secret:
   - `CLAUDE_CODE_OAUTH_TOKEN`, se a equipe usa assinatura Claude (Pro, Max, Team ou
     Enterprise). Gere o valor no computador com `claude setup-token`.
   - ou `ANTHROPIC_API_KEY`, se for pela API (chave criada em platform.claude.com). Nesse
     caso, troque a linha indicada em `.github/workflows/claude.yml`.
3. Faça commit e push do `.github/workflows/claude.yml` (já está neste pacote).

## Como usar

- Numa issue ou num pull request, escreva um comentário começando com `@claude`, por exemplo:
  `@claude no Gelatina, troque a cor padrão do Sol para o laranja do Design System`.
- O Claude responde no mesmo lugar, mostra o progresso e abre um pull request com a mudança.
- Ele segue o `CLAUDE.md` da raiz do repositório em toda execução.
- Só quem tem permissão de escrita no repositório consegue acionar o Claude.

Documentação oficial: https://code.claude.com/docs/en/github-actions
