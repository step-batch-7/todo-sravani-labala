const one = 1;

class Todo {
  constructor(title, list) {
    this.title = title;
    this.list = list;
  }
  add(task) {
    this.list.push({ point: task, status: false });
  }
  removeTask(task) {
    this.list.splice(task, one);
  }
  changeStatus(task) {
    this.list[task].status = !this.list[task].status;
  }
  static create(title, list) {
    const lists = list.map(task => {
      return { point: task.point, status: task.status };
    });
    return new Todo(title, lists);
  }
}

class TodoList {
  constructor() {
    this.todo = [];
  }
  addTodo(todo) {
    this.todo.push(Todo.create(todo.title, todo.list));
  }
  toJSON() {
    return JSON.stringify(this.todo);
  }
  removeTodo(todo) {
    this.todo.splice(todo, one);
  }
  removeTodoTask(todoId, taskId) {
    this.todo[todoId].removeTask(taskId);
  }
  changeStatusOfTask(todoId, taskId) {
    this.todo[todoId].changeStatus(taskId);
  }
  addList(todoId, task) {
    this.todo[todoId].add(task);
  }
  static load(content) {
    const todoJSON = JSON.parse(content);
    const todoList = new TodoList();
    todoJSON.forEach(todo => {
      todoList.addTodo(Todo.create(todo.title, todo.list));
    });
    return todoList;
  }
}

module.exports = { Todo, TodoList };
