// CommonJS handler for Vercel — api/package.json sets "type":"commonjs"
// so this file is loaded as CJS even though root package.json has "type":"module"
const app = require('../server/index.js');

module.exports = app;
