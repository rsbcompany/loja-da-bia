# Loja da Bia

Aplicativo local-first para gestão de pedidos, clientes, catálogo, resumo
financeiro, revisão de duplicados e backup. O armazenamento atual usa IndexedDB
no navegador.

**Os dados versionados são sintéticos para demonstração.** Os arquivos locais
com dados originais ficam em `private-data/originals/`, pasta ignorada pelo Git.
Antes de usar dados reais em uma instalação compartilhada ou pública, configure
uma API autenticada com banco de dados privado; o app ainda não possui backend.

## Desenvolvimento

Requisitos: Bun e Python 3.

```sh
bun install
bun run dev
```

Para regenerar o seed sintético a partir de `tools/pedidos.csv`:

```sh
python3 tools/build_seed.py
```
