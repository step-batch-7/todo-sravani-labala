const status = { ok: 200 };

const show = element => {
  document.querySelector(element).style.display = 'block';
};

const hide = element => {
  document.querySelector(element).style.display = 'none';
};

const createList = function() {
  const todoList = document.createElement('input');
  todoList.setAttribute('placeholder', 'task...');
  todoList.setAttribute('name', 'list');
  todoList.setAttribute('type', 'text');
  todoList.setAttribute('autocomplete', 'off');
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

const done = function() {
  event.stopPropagation();
  const [, , index, , title] = event.path;
  postHttpMsg(
    '/changeStatus',
    text => {
      loadLists(text, title.id.slice(1));
      if (title.classList[0] === 'title') {
        load(text);
      }
    },
    `title=${title.id.slice(1)}&id=${index.id}`
  );
};

const closeTask = function(task) {
  hide(task);
  main();
  document.querySelector(task).children[0].children[2].value = '';
};

const deleteItem = function() {
  event.stopPropagation();
  const [, , index, , title] = event.path;
  postHttpMsg(
    '/removeItem',
    text => {
      loadLists(text, title.id.slice(1));
      if (title.classList[0] === 'title') {
        load(text);
      }
    },
    `title=${title.id.slice(1)}&id=${index.id}`
  );
};

const addSubItem = function() {
  event.stopPropagation();
  const item = event.target.previousElementSibling.value;
  const [, , title] = event.path;
  if (item.trim() === '') {
    return alert('enter value in the list box to add');
  }
  postHttpMsg(
    '/addSubList',
    text => {
      loadLists(text, title.id.slice(1));
      if (title.classList[0] === 'title') {
        load(text);
      }
    },
    `title=${title.id.slice(1)}&item=${item}`
  );
};

const loadLists = function(text, index) {
  const tasks = JSON.parse(text);
  const todoLists = document.querySelector(`#inner${index}.display`)
    .parentElement;
  todoLists.innerHTML = displayLists(
    index,
    tasks[index].list,
    tasks[index].title
  );
};

const addList = function() {
  const enterKeyValue = 13;
  if (event.keyCode === enterKeyValue) {
    document.getElementById(event.target.id).nextElementSibling.click();
  }
};

const deleteTodo = function() {
  event.stopPropagation();
  const [, , todo, task] = event.path;
  postHttpMsg('/removeTodo', load, `title=${todo.id}`);
  task.removeChild(todo);
};

const generateLists = function(list) {
  return list.map(function({ point, status }, index) {
    const getStatus = status ? 'checked' : '';
    return `
  <div id=${index} class="tasks">
    <div style="display:flex">
      <input type="checkbox" ${getStatus}  onclick="done()" style="margin-top:7px"/>
      <input value="${point}" class="contentTitle" onkeypress="editItem()"></input>
      </div>
      <span class="deleteTask"><img src="./images/delete-sign.png" alt="deleteImg" class="delete" onclick="deleteItem()"/></span>
  </div>`;
  });
};

const displayLists = function(index, list, title) {
  return `
<div class="display" id="inner${index}" >
  <input value="${title}" class="contentTitle" onkeypress="editTitle()" >
  <span onclick="closeTask('#d${index}.listBlock')" class="close">&#10008;</span></input>
  <hr/>
  <input placeholder="task..." name="subList" type="text" onkeypress="addList()" id="i${index}">
  <img src="./images/plus.png" alt="addImg" onclick="addSubItem()"/>
  ${generateLists(list).join('')}
</div>`;
};

const getLists = function(list, title) {
  return list.map(function({ point, status }, index) {
    const getStatus = status ? 'checked' : '';
    return `
  <div id=${index} class="tasks">
    <div>
      <input type="checkbox" ${getStatus}  onclick="done()"/>
      <span class="tasks-search"  id="d${title}i${index}">${point}</span>
      </div>
      <span class="deleteTask"><img src="./images/delete-sign.png" alt="deleteImg" class="delete" onclick="deleteItem()"/></span>
  </div>`;
  });
};

const generateHtml = function(html, task, index) {
  const formattedHtml = `
  <div id="d${index}" class="title" onclick="show('#d${index}.listBlock')">
  <div>
    ${task.title}
    <img src="./images/delete-forever.png" alt="deleteImg" class="delete" onclick="deleteTodo()"/>
    </div>
    <hr />
    <div class="lists">
    ${getLists(task.list, index).join('')}
    </div>
  </div>
  <div class="listBlock" id="d${index}">
    ${displayLists(index, task.list, task.title)}
  </div>
  `;
  return formattedHtml + html;
};

const search = function() {
  if (document.getElementById('select').value === 'title') {
    document.querySelectorAll('.title').forEach(title => {
      title.style.display = 'none';
      if (title.children[0].innerText.includes(event.target.value)) {
        title.style.display = 'block';
      }
    });
    return;
  }
  const lists = new Array(document.querySelectorAll('.tasks-search'));
  lists[0].forEach(list => {
    const [title, id] = list.id.split('i');
    document.getElementById(title).style.display = 'none';
    if (
      document.getElementById(list.id).innerText.includes(event.target.value)
    ) {
      document.getElementById(title).style.display = 'block';
    }
  });
};

const editTitle = function() {
  if (event.keyCode === 13) {
    const title = event.target.parentElement.id.slice(5);
    postHttpMsg(
      '/editTitle',
      text => {
        loadLists(text, title);
      },
      `title=${event.target.parentElement.id.slice(5)}&value=${
        event.target.value
      }`
    );
  }
};

const editItem = function() {
  if (event.keyCode === 13) {
    const [, , item, title] = event.path;
    const value = event.target.value.trim();
    postHttpMsg(
      '/editItem',
      text => {
        loadLists(text, title.id.slice(5));
      },
      `title=${title.id.slice(5)}&value=${value}/
      &itemId=${item.id}`
    );
  }
};

window.onload = main;
