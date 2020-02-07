const status = { ok: 200 };
const one = 1;

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
  return todoList;
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

const deleteTodo = function() {
  const [todo, task] = event.path;
  postHttpMsg('/removeTodo', load, `title=${task.id}`);
  task.removeChild(todo);
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
    return `list=${item.value}`;
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

const generateLists = function(list) {
  return list.map(function({ point, status }, index) {
    const getStatus = status ? 'checked' : '';
    return `
  <div id=${index} class="tasks">
    <div>
      <input type="checkbox" ${getStatus}  onclick="done()"/>
      ${point}
    </div>
    <img src="./images/deleteIcon.png" alt="deleteImg" class="delete" onclick="deleteItem()"/>
  </div>`;
  });
};

const displayLists = function(index, list) {
  return `
<div class="display" id="inner${index}" >
  <p onclick="hide('#d${index}.listBlock')" class="close">&#10008;</p>
  <input placeholder="List..." name="subList" type="text" onkeypress="addList()" id="i${index}"></input>
  <img src="./images/plus.png" alt="addImg" onclick="addSubItem()"/>
  ${generateLists(list).join('')}
</div>`;
};

const generateHtml = function(html, task, index) {
  const formattedHtml = `
  <div id="d${index}" class="title" onclick="show('#d${index}.listBlock')">
    ${task.title}
    <img src="./images/deleteIcon.png" alt="deleteImg" class="delete" onclick="deleteTodo()"/>
  </div>
  <div class="listBlock" id="d${index}">
    ${displayLists(index, task.list)}
  </div>
  `;
  return formattedHtml + html;
};

const loadLists = function(text, index) {
  const tasks = JSON.parse(text);
  const todoLists = document.querySelector(`#inner${index}.display`)
    .parentElement;
  todoLists.innerHTML = displayLists(index, tasks[index].list);
};

const addSubItem = function() {
  const item = event.target.previousElementSibling.value;
  const [, , title] = event.path;
  if (item.trim() === '') {
    return alert('enter value in the list box to add');
  }
  postHttpMsg(
    '/addSubList',
    text => loadLists(text, title.id.slice(one)),
    `title=${title.id.slice(one)}&item=${item}`
  );
};

const addList = function() {
  const enterKeyValue = 13;
  if (event.keyCode === enterKeyValue) {
    document.getElementById(event.target.id).nextElementSibling.click();
  }
};

const done = function() {
  const [, , index, , title] = event.path;
  postHttpMsg(
    '/changeStatus',
    text => loadLists(text, title.id.slice(one)),
    `title=${title.id.slice(one)}&id=${index.id}`
  );
};

const deleteItem = function() {
  const [, index, , title] = event.path;
  postHttpMsg(
    '/removeItem',
    text => loadLists(text, title.id.slice(one)),
    `title=${title.id.slice(one)}&id=${index.id}`
  );
};

window.onload = main;
