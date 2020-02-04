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

const generateLists = function(list, title) {
  return list.map(function({ point }, index) {
    return `
    <div id="${title}">
      <input type='checkbox'>${point}
        <span onclick="deleteItem()" id="${index}"> delete 
        </span>
      </input>
      </br>
  </div>`;
  });
};

const generateHtml = function(html, task, index) {
  const title = `${task.title}`;
  const formattedHtml = `
    <div class="task"  id="d${index}">
      <div class="title">
        <h3 onclick="show('#d${index}.display')">${title}</h3>
      </div>
    </div> 
    <div class="display" id="d${index}">
      <button class="close" onclick="hide('#d${index}.display')">cancel</button>
        <div>${generateLists(task.list, index).join('')}
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
  postHttpMsg(
    '/removeItem',
    loadTasks,
    `title=${event.target.parentNode.id}&id=${event.target.id}`
  );
  const itemToList = event.target.parentNode;
  itemToList.parentNode.removeChild(itemToList);
};
