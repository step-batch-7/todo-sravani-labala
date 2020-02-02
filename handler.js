const fs = require('fs');
const querystring = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { App } = require('./lib/app');
const STATIC_FOLDER = `${__dirname}/public`;
const statusCodes = { badRequest: 400, notFound: 404, redirecting: 303 };

const notFound = function(req, res) {
  res.writeHead(statusCodes.notFound);
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(statusCodes.badRequest);
  res.end();
};

const addTodo = function(req, res) {
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.writeHead(statusCodes.redirecting, { location: '/' });
  res.end();
};

const validatePath = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const getTodoPage = function(req, res, next) {
  if (req.url !== '/') {
    return next();
  }
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.end(fs.readFileSync(`${STATIC_FOLDER}/index.html`));
};

const serveStaticFile = (req, res, next) => {
  const path = `${STATIC_FOLDER}${req.url}`;
  if (validatePath(path)) {
    return next();
  }
  const [, extension] = path.match(/.*\.(.*)$/);
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(path));
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = querystring.parse(data);
    next();
  });
};

const app = new App();

app.use(readBody);
app.get('/', getTodoPage);
app.get('', serveStaticFile);
app.post('/addTodo.html', addTodo);
app.get('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
