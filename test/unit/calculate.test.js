let assert = require('assert');
let calculate = require('../../api/util/calculate')

describe('Calculate', () => {
  describe('.percent()', () => {
    it('should return the percent rounded as an integer', () => {
      assert.equal(calculate.percentage(10, 100), 10);
      assert.equal(calculate.percentage(1, 3), 33);
      assert.equal(calculate.percentage(2, 3), 67);
    });
  });
});
