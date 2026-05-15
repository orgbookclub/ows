# Organized Web Server (OWS)

[![CI](https://github.com/orgbookclub/ows/actions/workflows/ows-develop-ci.yml/badge.svg)](https://github.com/orgbookclub/ows/actions/workflows/ows-develop-ci.yml) [![CD](https://github.com/orgbookclub/ows/actions/workflows/ows-prod-deploy-azure.yml/badge.svg)](https://github.com/orgbookclub/ows/actions/workflows/ows-prod-deploy-azure.yml) [![Publish to npm](https://github.com/orgbookclub/ows/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/orgbookclub/ows/actions/workflows/npm-publish.yml)

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start:dev

# watch mode
$ yarn start:dev

# production mode
$ yarn start
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Authentication

OWS issues OAuth 2.0 client-credentials access tokens (RFC 6749 §4.4) at
`POST /auth/token` and verifies them with the standard `Authorization:
Bearer <token>` header on every other route. Tokens are RS256 JWTs
(`iss=ows`, `aud=ows-api`, 1-hour lifetime, deterministic `kid`) and
verifiers can fetch the public key at `GET /auth/.well-known/jwks.json`
(RFC 7517).

### Setup

1. Generate a fresh keypair:

   ```bash
   $ yarn ts-node scripts/generate-jwt-keypair.ts
   ```

   Copy the printed `PRIVATE_KEY_PEM` and `PUBLIC_KEY_PEM` lines into
   `.development.env` (or your production secret store).

2. The registered-clients catalogue lives in `config/clients.json`,
   committed to the repo with **argon2id-hashed secrets only** — no
   plaintext credentials. This file is the **production** catalogue
   loaded by default in any environment that doesn't override
   `CLIENTS_FILE`.

   For local development, the repo also commits
   `config/clients.dev.json` containing a single dev client (secret
   `dev-secret`, scope `*`). Opt in by pointing `CLIENTS_FILE` at it:

   ```bash
   # in .development.env
   CLIENTS_FILE=config/clients.dev.json
   ```

   To register a real client, hash its secret and open a PR adding the
   entry to `config/clients.json`. PR review is the security gate.

   ```bash
   $ yarn ts-node scripts/hash-client-secret.ts            # generates a random secret
   $ yarn ts-node scripts/hash-client-secret.ts <secret>   # hashes the given secret
   ```

   Add the entry to the catalogue:

   ```jsonc
   {
     "clientId": "gregg",
     "secretHash": "$argon2id$v=19$m=65536,t=3,p=4$…",
     "scopes": [
       "events:read", "events:write",
       "users:read", "users:write",
       "books:read", "books:write"
     ]
   }
   ```

   The plaintext secret lives only in your password manager and the
   consuming service's deploy env — never in the repo.

### Requesting a token

Body form (RFC 6749 §4.4.2):

```bash
$ curl -X POST http://localhost:3000/auth/token \
    -H 'Content-Type: application/json' \
    -d '{
      "grant_type": "client_credentials",
      "client_id": "dev",
      "client_secret": "dev-secret"
    }'
```

HTTP Basic header (RFC 6749 §2.3.1, recommended for Gregg-style clients):

```bash
$ curl -X POST http://localhost:3000/auth/token \
    -u 'dev:dev-secret' \
    -d 'grant_type=client_credentials'
```

The response is RFC 6749 §5.1 compliant:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs…",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "*"
}
```

### Scopes

Routes are tagged with `@Scopes(...)`. The bearer token's `scope` claim
must include every required scope, with `*` acting as a wildcard.

| Scope             | Granted on routes                                              |
| ----------------- | -------------------------------------------------------------- |
| `events:read`     | `GET /api/events/:id`, `GET /api/v2/events`                    |
| `events:write`    | `POST` / `PATCH` / `DELETE` on `/api/events`                   |
| `users:read`      | `GET /api/users`, `GET /api/users/:userid`                     |
| `users:write`     | `POST` / `PATCH` / `DELETE` on `/api/users`                    |
| `books:read`      | `GET /api/goodreads/*`, `GET /api/storygraph/*`                |
| `books:write`     | `POST /api/books`, `POST /api/books/createFromUrl`             |
| `*`               | wildcard — satisfies any required scope                        |

Routes under `/api/migrations` require all three write scopes
(`events:write` + `users:write` + `books:write`) since a single migration
run can create/update events, users, and books in the same request.

Missing scopes return `403 Forbidden`; missing/invalid tokens return
`401 Unauthorized`.

### Local API testing

Two affordances ship with the repo so you don't have to munge bearer tokens
by hand:

- **`requests.http`** at the repo root — open it in VS Code with the
  [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
  extension (`code --install-extension humao.rest-client`). VS Code has no
  built-in `.http` support, so the extension is required. Click the first
  request (named `token`) once per session; every other request
  automatically references the captured token via
  `{{token.response.body.$.access_token}}`, so no copy-paste is needed.
- **`yarn dev:token`** — prints a freshly issued JWT for the bundled `dev`
  client to stdout. Handy for shell scripting:

  ```bash
  $ TOKEN=$(yarn -s dev:token)
  $ curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/health
  ```

  Override `BASE_URL`, `CLIENT_ID`, or `CLIENT_SECRET` to target a
  different host or client.

## MCP server

OWS exposes a read-only [Model Context Protocol](https://modelcontextprotocol.io)
server in-process at `POST /mcp` using the official
[`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
Streamable HTTP transport. The endpoint runs in stateless mode (no session
ids), is excluded from the OpenAPI spec, and is gated by the same
`JwtAuthGuard` as the rest of the API. Point your MCP client at
`http(s)://<host>/mcp` and pass an `Authorization: Bearer <token>` header.
The route requires the **`events:read`** and **`users:read`** scopes;
register a dedicated `mcp` client (or use the bundled `dev` wildcard
client locally) and provision its credentials in the MCP service.

### Tools (v1, all read-only)

| Tool                      | Backed by                           | Description                                                                                                                                                                            |
| ------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `events_search`           | `EventsService.findManyV2`          | 1:1 mirror of the `GET /api/v2/events` query surface (filter + `sortBy` + `fields` projection + `page`/`pageSize`). Returns the paginated `{ items, total, page, pageSize }` wrapper. Default `pageSize` is 100. Date inputs are ISO 8601 strings. |
| `events_get_by_id`        | `EventsService.findOne`             | Fetch a single event by Mongo object ID.                                                                                                                                              |
| `users_get_by_discord_id` | `UsersService.findOneByUserId`      | Fetch a single user by Discord user ID (NOT the Mongo object ID). Returns null if no user exists.                                                                                     |

`status` and `type` filters are single-valued (matching the underlying
`EventsService`), so multi-value queries like *"BRs and MRs"* require multiple
`events_search` calls.

### Example MCP client config

```jsonc
// ~/.config/<your-mcp-client>/mcp.json
{
  "mcpServers": {
    "ows": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer <token from POST /auth/token>"
      }
    }
  }
}
```

### Smoke-testing locally

The fastest way to verify the endpoint is the official
[MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
# in one terminal: start OWS
$ yarn start:dev

# in another terminal: get a token using the bundled dev client
$ TOKEN=$(curl -s -X POST http://localhost:3000/auth/token \
    -u 'dev:dev-secret' -d 'grant_type=client_credentials' \
    | jq -r .access_token)

# then launch the inspector UI
$ npx @modelcontextprotocol/inspector
```

In the inspector, set Transport Type to **Streamable HTTP**, URL to
`http://localhost:3000/mcp`, add a header `Authorization: Bearer $TOKEN`,
click **Connect**, then **List Tools** → **events_search** → **Run Tool**
with an empty argument object.

## License

Copyright (C) 2022–2026 ravsodhi.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your
option) any later version. See the [`LICENSE`](./LICENSE) file for the
full license text.
