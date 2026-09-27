# Pokédex Notes API

API REST de anotações para a [Pokédex](https://github.com/Synndm/Pokedex-test). Permite criar, listar, editar e excluir anotações sobre cada Pokémon.

Feita com **Node.js + Express + TypeScript**, usando o [crudcrud](https://crudcrud.com) como banco de dados.

## Arquitetura

```
Front (React)  ──►  Notes API (Express)  ──►  crudcrud
                    valida, trata erros        armazena os dados
```

O front nunca fala direto com o crudcrud. Isso esconde a URL secreta do banco, centraliza a validação e permite trocar o crudcrud por um banco de verdade sem mexer no front.

## Rotas

| Método | Rota | Body | Resposta |
| ------ | ---- | ---- | -------- |
| `GET` | `/health` | — | `200` `{ "status": "ok" }` |
| `GET` | `/notes` | — | `200` lista de anotações |
| `GET` | `/notes?pokemonId=25` | — | `200` anotações de um Pokémon |
| `POST` | `/notes` | `{ "pokemonId": 25, "description": "texto" }` | `201` anotação criada |
| `PUT` | `/notes/:id` | `{ "description": "novo texto" }` | `200` anotação atualizada |
| `DELETE` | `/notes/:id` | — | `204` sem conteúdo |

### Erros

| Status | Quando |
| ------ | ------ |
| `400` | Dados inválidos (ex.: descrição vazia) |
| `404` | Anotação não encontrada |
| `502` | O crudcrud não respondeu ou falhou |

Exemplo de anotação:

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "pokemonId": 25,
  "description": "Meu favorito",
  "createdAt": "2026-09-27T12:00:00.000Z",
  "updatedAt": "2026-09-27T12:30:00.000Z"
}
```

## Como rodar

Pré-requisito: Node.js 20.19 ou superior.

```bash
# 1. Instale as dependências
npm install

# 2. Crie o arquivo .env a partir do exemplo
cp .env.example .env
# e cole no CRUDCRUD_URL a URL gerada em https://crudcrud.com

# 3. Rode em modo de desenvolvimento
npm run dev
```

A API fica em `http://localhost:3333`. Teste com `http://localhost:3333/health`.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| -------- | ----------- | --------- |
| `CRUDCRUD_URL` | sim | URL do crudcrud, sem `/notes` no final |
| `CORS_ORIGIN` | não | Endereço do front autorizado (ex.: `https://pokedex.vercel.app`). Sem ela, qualquer origem é aceita. |
| `PORT` | não | Porta do servidor (padrão `3333`; o Render define sozinho) |

### Scripts

| Comando | O que faz |
| ------- | --------- |
| `npm run dev` | Roda com recarregamento automático (tsx watch) |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Roda a versão compilada (produção) |

## Deploy (Render)

1. Em [render.com](https://render.com), crie um **Web Service** conectado a este repositório.
2. Configure:
   - **Build Command:** `npm ci --include=dev && npm run build`
   - **Start Command:** `npm start`
3. Em **Environment**, adicione `CRUDCRUD_URL` (e `CORS_ORIGIN` com a URL do front, depois que ele estiver publicado).

> No plano gratuito do Render, o servidor "dorme" após alguns minutos sem uso. A primeira requisição depois disso pode levar até ~1 minuto.

## Decisões técnicas

- **Separação em camadas:** `routes/` recebe e valida a requisição; `services/` conversa com o crudcrud. As rotas não sabem que o crudcrud existe.
- **Validação no backend:** nunca confiar no cliente. `_id` e datas são gerados pelo servidor, não pelo front.
- **PUT seguro:** o PUT do crudcrud substitui o objeto inteiro e rejeita o campo `_id` no body. O serviço busca a anotação atual, aplica a mudança e envia o objeto completo, sem `_id`.
- **Status HTTP precisos:** `201` ao criar, `204` ao excluir, `404` quando não existe, `502` quando o serviço externo falha.
- **Falhar cedo:** sem `CRUDCRUD_URL`, o servidor não inicia e mostra uma mensagem clara.

## Limitações conhecidas

- O endpoint gratuito do crudcrud **expira** e tem **limite de requisições**. Quando expirar, basta gerar uma nova URL e atualizar `CRUDCRUD_URL`.
- O crudcrud não suporta filtros, então o filtro por `pokemonId` é feito no servidor após buscar todas as anotações. Com um banco de verdade, isso seria feito na própria consulta.

## Próximos passos

- [ ] Trocar o crudcrud por um banco real (PostgreSQL ou MongoDB)
- [ ] Autenticação, para que cada usuário veja só as próprias anotações
- [ ] Testes automatizados das rotas (Vitest + Supertest)
- [ ] Validação com uma biblioteca de schemas (ex.: Zod)
