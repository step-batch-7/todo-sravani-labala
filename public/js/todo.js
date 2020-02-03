const createList = function() {
  const todoList = document.createElement('input');
  todoList.setAttribute('placeholder', 'list...');
  todoList.setAttribute('name', 'list');
  todoList.setAttribute('type', 'text');
  todoList.setAttribute('required', true);
  return todoList;
};

const generateLists = function(list) {
  return list.map(function({ point }) {
    return `<input type='checkbox'>${point}</input></br>`;
  });
};

const generateHtml = function(html, task) {
  const formattedHtml = `
  <div class="task" >
    <div class="title">
      <h3>${task.title}</h3>
      <button id=${task.id} onclick="addList()">undone</button>
    </div>
    <div>${generateLists(task.list).join('')}
    </div>
    <div id="a-${task.id}" class="subTodo">done should occur
    </div>
  </div>
`;
  return formattedHtml + html;
};

const postHttpMsg = function(url, callback, message) {
  const req = new XMLHttpRequest();
  req.onload = function() {
    if (this.status === statusCodes.OK) {
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
    const ok = 200;
    if (this.status === ok) {
      callback(this.responseText);
    }
  };
  req.open('GET', url);
  req.send();
};

const loadTasks = function() {
  sendHttpGet('/dataBase/todoList.json', text => {
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

const addList = function() {
  if (document.getElementById(event.target.id).innerText === 'undone') {
    const form = document.getElementById(`a-${event.target.id}`);
    form.style.display = 'block';
    document.getElementById(event.target.id).innerText = 'done';
    return;
  }
  const form = document.getElementById(`a-${event.target.id}`);
  form.style.display = 'none';
  document.getElementById(event.target.id).innerText = 'undone';
};

const add = function() {
  document.getElementById('addTodo').style.display = 'block';
};

const close = function() {
  document.getElementById('addTodo').style.display = 'none';
};

const addSubList = function() {
  const form = document.getElementById('form');
  form.appendChild(createList());
};

const deleteSubList = function() {
  const form = document.getElementById('form');
  const list = document.querySelectorAll('[name="list"]');
  const getLastIndex = 1;
  form.removeChild(list[list.length - getLastIndex]);
};

const attachListener = function() {
  const button = document.querySelector('#close');
  button.addEventListener('click', close);
};
