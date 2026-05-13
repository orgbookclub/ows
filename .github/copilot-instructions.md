# Copilot Instructions for OWS (Organized Web Server)

NestJS REST API for the OrgBookClub. Persists data in MongoDB via Mongoose, scrapes book info from Goodreads / Storygraph, and exposes a Swagger-documented API consumed by an auto-generated `@organizedbookclub/ows-client` package.

## Toolchain & commands

- Package manager is **yarn** (`.npmrc`, `yarn.lock`); CI uses **Node 20.x**. Don't introduce `npm`/`pnpm` lockfiles.
- The default git branch is **`develop`** (CI in `.github/workflows/ows-develop-ci.yml` runs on push/PR to it). PRs target `develop`, not `main`.
- Required scripts (see `package.json`):
  - `yarn lint` — ESLint with `--max-warnings 0`. CI fails on any warning.
  - `yarn lint:fix` — autofix.
  - `yarn build` — `nest build`.
  - `yarn test` — Jest unit tests. Config is inline in `package.json`: `rootDir: src`, `testRegex: .*\.test\.ts$`. Unit tests live **next to the source file** as `*.test.ts`.
  - `yarn test:e2e` — uses `test/jest-e2e.json`, matches `*.e2e-spec.ts` under `/test`.
  - `yarn test:cov` — coverage.
  - `yarn start:dev` — watch-mode dev server (port `3000` unless `PORT` is set).
  - `yarn openapi:generate` — regenerates the typed client into `client/` from `docs/openapi.json` (the spec is rewritten on every server boot from `src/main.ts`).
- Run a single test file: `yarn test src/books/books.service.test.ts`. Run a single case: `yarn test -t "should create a book"`. For e2e, pass `--config ./test/jest-e2e.json`.

## Environment

- Copy `sample.env` to `.development.env` (loaded by `ConfigModule` along with `.prod.env`). Required keys: `MONGODB_URI`, `PRIVATE_KEY_PEM`, `PUBLIC_KEY_PEM`, `ENV`, `GREGG_CLIENT_ID`, `GREGG_CLIENT_SECRET`, `APPLICATIONINSIGHTS_CONNECTION_STRING`. Generate the PEM pair locally with `yarn ts-node scripts/generate-jwt-keypair.ts`.
- `config/clients.json` is the **production** registered-clients catalogue (committed, argon2id-hashed secrets only — never plaintext). For local development, set `CLIENTS_FILE=config/clients.dev.json` to load the bundled dev client (`id=dev`, `secret=dev-secret`, scope `*`) instead. `CLIENTS_FILE` defaults to `config/clients.json`.

## Architecture

Standard NestJS feature-module layout. `src/app.module.ts` wires the modules; the layout per feature is `*.module.ts` + `*.controller.ts` + `*.service.ts` + `dto/` + `schemas/` (Mongoose) and/or `entities/`.

Feature modules:
- `books`, `events`, `users`, `reviews` — CRUD over Mongo collections.
- `book-info` — scrapes Goodreads & Storygraph via `cheerio`. Parsers extend the shared `Parser` base in `src/book-info/parsers/parser.ts` (the `CheerioAPI` field is named `soup` for legacy reasons).
- `auth` — OAuth2 client-credentials at `POST /auth/token`, RS256 JWT bearer for everything else; signing keys read from `PRIVATE_KEY_PEM` / `PUBLIC_KEY_PEM` env vars and exposed publicly at `GET /auth/.well-known/jwks.json` (RFC 7517). Registered clients live in the file pointed at by `CLIENTS_FILE` (default `config/clients.json`) with argon2id-hashed secrets.
- `migrations` — one-off endpoints to migrate documents between schema versions; not part of normal request flow.
- `health` — `GET /api/health` (uses `@SkipAuth()`).
- `logger` — `CustomLogger` extends Nest's `ConsoleLogger` and forwards to Azure Application Insights. Installed in `main.ts` via `app.useLogger(...)`.

