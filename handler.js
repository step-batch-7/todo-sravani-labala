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

const serveTasksList = function(req, res) {
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(fs.readFileSync(dataStore));
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
    title,
    list: generateLists(list)
  });
  fs.writeFileSync(dataStore, JSON.stringify(previousTodo));
  res.end(JSON.stringify(previousTodo));
};

const removeTodoItem = function(req, res) {
  const till = 1;
  const { id, title } = req.body;
  const previousTasks = JSON.parse(fs.readFileSync(dataStore));
  previousTasks[title].list.splice(id, till);
  fs.writeFileSync(dataStore, JSON.stringify(previousTasks));
  res.end(JSON.stringify(previousTasks));
};

const removeTodo = function(req, res) {
  const { title } = req.body;
  const till = 1;
  const previousTasks = JSON.parse(fs.readFileSync(dataStore));
  previousTasks.splice(title.slice(till), till);
  fs.writeFileSync(dataStore, JSON.stringify(previousTasks));
  res.end(JSON.stringify(previousTasks));
};

const changeStatus = function(req, res) {
  const { title, id } = req.body;
  const previousTasks = JSON.parse(fs.readFileSync(dataStore));
  previousTasks[title].list[id].status = !previousTasks[title].list[id].status;
  fs.writeFileSync(dataStore, JSON.stringify(previousTasks));
  res.end(JSON.stringify(previousTasks));
};

const app = new App();

app.use(readBody);
app.get('', serveStaticFile);
app.get('/tasks', serveTasksList);
app.post('/removeItem', removeTodoItem);
app.post('/removeTodo', removeTodo);
app.post('/changeStatus', changeStatus);
app.post('/saveTodo', addNewTodo);
app.get('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
