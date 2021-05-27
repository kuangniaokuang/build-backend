var sails = require('sails');

const { createTestDB, tearDownDatabase } = require('../db/createTestDB')
const dbConfig = require('../config/env/resolveConfig').custom.ceDatabase

// Before running any tests...
before(function (done) {
  console.log('*****LIFTING SAILS FOR TEST*******')

  // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
  this.timeout(50000);
  // sails.config = test
  sails.lift({
    // Your Sails app's configuration files will be loaded automatically,
    // but you can also specify any other special overrides here for testing purposes.

    // For example, we might want to skip the Grunt hook,
    // and disable all logs except errors and warnings:
    hooks: {
      grunt: false
    },
    log: {
      level: 'warn'
    },

  }, async function (err) {
    if (err) {
      console.log('ERROR: lifting sails for staging')
      return done(err);
    }

    const dbName = await createTestDB()

    if (!dbName) {
      throw new Error('Failed to create test db')
    }

    return done();
  });
});

// After all tests have finished...
after(async function () {
  console.log('*****LOWERING SAILS FOR TEST*******')

  await tearDownDatabase(dbConfig)

  await sails.lower();
});
