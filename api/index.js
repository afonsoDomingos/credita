// ESM wrapper — Vercel reads root package.json ("type":"module")
// so this file must use ESM syntax. We bridge into the CommonJS
// server using createRequire so that require() works correctly.
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Point require to the server directory so relative requires inside
// server/index.js resolve correctly.
const require = createRequire(import.meta.url);

const app = require('../server/index.js');

export default app;