Cross-cutting patterns to preserve when adding code:

- **Repository abstraction**: every Mongo collection has a repository class (e.g. `BookRepository`) extending `BaseRepository<T>` in `src/repositories/`. Services depend on the repository, never on the Mongoose model directly. Unit tests swap the real repository for `MockRepository<T>` seeded from fixtures in `src/utils/` — there is **no live Mongo in unit tests**.
- **DTOs are classes, not interfaces**, because `@nestjs/swagger`'s plugin (configured in `nest-cli.json`) introspects them for OpenAPI. Mongoose schemas extend the DTO (e.g. `class Book extends BookDto`) so `@Prop` decorators sit on top of the DTO shape.
- **Global guards**: both `JwtAuthGuard` and `ScopesGuard` are registered as `APP_GUARD` in `AuthModule`, so every route requires a Bearer token *and* the scopes its controller declares. There is **no `ENV=dev` auth bypass** — the dev client gets through because it holds the wildcard scope `*`, not because auth is off. Opt out of auth entirely with `@SkipAuth()` from `src/auth/jwt-auth.guard.ts` (used by `/auth/token` and `/api/health`); declare required scopes with `@Scopes("events:read", ...)` from `src/auth/scopes.decorator.ts`.
- **Controller routing**: feature controllers are mounted at `api/<feature>` (e.g. `@Controller("api/books")`) and decorated with `@ApiTags(...)` + `@ApiBearerAuth()`. Auth controller is the exception, mounted at `auth`.
- **OpenAPI is a build artifact, but it is committed**: `src/main.ts` writes `docs/openapi.json` on every boot using `JSON.stringify(document)` — i.e. minified onto a single line. The committed file, however, is **Prettier-formatted** so spec diffs are reviewable. When you change controllers/DTOs that affect the API surface, regenerate by booting `yarn start:dev` once, waiting for the `Updated openapi.json` debug log, killing the server, then running `yarn prettier --write docs/openapi.json` before committing. Don't hand-edit the JSON. The downstream client package is generated from this file.
- **External scraping dispatch**: `BooksService.createBookFromUrl` selects the parser by URL prefix (`goodreadsService.GR_BASE_URLS` vs `storygraphService.SG_BASE_URL`). New sources should follow the same pattern.

## Code conventions (enforced by ESLint, will fail CI)

- **JSDoc is mandatory on every public class, method, function, and arrow function** (`jsdoc/require-jsdoc` with `publicOnly: true`). Descriptions must end in a period (`require-description-complete-sentence`). Even constructors get a JSDoc block — see existing controllers/services for the exact shape.
- **No inline comments** (`no-inline-comments: error`). Use block comments above the line, or none.
- **Imports are auto-grouped and alphabetized** (`import/order`): `builtin → external → internal → parent → sibling → index → object → type → unknown`, blank line between groups, case-insensitive ascending sort. `import/exports-last` requires exports at the bottom of the file.
- Prettier: double quotes, trailing commas everywhere, 2-space indent (no tabs). Run `yarn lint:fix` before committing.
- `tsconfig.json` intentionally relaxes strict mode (`strictNullChecks: false`, `noImplicitAny: false`, `strictBindCallApply: false`). Don't tighten these without discussion.
- Constructors typically end with a `Logger.debug("Initialized XController")` call — match the surrounding style when adding new providers.
- `eqeqeq` is enforced — always use `===` / `!==`.

## Testing patterns

- Use `Test.createTestingModule({...})` with the real `*Module` for dependencies and override the repository provider with `{ provide: XRepository, useValue: new MockRepository<T>(seedDocs) }`. See `src/books/books.service.test.ts` for the canonical example.
- Fixtures live in `src/utils/mock*Values.ts`; reuse them rather than handcrafting documents.
- External HTTP (Goodreads/Storygraph) is stubbed with `jest.spyOn(service, "method").mockImplementation(...)` against the real service instance pulled from the test module.
