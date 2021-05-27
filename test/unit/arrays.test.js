let assert = require('assert');
let arrays = require('../../api/util/arrays')

describe('Arrays', () => {
  describe('.getDailyRank(input, email)', () => {
    it('should get their rank for each day', () => {
      let input = [
        {
          'primary_email': 'gerile.tu@meri.co',
          'value': 87,
          'date': '2020-07-08'
        },
        {
          'primary_email': 'yanghui@meri.co',
          'value': 486,
          'date': '2020-07-08'
        },
        {
          'primary_email': 'gerile.tu@meri.co',
          'value': 48,
          'date': '2020-07-09'
        },
        {
          'primary_email': 'yanghui@meri.co',
          'value': 0,
          'date': '2020-07-09'
        },
        {
          'primary_email': 'yanghui@meri.co',
          'value': 0,
          'date': '2020-07-10'
        }
      ]
      let expected = [
        {
          'rank': 1,
          'date': '2020-07-08'
        },
        {
          'rank': 2,
          'date': '2020-07-09'
        },
        {
          'rank': 1,
          'date': '2020-07-10'
        }
      ]
      assert.deepStrictEqual(arrays.getDailyRank(input, 'yanghui@meri.co'), expected);
    });
  });

  describe('.removeBlacklistEmails(emails)', () => {
    it('should not return blacklisted emails', () => {
      assert.deepStrictEqual(arrays.removeBlacklistEmails(['foo@foo.com']), ['foo@foo.com']);
      assert.deepStrictEqual(arrays.removeBlacklistEmails(['foo@foo.com', 'noreply@github.com']), ['foo@foo.com']);
      assert.deepStrictEqual(arrays.removeBlacklistEmails(['foo@foo.com', 'bar@foo.com', 'noreply@github.com']), ['foo@foo.com', 'bar@foo.com']);
    });
  });
});
