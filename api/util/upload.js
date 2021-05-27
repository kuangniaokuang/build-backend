const AWS = require('aws-sdk')
const config = require('../../config/env/resolveConfig')
const S3Config = {
  accessKeyId: config.custom.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: config.custom.AWS_S3_SECRET_ACCESS_KEY,
  region: config.custom.AWS_S3_REGION
}

/**
 * Upload buffer to AWS S3
 * @param {buffer} body Buffer content of an image request
 * @param {string} key Image pathname
 * @param {string} contentType Iana MIME type
 * @param {string} bucket target s3 bucket
 * @param {string} ACL Access control list
 * @returns {promise} Upload errors string or the object eTag
 */
async function uploadBuffer (
  body,
  key,
  contentType = 'image/png',
  bucket = config.custom.AWS_S3_PUBLIC_BUCKET,
  ACL = 'public-read'
) {
  const params = {
    ACL,
    Body: body,
    ContentType: contentType,
    Bucket: bucket,
    Key: key
  }

  return await new Promise((resolve, reject) => {
    try {
      const s3 = new AWS.S3(S3Config)
      s3.putObject(params, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Delete a file from AWS S3
 * @param {string} key Image pathname
 * @param {string} bucket target s3 bucket
 * @returns {promise} Removal errors string or the object eTag
 */
async function deleteObject (
  key,
  bucket = config.custom.AWS_S3_PUBLIC_BUCKET
) {
  if (!key || !key.length) {
    return false
  }

  const params = {
    Bucket: bucket,
    Key: key
  }

  return await new Promise((resolve, reject) => {
    try {
      const s3 = new AWS.S3(S3Config)
      s3.deleteObject(params, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  uploadBuffer,
  deleteObject
}
