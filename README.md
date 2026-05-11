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

## MCP server

OWS exposes a read-only [Model Context Protocol](https://modelcontextprotocol.io)
server in-process at `POST /mcp` using the official
[`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
Streamable HTTP transport. The endpoint runs in stateless mode (no session
ids), is excluded from the OpenAPI spec, and is gated by the same
`JwtAuthGuard` as the rest of the API — point your MCP client at
`http(s)://<host>/mcp` and pass the same `Authorization: Bearer <token>`
header you would use against any other route. `ENV=dev` bypasses auth, as
elsewhere.

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
# in one terminal: start OWS (ENV=dev disables auth)
$ yarn start:dev

# in another terminal: launch the inspector UI
$ npx @modelcontextprotocol/inspector
```

In the inspector, set Transport Type to **Streamable HTTP**, URL to
`http://localhost:3000/mcp`, click **Connect**, then **List Tools** →
**events_search** → **Run Tool** with an empty argument object.

## License

Copyright (C) 2022–2026 ravsodhi.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your
option) any later version. See the [`LICENSE`](./LICENSE) file for the
full license text.
