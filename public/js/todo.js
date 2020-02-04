const status = { ok: 200 };

const show = element => {
  document.querySelector(element).style.display = 'block';
};

const hide = element => {
  document.querySelector(element).style.display = 'none';
};

const createList = function() {
  const todoList = document.createElement('input');
  todoList.setAttribute('placeholder', 'list...');
  todoList.setAttribute('name', 'list');
  todoList.setAttribute('type', 'text');
  todoList.setAttribute('required', true);
  return todoList;
};

const generateLists = function(list) {
  return list.map(function({ point, status }, index) {
    return `
    <div id="${index}" class="tasks">
      <p>${point}</p>
      <button onclick="deleteItem()" > delete 
      </button>
      </br>
      <button onclick="done()">${status}</button>
  </div>`;
  });
};

const generateHtml = function(html, task, index) {
  const formattedHtml = `
    <div class="task"  id="d${index}">
      <div class="title">
        <h3 onclick="show('#d${index}.display')">${task.title}</h3>
        <span class="delete" onclick="deleteTodo()">delete</span>
        </div>
    </div>

    <div class="display" id="d${index}">
      <button class="close" onclick="hide('#d${index}.display')">cancel</button>
      <button id="add" onclick="addList()">add</button>
        <div id="${index}">${generateLists(task.list).join('')}
        </div>
    </div>
  `;
  return formattedHtml + html;
};

const postHttpMsg = function(url, callback, message) {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if (this.status === status.ok) {
      callback(this.responseText);
    }
  };
  req.open('POST', url);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(message);
};

const sendHttpGet = (url, callback) => {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if (this.status === status.ok) {
      callback(this.responseText);
    }
  };
  req.open('GET', url);
  req.send();
};

const loadTasks = function() {
  sendHttpGet('/tasks', text => {
    const todoLists = document.getElementById('todo-list');
    const tasks = JSON.parse(text);
    const tasksHtml = tasks.reduce(generateHtml, '');
    todoLists.innerHTML = tasksHtml;
  });
};

const main = function() {
  loadTasks();
  attachListener();
};

const addSubList = function() {
  const form = document.getElementById('form');
  form.appendChild(createList());
};

const deleteSubList = function() {
  const getLastIndex = 1;
  if (document.querySelectorAll('[name="list"]').length === getLastIndex) {
    return alert('click cancel to go back');
  }
  const form = document.getElementById('form');
  const list = document.querySelectorAll('[name="list"]');
  form.removeChild(list[list.length - getLastIndex]);
};

const attachListener = function() {
  const button = document.querySelector('#close');
  button.addEventListener('click', () => hide('#addTodo'));
};

const deleteItem = function() {
  const [, index, title] = event.path;
  postHttpMsg('/removeItem', loadTasks, `title=${title.id}&id=${index.id}`);
  title.removeChild(index);
};

const deleteTodo = function() {
  const [, todo, task] = event.path;
  postHttpMsg('/removeTodo', loadTasks, `title=${task.id}`);
  task.removeChild(todo);
};

const done = function() {
  const [, index, title] = event.path;
  postHttpMsg('/changeStatus', loadTasks, `title=${title.id}&id=${index.id}`);
  event.target.innerHTML = !event.target.innerHTML;
};

const createForm = function() {
  const form = document.createElement('form');
  form.setAttribute('method', 'POST');
  form.appendChild(createList());
  return form;
};

const addList = function() {
  const till = 1;
  const [, task] = event.path;
  document.getElementById(task.id.slice(till)).appendChild(createForm());
};
