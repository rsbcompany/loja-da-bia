# Logs

> O log é o sensor de feedback do projeto: o que o processo diz alimenta a
> próxima decisão.

## 1. Saída do processo vai para arquivo de log

Sempre que algo for executado (dev server, build, teste, script Python, seed),
grave a saída em arquivo de log — inclusive `stdout` e `stderr`.

```sh
# desenvolvimento
bun run dev 2>&1 | tee logs/dev.log

# build
bun run build 2>&1 | tee logs/build.log

# testes
bun run test 2>&1 | tee logs/test.log

# seed
python3 tools/build_seed.py 2>&1 | tee logs/seed.log
```

Convenção: um arquivo por processo em `logs/`, com data no nome quando o
processo for puntual (`logs/build-2026-10-01.log`).

## 2. Problema aconteceu → leia o log

Antes de qualquer depuração por suposição, leia o arquivo de log do processo
que falhou. A mensagem original (stack trace, número da linha, query rejeitada)
está lá — reproduzir o erro "de cabeça" perde informação.

```sh
tail -n 100 logs/build.log
grep -n -i "error\|failed\|✕" logs/test.log
```

Ordem obrigatória: **ler o log → entender a causa → corrigir → rodar de novo →
conferir o log limpo.**

## 3. Log como sensor de feedback para a LLM

Quando um agente/LLM executa algo e algo falha, o conteúdo do log é devolvido
para a próxima iteração como entrada — é ele que define o que corrigir. Não se
corrige código sem antes consumir o log do processo que falhou.

- roda o comando com `tee logs/<processo>.log`;
- falhou → lê o log e cola a mensagem relevante no próximo passo;
- corrige → roda de novo → só encerra quando o log sair sem erro.

## 4. Higiene

- `logs/` fica fora do Git (`.gitignore`) — log é artefato de execução, não
  código.
- Log de processo longo (dev server) é truncado/recriado a cada execução.
- Nada de segredo no log: senha, token e chave nunca são impressos.

## Vínculos

- [AGENTS.md](../../AGENTS.md) — comandos cuja saída deve ser logada.
- [tests.md](./tests.md) — teste falho: log antes de corrigir.
- [database.md](./database.md) — query rejeitada/plano lento: log do `psql`
  entra no ciclo de feedback.
