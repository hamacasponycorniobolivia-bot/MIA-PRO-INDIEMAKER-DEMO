const serverless = require('../../backend/node_modules/serverless-http');
const app = require('../../backend/server');

module.exports.handler = serverless(app);
