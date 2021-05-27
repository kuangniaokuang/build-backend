const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
should = chai.should();
const { mockRequest, mockResponse } = require('mock-req-res')

const { formatDate } = require('../util/helpers')
const userUtil = require('../../api/util/user')
const emailUtil = require('../../api/util/email')
const contributorUtil = require('../../api/util/contributors')
const ContributorsController = require('../../api/controllers/ContributorsController');

describe ('ContributorsController', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe ('profile', () => {
    it ('returns a 500 error if we throw', async () => {
      sinon.stub(userUtil, 'findOneByEmail').throws('We had a problem')
      const req = mockRequest({
        query: {
          email: 'jdivock@stripe.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.profile(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.meta.stack).to.include('We had a problem')
    })

    it ('validates the email', async () => {
      const req = mockRequest({
        query: {
          email: 'no@a@good@...email.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.profile(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'Invalid email format',
          meta: {
            email: 'no@a@good@...email.com'
          }
        }
      })
    })

    it ('returns a profile for a user', async () => {
      const req = mockRequest({
        query: {
          email: 'jdivock@stripe.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.profile(req, res)

      const profile = res.send.args[0][0].data

      expect(profile.email).to.equal('jdivock@stripe.com')
      expect(profile.userId).to.equal(5)
      expect(profile.displayName).to.equal('')
      expect(profile.username).to.equal('mericoqa3')
      expect(profile.profileUrl).to.equal('https://github.com/mericoqa3')
      expect(profile.photoUrl).to.equal('https://avatars.githubusercontent.com/u/76010241?v=4')
      expect(profile.provider).to.equal('github')
      expect(profile.topLanguages).to.deep.equal([{
        language: 'JavaScript',
        eloc: 1456,
        percentile: 10,
      }])
      expect(profile.badges).to.have.length(3)
    })

    it ('returns a profile for a contributor', async () => {
      const req = mockRequest({
        query: {
          email: 'tomas@stripe.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.profile(req, res)

      const profile = res.send.args[0][0].data

      expect(profile.email).to.equal('tomas@stripe.com')
      expect(profile.userId).to.equal(null)
      expect(profile.displayName).to.equal('Tomas Mattia')
      expect(profile.username).to.equal('tomas-stripe')
      expect(profile.profileUrl).to.equal('https://github.com/tomas-stripe')
      expect(profile.photoUrl).to.equal('https://avatars.githubusercontent.com/u/58276709?v=4')
      expect(profile.provider).to.equal('github')
      expect(profile.topLanguages).to.have.length(0)
      expect(profile.badges).to.have.length(0)
    })

    it ('handles the case where there is no user or contributor', async () => {
      const req = mockRequest({
        query: {
          email: 'nobody@notauser.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.profile(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'No user or contributor found for email',
          meta: {
            email: 'nobody@notauser.com'
          }
        }
      })
    })
  })

  describe ('top-repositories', () => {
    it ('returns top repositories for a user', async () => {
      const req = mockRequest({
        query: {
          email: 'mericogold@merico.gonze.com', // User 2 / mericoqa1,
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-04-1T14:08:35.408-08:00'
        }
      })
      const res = mockResponse()

      await ContributorsController.topRepositories(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0]).to.deep.equal({
        data: [
          {
            repoName: 'linguist-gold',
            gitUrl: 'git://github.com/mericogold/linguist-gold.git',
            eloc: 164,
            elocRank: 1,
            impact: 1,
            impactRank: 1,
            merges: 0,
            mergeRank: 1
          },
          {
            repoName: 'linguist-silver',
            gitUrl: 'git://github.com/mericogold/linguist-silver.git',
            eloc: 82,
            elocRank: 3,
            impact: 1,
            impactRank: 1,
            merges: 0,
            mergeRank: 1
          },
          {
            repoName: 'trailblazer-meets-min-contributors',
            gitUrl: 'git://github.com/mericogold/trailblazer-meets-min-contributors.git',
            eloc: 87,
            elocRank: 2,
            impact: 0.86,
            impactRank: 3,
            merges: 0,
            mergeRank: 1
          },
          {
            repoName: 'QA100ELOC',
            gitUrl: 'git://github.com/mericogold/QA100ELOC.git',
            eloc: 48,
            elocRank: 4,
            impact: 0.1,
            impactRank: 4,
            merges: 0,
            mergeRank: 1
          }
        ]
      })
    })

    it ('returns a sensible error when it cannot find a user', async () => {
      const req = mockRequest({
        query: {
          email: 'not@auser.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.topRepositories(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'No user or contributor found for email',
          meta: {
            email: 'not@auser.com'
          }
        }
      })
    })

    it ('it returns top repositories for a contributor', async () => {
      const req = mockRequest({
        query: {
          email: 'jdivock@stripe.com', // contributor id 3
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-04-1T14:08:35.408-08:00'
        }
      })
      const res = mockResponse()

      await ContributorsController.topRepositories(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0]).to.deep.equal({
        data: [{
          eloc: 1517,
          elocRank: 1,
          gitUrl: 'git://github.com/stripe/terminal-js.git',
          impact: 1,
          impactRank: 1,
          mergeRank: 1,
          merges: 0,
          repoName: 'terminal-js'
        }]
      })
    })

    it ('validates the email', async () => {
      const req = mockRequest({
        query: {
          email: 'no@a@good@...email.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.topRepositories(req, res)

      expect(res.status).to.have.been.calledWith(400)
    })

    it ('returns a 500 error if we throw', async () => {
      sinon.stub(contributorUtil, 'findOneByEmail').throws('We had a problem')
      const req = mockRequest({
        query: {
          email: 'jdivock@stripe.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.topRepositories(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.meta.stack).to.include('We had a problem')
    })
  })

  describe ('progress', () => {
    it ('returns progress for a user', async () => {
      const req = mockRequest({
        query: {
          email: 'git@vincenttunru.com',
          gitUrl: 'https://gitlab.com/Flockademic/whereisscihub.git',
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-04-7T14:08:35.408-08:00'
        }
      })
      const res = mockResponse()

      await ContributorsController.progress(req, res)

      expect(res.status).to.have.been.calledWith(200)
      const data = res.send.args[0][0].data

      expect(data.gitUrl).to.equal('https://gitlab.com/Flockademic/whereisscihub.git')
      expect(data.progress).to.deep.equal([
        { date: formatDate('2018-03-01T12:00:00.000Z'), eloc: 235 },
        { date: formatDate('2018-04-01T12:00:00.000Z'), eloc: 235 },
        { date: formatDate('2018-05-01T12:00:00.000Z'), eloc: 235 },
        { date: formatDate('2018-06-01T12:00:00.000Z'), eloc: 235 },
        { date: formatDate('2018-07-01T12:00:00.000Z'), eloc: 346 },
        { date: formatDate('2018-08-01T12:00:00.000Z'), eloc: 346 },
        { date: formatDate('2018-09-01T12:00:00.000Z'), eloc: 346 },
        { date: formatDate('2018-10-01T12:00:00.000Z'), eloc: 346 },
        { date: formatDate('2018-11-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2018-12-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-01-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-02-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-03-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-04-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-05-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-06-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-07-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-08-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-09-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-10-01T12:00:00.000Z'), eloc: 410 },
        { date: formatDate('2019-11-01T12:00:00.000Z'), eloc: 525 }
      ])
      expect(data.velocity).to.deep.equal([
        { date: formatDate('2018-03-01T12:00:00.000Z'), eloc: 235 },
        { date: formatDate('2018-04-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2018-05-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2018-06-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2018-07-01T12:00:00.000Z'), eloc: 111 },
        { date: formatDate('2018-08-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2018-09-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2018-10-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2018-11-01T12:00:00.000Z'), eloc: 64 },
        { date: formatDate('2018-12-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-01-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-02-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-03-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-04-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-05-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-06-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-07-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-08-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-09-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-10-01T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2019-11-01T12:00:00.000Z'), eloc: 115 }
      ])
      expect(data.impact).to.deep.equal([
        { date: formatDate('2018-03-01T12:00:00.000Z'), impact: 1 },
        { date: formatDate('2018-04-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2018-05-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2018-06-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2018-07-01T12:00:00.000Z'), impact: 1 },
        { date: formatDate('2018-08-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2018-09-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2018-10-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2018-11-01T12:00:00.000Z'), impact: 1 },
        { date: formatDate('2018-12-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-01-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-02-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-03-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-04-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-05-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-06-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-07-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-08-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-09-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-10-01T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2019-11-01T12:00:00.000Z'), impact: 1 }
      ])
      expect(data.merges).to.deep.equal([
        { date: formatDate('2018-07-01T12:00:00.000Z'), merged: 2, opened: 0 },
        { date: formatDate('2018-08-01T12:00:00.000Z'), merged: 0, opened: 0 },
        { date: formatDate('2018-09-01T12:00:00.000Z'), merged: 0, opened: 0 },
        { date: formatDate('2018-10-01T12:00:00.000Z'), merged: 0, opened: 0 },
        { date: formatDate('2018-11-01T12:00:00.000Z'), merged: 1, opened: 0 }
      ])

      expect(data.latestCommits[0]).to.deep.equal({
        date: new Date('2019-11-24T14:13:15.000Z'),
        message: 'FIXUP: Does adding a build config work?\n',
        eloc: 0,
        impact: 0
      })
      expect(data.latestCommits).to.have.length(10)
      expect(data.interval).to.equal('month')
    })

    it ('returns progress for a contributor', async () => {
      const req = mockRequest({
        query: {
          email: 'tomas@stripe.com',
          gitUrl: 'git://github.com/stripe/terminal-js.git',
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-04-7T14:08:35.408-08:00'
        }
      })
      const res = mockResponse()

      await ContributorsController.progress(req, res)

      expect(res.status).to.have.been.calledWith(200)
      const data = res.send.args[0][0].data

      expect(data.gitUrl).to.equal('git://github.com/stripe/terminal-js.git')

      expect(data.progress).to.deep.equal([
        { date: formatDate('2020-07-10T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2020-07-11T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2020-07-12T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2020-07-13T12:00:00.000Z'), eloc: 0 }
      ])
      expect(data.velocity).to.deep.equal([
        { date: formatDate('2020-07-10T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2020-07-11T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2020-07-12T12:00:00.000Z'), eloc: 0 },
        { date: formatDate('2020-07-13T12:00:00.000Z'), eloc: 0 }
      ])
      expect(data.impact).to.deep.equal([
        { date: formatDate('2020-07-10T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2020-07-11T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2020-07-12T12:00:00.000Z'), impact: 0 },
        { date: formatDate('2020-07-13T12:00:00.000Z'), impact: 0 }
      ])

      expect(data.latestCommits).to.have.length(3)
      expect(data.latestCommits[0]).to.deep.equal({
        date: new Date('2020-07-13T21:42:19.000Z'),
        message: 'Fix check for hub command existence in publish script\n',
        eloc: 0,
        impact: 0
      })
    })

    it ('returns a 500 error if we throw', async () => {
      sinon.stub(contributorUtil, 'findOneByEmail').throws('We had a problem')
      const req = mockRequest({
        query: {
          email: 'tomas@stripe.com',
          gitUrl: 'git://github.com/stripe/terminal-js.git'
        }
      })
      const res = mockResponse()

      await ContributorsController.progress(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.meta.stack).to.include('We had a problem')
    })

    it ('handles the case where there is no user or contributor', async () => {
      const req = mockRequest({
        query: {
          email: 'nobody@notauser.com',
          gitUrl: 'git://github.com/stripe/terminal-js.git'
        }
      })
      const res = mockResponse()

      await ContributorsController.progress(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'No user or contributor found for email',
          meta: {
            email: 'nobody@notauser.com'
          }
        }
      })
    })
  })

  describe ('badges', () => {
    it ('gets badges for a user', async () => {
      const req = mockRequest({
        query: {
          email: 'jdivock@stripe.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.badges(req, res)

      const badges = res.send.args[0][0].data

      expect(badges).to.have.length(3)
      expect(badges[0]).to.deep.equal({
        id: 48,
        name: 'Got Started',
        type: 'gotStarted',
        grade: 'GOLD',
        description: 'Created account at Merico',
        rankNumerator: '1',
        rankDenominator: '10',
        imageUrl: 'https://merico-build.s3-us-west-2.amazonaws.com/badges/gotStarted_userId_5_2021-04-01_rand0.37986542865077855.png',
        createdAt: new Date('2021-04-01T16:57:22.485Z'),
        updatedAt: new Date('2021-04-01T16:57:22.484Z'),
        BadgeType: {
          title: 'Got Started',
          criteria: 'Create an account with Merico',
          icon: '<path d="M8.0001 0.666748C8.25385 0.666748 8.48559 0.810796 8.5979 1.03833L10.5029 4.89773L14.7632 5.52042C15.0142 5.55712 15.2227 5.73312 15.3009 5.97446C15.3792 6.2158 15.3137 6.48063 15.1319 6.65765L12.0498 9.65966L12.7772 13.9007C12.8201 14.1508 12.7172 14.4036 12.5119 14.5528C12.3066 14.7019 12.0344 14.7216 11.8098 14.6035L8.0001 12.6L4.1904 14.6035C3.96579 14.7216 3.6936 14.7019 3.48828 14.5528C3.28296 14.4036 3.18013 14.1508 3.22303 13.9007L3.95042 9.65966L0.868279 6.65765C0.686533 6.48063 0.621018 6.2158 0.69927 5.97446C0.777522 5.73312 0.985975 5.55712 1.23702 5.52042L5.49726 4.89773L7.4023 1.03833C7.51461 0.810796 7.74635 0.666748 8.0001 0.666748ZM8.0001 2.83958L6.53791 5.80183C6.44088 5.9984 6.25342 6.1347 6.03652 6.16641L2.76571 6.64448L5.13192 8.94918C5.28917 9.10234 5.36095 9.32309 5.32384 9.53944L4.76555 12.7945L7.6898 11.2567C7.88405 11.1545 8.11615 11.1545 8.3104 11.2567L11.2346 12.7945L10.6764 9.53944C10.6393 9.32309 10.711 9.10234 10.8683 8.94918L13.2345 6.64448L9.96368 6.16641C9.74678 6.1347 9.55932 5.9984 9.4623 5.80183L8.0001 2.83958Z" transform="translate(40, 6)" fill="white"/>'
        },
        User: { displayName: '' }
      })
      expect(badges[2].Project.name).to.equal('terminal-js')
    })

    it ('returns a 500 error if we throw', async () => {
      sinon.stub(userUtil, 'findOneByEmail').throws('We had a problem')
      const req = mockRequest({
        query: {
          email: 'not@a.user.email',
          gitUrl: 'git://github.com/stripe/terminal-js.git'
        }
      })
      const res = mockResponse()

      await ContributorsController.badges(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.meta.stack).to.include('We had a problem')
    })

    it ('validates the email', async () => {
      const req = mockRequest({
        query: {
          email: 'no@a@good@...email.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.badges(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'Invalid email format',
          meta: {
            email: 'no@a@good@...email.com'
          }
        }
      })
    })

    it ('handles when there is no user found', async () => {
      const req = mockRequest({
        query: {
          email: 'contributor@email.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.badges(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0]).to.deep.equal({
        data: []
      })
    })
  })

  describe ('invite', () => {
    beforeEach(() => {
      sinon.stub(emailUtil, 'sendEmailThroughAWS').resolves(true)
    })

    it ('sends an invite to a contributor', async () => {
      const req = mockRequest({
        body: {
          contributorEmail: 'tomas@stripe.com',
          message: 'Hey contributor, you should join Merico'
        },
        user: {
          displayName: 'Gabe Newell',
          primaryEmail: 'gabe@steam.org'
        }
      })
      const res = mockResponse()

      await ContributorsController.invite(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0]).to.deep.equal(req.body)
      expect(emailUtil.sendEmailThroughAWS).to.have.been.calledOnce
    })

    it ('only sends invites to contributors', async () => {
      const req = mockRequest({
        body: {
          contributorEmail: 'jdivock@stripe.com',
          message: 'Hey contributor, you should join Merico',
        },
        user: {
          displayName: 'Gabe Newell',
          primaryEmail: 'gabe@steam.org'
        }
      })
      const res = mockResponse()

      await ContributorsController.invite(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'No contributor for that email',
          meta: { contributorEmail: 'jdivock@stripe.com' }
        }
      })
      expect(emailUtil.sendEmailThroughAWS).to.not.have.been.called
    })

    it ('returns a 500 when we fail to send', async () => {
      await sinon.restore()
      sinon.stub(emailUtil, 'sendEmailThroughAWS').throws('Amazon could not send your email')

      const req = mockRequest({
        body: {
          contributorEmail: 'tomas@stripe.com',
          message: 'Hey contributor, you should join Merico'
        },
        user: {
          displayName: 'Gabe Newell',
          primaryEmail: 'gabe@steam.org'
        }
      })
      const res = mockResponse()

      await ContributorsController.invite(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'Failed to send invite',
          meta: {
            contributorEmail: 'tomas@stripe.com',
            message: 'Hey contributor, you should join Merico'
          }
        }
      })
    })

    it ('returns 500 when we throw an unexpected error', async () => {
      sinon.stub(contributorUtil, 'findOneByEmail').throws('Bad code!')

      const req = mockRequest({
        body: {
          contributorEmail: 'tomas@stripe.com',
          message: 'Hey contributor, you should join Merico'
        },
        user: {
          displayName: 'Gabe Newell',
          primaryEmail: 'gabe@steam.org'
        }
      })
      const res = mockResponse()

      await ContributorsController.invite(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.message).to.equal('Something went wrong in ContributorsController:invite')
      expect(res.send.args[0][0].error.meta.stack).to.include('Bad code!')
    })

    it ('validates contributor email', async () => {
      const req = mockRequest({
        body: {
          contributorEmail: 'no@a@good@...email.com'
        }
      })
      const res = mockResponse()

      await ContributorsController.invite(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.send.args[0][0]).to.deep.equal({
        error: {
          message: 'Invalid email format for contributor email',
          meta: {
            contributorEmail: 'no@a@good@...email.com'
          }
        }
      })
    })
  })
})
