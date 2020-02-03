const fs = require('fs');
const querystring = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { App } = require('./lib/app');
const STATIC_FOLDER = `${__dirname}/public`;
const statusCodes = { badRequest: 400, notFound: 404, redirecting: 303 };
const config = require('./config');
const dataStore = config.DATA_STORE;

const notFound = function(req, res) {
  res.writeHead(statusCodes.notFound);
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(statusCodes.badRequest);
  res.end();
};

const validatePath = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const serveStaticFile = (req, res, next) => {
  if (!fs.existsSync(dataStore)) {
    fs.writeFileSync(dataStore, '[]');
  }
  if (req.url === '/') {
    req.url = '/todo.html';
  }
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

const serveTasksList = function(req, res, next) {
  const path = `${__dirname}${req.url}`;
  if (path !== dataStore) {
    next();
  }
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(fs.readFileSync(path));
};

const generateLists = function(unformattedList) {
  const arrayFormLists = new Array(unformattedList).flat();
  const lists = [];
  arrayFormLists.forEach(function(list) {
    return lists.push({ point: list, status: false });
  });
  return lists;
};

const addNewTodo = function(req, res) {
  const { title, list } = req.body;
  const previousTodo = JSON.parse(fs.readFileSync(dataStore));
  previousTodo.push({
    id: previousTodo.length,
    title,
    list: generateLists(list)
  });
  fs.writeFileSync(dataStore, JSON.stringify(previousTodo));
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.writeHead(statusCodes.redirecting, { location: '/todo.html' });
  res.end();
};

const app = new App();

app.use(readBody);
app.get('', serveStaticFile);
app.get('/todoList.json', serveTasksList);
app.post('/', addNewTodo);
app.get('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
