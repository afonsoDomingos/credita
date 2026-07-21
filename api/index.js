// ESM bridge for Vercel — root package.json has "type":"module"
// so this file is loaded as ES Module. We use createRequire to
// load the CommonJS Express server and re-export it as default.
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load the CommonJS Express app
const app = require('../server/index.js');

// Vercel @vercel/node expects a default export that is a
// Node.js http handler: (req, res) => void
export default function handler(req, res) {
  return app(req, res);
}
