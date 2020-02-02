const http = require('http');
const { app } = require('./handler');
const defaultPort = 4000;

const main = function(port = defaultPort) {
  const server = new http.Server(app.serve.bind(app));
  server.listen(port, () => process.stdout.write('listening'));
};

const [, , port] = process.argv;
main(port);
