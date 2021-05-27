const assert = require('assert');
const sinon = require('sinon');
const badgeImageGenerator = require('../../../../../api/util/badges/badgeImageGenerator')

const RANDOM_NUMBER = 0.7305772036980063
const EXAMPLE_BADGE = {
  title: 'Testing title',
  messages: [
    'first message'
  ],
  grade: 'GOLD',
  type: {
    name: 'Testing',
    icon: 'Icon'
  },
  userId: 1,
  project: {
    name: 'Testing project'
  }
}
const today = (new Date()).toISOString()
const CURRENT_DATE = today.split('T').length > 0 ? today.split('T')[0] : ''

describe('badge image generator', () => {
  let stubCreate
  let stubUpload
  // stub create image to not stall test
  beforeEach(() => {
    stubCreate = sinon.stub(badgeImageGenerator, 'create').returns('ANY')
    stubUpload = sinon.stub(badgeImageGenerator, 'upload').returns('ANY')
  });

  afterEach(() => {
    stubCreate.restore()
    stubUpload.restore()
  })

  describe('generateBadgeName', () => {
    let stubMathRandom

    beforeEach(() => {
      stubMathRandom = sinon.stub(Math, 'random').returns(RANDOM_NUMBER)
    });

    afterEach(() => {
      stubMathRandom.restore()
    });

    it('generates badge name with extension when includesExtension is true', () => {
      const badgeName = badgeImageGenerator.generateBadgeName(EXAMPLE_BADGE, true);
      assert.strictEqual(badgeName, `Testing_userId_1_${CURRENT_DATE}_rand${RANDOM_NUMBER}.png`)
    })

    it('generates badge name without extension when includesExtension is false', () => {
      const badgeName = badgeImageGenerator.generateBadgeName(EXAMPLE_BADGE, false);
      assert.strictEqual(badgeName, `Testing_userId_1_${CURRENT_DATE}_rand${RANDOM_NUMBER}`)
    })
  })

  describe('generateImage', () => {
    let stubGenerateBadgeName
    const exampleName = 'EXAMPLE_NAME.png';

    beforeEach(() => {
      stubGenerateBadgeName = sinon.stub(badgeImageGenerator, 'generateBadgeName').returns(exampleName)
    })

    afterEach(() => {
      stubGenerateBadgeName.restore()
    })


    it('generates image with given filename', async () => {
      const response = await badgeImageGenerator.generateImage(EXAMPLE_BADGE, exampleName)
      assert.strictEqual(response, `https://merico-build.s3-us-west-2.amazonaws.com/badges/${exampleName}`)
    })

    it('generates badge with auto-generated filename', async () => {
      const response = await badgeImageGenerator.generateImage(EXAMPLE_BADGE)
      assert.strictEqual(response, `https://merico-build.s3-us-west-2.amazonaws.com/badges/${exampleName}`)
    })
  })

  describe('generateMultipleImages', () => {
    const exampleName = 'EXAMPLE_NAME';

    it('generates one image when no sizes are given', async () => {
      const response = await badgeImageGenerator.generateMultipleImages(EXAMPLE_BADGE, [], exampleName)
      assert.deepStrictEqual(response, [`https://merico-build.s3-us-west-2.amazonaws.com/badges/${exampleName}.png`])
    })

    it('generates one image for each size given', async () => {
      const response = await badgeImageGenerator.generateMultipleImages(
        EXAMPLE_BADGE,
        [{ width: 100, height: 100 }],
        exampleName
      )
      assert.deepStrictEqual(response, [
        `https://merico-build.s3-us-west-2.amazonaws.com/badges/${exampleName}.png`,
        `https://merico-build.s3-us-west-2.amazonaws.com/badges/${exampleName}_100x100.png`,
      ])
    })
  })
})
