const request = require('supertest');
const { app } = require('../handler');

describe('GET method for pages', function() {
  it('should give the home page of the app for the url /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Type', 'text/html')
      .expect(200, done);
  });
  it('should give the file not found error if the file is not present', function(done) {
    request(app.serve.bind(app))
      .get('/notFoundFile')
      .expect(404, done);
  });
  it('should give the dataBase of the app', function(done) {
    request(app.serve.bind(app))
      .get('/tasks')
      .expect('Content-Type', 'application/json')
      .expect(200, done);
  });
});

describe('Method Not Allowed', function() {
  it('should give error for method not allowed if method is not get or post', function(done) {
    request(app.serve.bind(app))
      .put('/')
      .expect(400, done);
  });
});

describe('GET method for css', function() {
  it('should give the css for the app for todo.css', function(done) {
    request(app.serve.bind(app))
      .get('/css/todo.css')
      .expect('Content-Type', 'text/css')
      .expect(200, done);
  });
});

describe('POST method', function() {
  it('should redirect on adding the item to the main page', function(done) {
    request(app.serve.bind(app))
      .post('/')
      .send('title=title&todoItem=1')
      .expect(303, done);
  });
  it('should mark the checkbox item in the task', function(done) {
    request(app.serve.bind(app))
      .post('/changeStatus')
      .send('id=0&title=0')
      .expect(200, done);
  });
  it('should delete particular item in the task', function(done) {
    request(app.serve.bind(app))
      .post('/removeItem')
      .send('id=0&title=0')
      .expect(200, done);
  });
  it('should delete the particular task ', function(done) {
    request(app.serve.bind(app))
      .post('/removeTodo')
      .send('title=0')
      .expect(200, done);
  });
});
