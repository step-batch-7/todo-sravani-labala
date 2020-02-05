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
    <button onclick="done()">${status}</button>
    <p>${point}</p>
    <img src="https://cdn.iconscout.com/icon/premium/png-512-thumb/delete-1432400-1211078.png" alt="deleteImg" class="delete" onclick="deleteItem()"/>
    </br>
  </div>`;
  });
};

const generateHtml = function(html, task, index) {
  const formattedHtml = `
  <div>
    <div id="d${index}">
      <div class="title">
        <h3 onclick="show('#d${index}.listBlock')">${task.title}</h3>
        <img src="https://cdn.iconscout.com/icon/premium/png-512-thumb/delete-1432400-1211078.png" alt="deleteImg" class="delete" onclick="deleteTodo()"/>
      </div>
    </div>
    <div class="listBlock" id="d${index}">
      <div class="display" >
        <img src="https://svgsilh.com/svg/294245.svg" alt="cancelImg" onclick="hide('#d${index}.listBlock')" class="close"/>
        <button onclick="addList()">add</button>
          <div id="${index}">${generateLists(task.list).join('')}
          </div>
      </div>
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

const load = function(text) {
  const todoLists = document.getElementById('todo-list');
  const tasks = JSON.parse(text);
  const tasksHtml = tasks.reduce(generateHtml, '');
  todoLists.innerHTML = tasksHtml;
};

const main = function() {
  sendHttpGet('/tasks', load);
};

const addSubList = () => {
  document.getElementById('form').appendChild(createList());
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

const deleteItem = function() {
  const [, index, title] = event.path;
  postHttpMsg('/removeItem', load, `title=${title.id}&id=${index.id}`);
  title.removeChild(index);
};

const deleteTodo = function() {
  const [, todo, task] = event.path;
  postHttpMsg('/removeTodo', load, `title=${task.id}`);
  task.removeChild(todo);
};

const done = function() {
  const [, index, title] = event.path;
  postHttpMsg('/changeStatus', load, `title=${title.id}&id=${index.id}`);
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

const isTodo = function(todoList) {
  return todoList.some(list => {
    return list.value.trim() === '';
  });
};

const saveList = function() {
  let list = Array.from(document.getElementById('form').children);
  if (isTodo(list)) {
    alert('enter title and fill the list');
    return;
  }
  const title = list.shift().value;
  list = list.map(item => {
    const value = item.value;
    return `list=${value}`;
  });
  cancel();
  postHttpMsg('/saveTodo', load, `title=${title}&${list.join('&')}`);
};

const cancel = function() {
  document.querySelector('#addTodo').style.display = 'none';
  const form = document.getElementById('form');
  const list = Array.from(form.children);
  list.shift().value = '';
  list.shift().value = '';
  list.map(item => form.removeChild(item));
};

window.onload = main;
