var supertest = require('supertest');

describe('TestController', () => {
  describe('#ping()', () => {
    it('should return pong', (done) => {
      supertest(sails.hooks.http.app)
      .get('/ping')
      .expect(200, done)
    });
  });
  describe('#version()', () => {
    it('should return version', (done) => {
      supertest(sails.hooks.http.app)
      .get('/version')
      .expect(200, done)
    });
  });
});
