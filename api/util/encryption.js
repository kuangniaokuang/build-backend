// https://attacomsian.com/blog/nodejs-encrypt-decrypt-data
// https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_options

const crypto = require('crypto')
const config = require('../../config/env/resolveConfig')
const algorithm = 'aes-256-ctr'
const key = config.custom.ENCRYPTION_KEY
const iv = crypto.randomBytes(16)

const secretKey = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32)

module.exports = {
  encrypt: (text = '') => {
    if (text.iv || text.content) {
      console.log('INFO >>> This is already an encrypted hash')
      return text
    }
    try {
      const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
      const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
      return {
        // This is the hash that is unique to each encrypted cypher
        // This is needed so user's can't reverse engineer our secret
        iv: iv.toString('hex'),
        // This is the encrypted cypher
        content: encrypted.toString('hex')
      }
    } catch (error) {
      console.error('ERROR: encrypt: ', error, text)
      throw error
    }
  },
  decrypt: (hashObject) => {
    if (typeof hashObject === 'string' && hashObject.match(/content/) !== null) {
      hashObject = JSON.parse(hashObject)
    }
    if (!hashObject || !hashObject.iv || !hashObject.content) {
      console.log('INFO >>> not a valid encrypted object')
      return hashObject
    }
    try {
      const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hashObject.iv, 'hex'))
      const decrpyted = Buffer.concat([decipher.update(Buffer.from(hashObject.content, 'hex')), decipher.final()])
      return decrpyted.toString()
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
