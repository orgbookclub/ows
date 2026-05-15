import { readFileSync } from "fs";
import { join } from "path";

/**
 * Build the runtime version string from `package.json`.
 *
 * Read once at module load via `readFileSync` rather than via a TS
 * `import "../../package.json"`. The TS form would cross the `src/`
 * boundary and force TypeScript to widen the inferred `rootDir` to
 * the project root, shifting every emitted file from `dist/<x>.js`
 * to `dist/src/<x>.js` — which silently breaks the Azure start
 * command (`node dist/main`). See PR #524 for the original repair.
 *
 * `process.cwd()` is the deployed app root in every supported
 * launch mode (yarn scripts, raw `node dist/main`, App Service's
 * pm2/iisnode wrappers).
 *
 * @returns The semver string from `package.json`, or `"unknown"`
 *  if the file is missing or unparseable.
 */
function loadVersion(): string {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
    return (JSON.parse(raw) as { version?: string }).version ?? "unknown";
  } catch {
    return "unknown";
  }
}

const VERSION = loadVersion();

export { VERSION };
