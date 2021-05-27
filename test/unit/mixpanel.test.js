const assert = require('assert')
const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const {
  config,
  mixpanel,
  MP,
  isStaffMember,
  hasStaffDomain,
  RepositoryEvents,
  BadgeEvents
} = require('../../api/util/mixpanel')

describe('Mixpanel', () => {
  const sandbox = sinon.createSandbox()
  let staffEmail
  let staffUserDomainEmail
  let staffDomainEmails

  beforeEach(() => {
  	// Stub Mixpanel Configuration (developer.merico.build)
  	sandbox.stub(config, 'mixpanel').value({
      enabled: true,
      apiKey: 'hf48f7hw498hf9h45hs7'
  	})
  	staffEmail = 'MericoE2E@merico.gonze.com'
  	staffUserDomainEmail = 'MericoE2E-Staff-User-NO-EXIST@s.gonze.com'
  	staffDomainEmails = [
  		'RandomEmail100@merico.gonze.com',
  		'RandomEmail200@merico.gonze.com',
  		'RandomEmail300@merico.gonze.com',
  		'RandomEmail100@s.gonze.com',
  		'RandomEmail200@s.gonze.com',
  		'RandomEmail300@s.gonze.com',
  	]
  })

  afterEach(() => {
		sandbox.restore();
  })

  it('skips tracking for staff users emails', () => {
  	assert.strictEqual(isStaffMember(staffEmail), true)
  })

  it('skips tracking for staff user domains', () => {

  	staffDomainEmails.forEach((email) => {
  		assert.strictEqual(hasStaffDomain(email), true)
  	})
  })

  it('tracks successful analysis complete event', () => {
  	sandbox.spy(MP, 'track')
  	sandbox.spy(mixpanel, 'track')
  	MP.track({
  		...RepositoryEvents.ANALYSIS_COMPLETED,
  		name: `UNIT TEST - ${RepositoryEvents.ANALYSIS_COMPLETED.name}`
  	}, {distinct_id: 'MericoE2E@merico.gonze.com'})
  	assert(MP.track.calledOnce)
  	assert(mixpanel.track.calledOnce)
  })

  it('tracks failed analysis event', () => {
  	sandbox.spy(MP, 'track')
  	sandbox.spy(mixpanel, 'track')
  	MP.track({
  		...RepositoryEvents.ANALYSIS_FAILED,
  		name: `UNIT TEST - ${RepositoryEvents.ANALYSIS_FAILED.name}`
  	}, {distinct_id: 'MericoE2E@merico.gonze.com'})
  	assert(MP.track.calledOnce)
  	assert(mixpanel.track.calledOnce)
  })

  it('will not track identified staff user email address in production', () => {
  	// simulate this environment as prod (Staff E-mail Exclusions only happen in production)
  	const ProdEnvironmentName = process.env.NODE_ENV
  	sandbox.spy(MP, 'track')
  	sandbox.spy(mixpanel, 'track')
  	let staffUserEmail = 'MericoE2E@merico.gonze.com'
  	// We don't expect to see this event actually being tracked...
  	MP.track({name: 'TESTING: STAFF USER NOT TRACKED'}, {
  		distinct_id: staffUserEmail
  	}, ProdEnvironmentName)
  	assert(MP.track.calledOnce)
  	assert(mixpanel.track.notCalled)
  })

  it('will not track identified staff user domain in production', () => {
  	// simulate this environment as prod (Staff Domain Exclusions only happen in production)
  	const ProdEnvironmentName = process.env.NODE_ENV
  	sandbox.spy(MP, 'track')
  	sandbox.spy(mixpanel, 'track')

  	// We don't expect to see this event actually being tracked...
  	MP.track({name: 'TESTING: STAFF DOMAIN USER NOT TRACKED'}, {
  		distinct_id: staffUserDomainEmail
  	}, ProdEnvironmentName)
  	assert(MP.track.calledOnce)
  	assert(mixpanel.track.notCalled)
  })

  // @todo: trackAnalysisComplete
  // @todo: trackAnalysisFailed
  // @todo: trackBadgeGenerated

})
