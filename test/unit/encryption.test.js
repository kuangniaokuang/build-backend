let assert = require('assert');
let Encryption = require('../../api/util/encryption')

describe('Encryption', () => {
  describe('.encrypt()', () => {
    it('should encrypt a string', () => {
      let encrypted = Encryption.encrypt('fooasdfasdf')
      assert.notStrictEqual(encrypted, 'fooasdfasdf');
      assert.notStrictEqual(encrypted.iv, undefined)
      assert.notStrictEqual(encrypted.content, undefined)
    });
    
  });
  describe('.decrypt()', () => {
    it('should decrypt the string', () => {
      let encrypted = Encryption.encrypt('fooasdfasdf')
      let decrypted = Encryption.decrypt(encrypted)
      assert.strictEqual('fooasdfasdf', decrypted);
    });
    it('should decrypt a real encrypted string', () => {
      let encrypted = {
        iv: '3aff5f6be949c49b1bb54736d697ede3',
        content: '6c41478699202929eda668309c8e9c93dca9'
      }
      let decrypted = Encryption.decrypt(encrypted)
      assert.strictEqual('jfl54ghsl57hles2rf', decrypted);
    });
    it('should decrypt another real encrypted string', () => {
      let encrypted = '{"iv":"2867142ff2de50a0b3ca18e40007da64","content":"e32ef013e9292d858b7ff563fef7e20039d109560baa108982b4d946d48a67018d09accb8dbb85c5"}'
      let decrypted = Encryption.decrypt(encrypted)
      assert.strictEqual('4be4bb8179402e6103c74640e99f2f458c6c303c', decrypted);
    });
    it('should return a string if a non json string is passed in', () => {
      assert.strictEqual('fooasdfasdf', Encryption.decrypt('fooasdfasdf'));
    });
  });
});
