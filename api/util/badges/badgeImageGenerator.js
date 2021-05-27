const svg2img = require('svg2img')
const _truncate = require('lodash/truncate')
const badgeTemplate = require('./badgeTemplate')
const { uploadBuffer, deleteObject } = require('../upload')
const config = require('../../../config/env/resolveConfig')

function gradeToColor (grade) {
  switch (grade) {
    case 'GOLD': return '#F9CE78'
    case 'SILVER': return '#DEDFE3'
    case 'BRONZE': return '#EDB494'
    case 'IRON': return '#B2B4BD'
    default: return '#FFF'
  }
}

function gradeToHeaderColor (grade) {
  switch (grade) {
    case 'NONE':
      return ({
        color: '#4B4D58',
        background: '#DEDFE3'
      })
    default:
      return ({
        color: '#fff',
        background: '#ED6A45'
      })
  }
}

function logoColor (grade) {
  switch (grade) {
    case 'SILVER':
      return '#5C5C5C'
    case 'GOLD':
    case 'BRONZE':
    case 'IRON':
      return '#FFFFFF'
    default:
      return '#5C5C5C'
  }
}

function truncateBadgeText (text = '') {
  return _truncate(text, { length: 29 })
}

function template (params) {
  const headerProps = gradeToHeaderColor(params.grade)
  // replace icon color
  const icon = params.type.icon.replace('fill="white"', `fill="${headerProps.color}"`)
  return badgeTemplate({
    logoColor: logoColor(params.grade),
    backgroundColor: gradeToColor(params.grade),
    header: headerProps,
    name: params.type.name,
    icon,
    title: params.title,
    description: [
      ...params.messages,
      (params && params.project) && truncateBadgeText(params.project.name)
    ].filter(Boolean)
  })
}

module.exports = {
  generateMultipleImages: async (badgeImage, additionalSizes, fileName) => {
    const badges = []
    if (!fileName) {
      fileName = module.exports.generateBadgeName(badgeImage, false)
    }

    badges.push(await module.exports.generateImage(badgeImage, `${fileName}.png`))

    const additionalBadges = await Promise.all(additionalSizes.map(async (size) => {
      return await module.exports.generateImage(badgeImage, `${fileName}_${size.width}x${size.height}.png`, size)
    }))

    return [
      ...badges,
      ...additionalBadges
    ]
  },
  generateBadgeName: (badgeImage, includeExtension = true) => {
    const today = (new Date()).toISOString()
    const fileDate = today.split('T').length > 0 ? today.split('T')[0] : ''
    // In order to make sure the filename is unique to a badge
    const rand = Math.random()
    const fileName = `${badgeImage.type.name}_userId_${badgeImage.userId}_${fileDate}_rand${rand}`

    if (includeExtension) {
      return `${fileName}.png`
    }

    return fileName
  },
  generateImage: async (badgeImage, fileName, options) => {
    if (!fileName) {
      fileName = module.exports.generateBadgeName(badgeImage)
    }

    try {
      const badge = await module.exports.create(badgeImage, options, false)
      if (!badge) {
        throw new Error('Unable to generate badge.')
      }
      // TODO find name of image that makes sense
      await module.exports.upload(badge, fileName)
      return `https://${config.custom.AWS_S3_PUBLIC_BUCKET}.s3-${config.custom.AWS_S3_REGION}.amazonaws.com/badges/${fileName}`
    } catch (error) {
      throw new Error(error)
    }
  },
  /**
   * Generate a badge image
   * @param {object} data Badge data object
   * @param {object} options Options to svg2img converter
   * @param {boolean} isSvg If true we return the badge svg string otherwise returns a png buffer
   *
   * @returns {mixed} badge png buffer or badge svg string
   */
  create: (data, options, isSvg) => {
    const badge = template(data)

    if (isSvg) {
      return badge
    }

    return new Promise((resolve, reject) => {
      try {
        // convert to png
        svg2img(badge, options, async (error, buffer) => {
          if (error) {
            process.env.DEBUG && console.error('Unable to generate badge PNG.', error)
            reject(error)
          }
          resolve(buffer)
        })
      } catch (e) {
        throw new Error(e)
      }
    })
  },
  /**
   * Upload badge to AWS S3
   * @param {buffer} buffer Badge image buffer
   * @param {string} pathname name for file and folder structure, will be prepended with badges/
   */
  upload: async (buffer, pathname) => {
    const key = `badges/${pathname}`
    try {
      return await uploadBuffer(
        buffer,
        key
      )
    } catch (error) {
      process.env.DEBUG && console.error('Unable to upload badge.', error)
      throw error
    }
  },
  /**
   * Delete badges from AWS S3
   * @param {string} pathname name for file and folder structure, will be prepended with badges/
   */
  delete: async (pathname) => {
    const key = `badges/${pathname}`
    try {
      const uploadResponse = await deleteObject(key)
      return uploadResponse
    } catch (e) {
      process.env.DEBUG && console.error('Unable to delete badge image.', e)
      return false
    }
  }
}
