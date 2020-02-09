const fs = require('fs');
const querystring = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { App } = require('./lib/app');
const STATIC_FOLDER = `${__dirname}/public`;
const statusCodes = { badRequest: 400, notFound: 404, redirecting: 303 };
const config = require('./config');
const dataStore = config.DATA_STORE;
const { TodoList } = require('./lib/todoList');

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

const readFile = () =>
  fs.existsSync(dataStore) ? fs.readFileSync(dataStore, 'utf8') : '[]';

const writeFile = function(content) {
  fs.writeFileSync(dataStore, content);
};

const todoLists = TodoList.load(readFile());
const one = 1;

const serveTasksList = function(req, res) {
  writeFile(todoLists.toJSON());
  res.setHeader('Content-Type', CONTENT_TYPES.json);
  res.end(todoLists.toJSON());
};

const addNewTodo = function(req, res) {
  const { title, list } = req.body;
  let lists = new Array(list).flat();
  lists = lists.map(point => {
    return { point, status: false };
  });
  todoLists.addTodo({ title, list: lists });
  serveTasksList(req, res);
};

const removeTodo = function(req, res) {
  const { title } = req.body;
  todoLists.removeTodo(title.slice(one));
  serveTasksList(req, res);
};

const removeTodoItem = function(req, res) {
  const { id, title } = req.body;
  todoLists.removeTodoTask(title, id);
  serveTasksList(req, res);
};

const changeStatus = function(req, res) {
  const { title, id } = req.body;
  todoLists.changeStatusOfTask(title, id);
  serveTasksList(req, res);
};

const addSubList = function(req, res) {
  const { title, item } = req.body;
  todoLists.addList(title, item);
  serveTasksList(req, res);
};

const editTitle = function(req, res) {
  const { title, value } = req.body;
  todoLists.editTitle(title, value);
  serveTasksList(req, res);
};

const editItem = function(req, res) {
  const { title, itemId, value } = req.body;
  todoLists.editItem(title, itemId, value);
  serveTasksList(req, res);
};

const app = new App();

app.use(readBody);
app.get('', serveStaticFile);
app.get('/tasks', serveTasksList);
app.post('/addSubList', addSubList);
app.post('/removeItem', removeTodoItem);
app.post('/removeTodo', removeTodo);
app.post('/changeStatus', changeStatus);
app.post('/saveTodo', addNewTodo);

app.post('/editTitle', editTitle);
app.post('/editItem', editItem);

app.get('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
