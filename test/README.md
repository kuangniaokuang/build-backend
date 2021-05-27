# Testing locally

## Integration tests

The integration tests are run on a new DB each time. This is in `db/createTestDb` and is called by `test/lifecycle.test.js` That db is seeded with `test/test_db.dump`

### Set up

You need to have a `config/local.js` that points to a working database.

`NODE_ENV=localTesting npm run integration-test`

You need database.json to have

```
"localTesting": {
  "user": "merico",
  "host": "localhost",
  "database": "testingdb",
  "password": "merico",
  "port": 5432,
  "dialect": "postgres"
},
```

Then you need a file in config/env/localTesting.js that is a copy of local.js with the DB name changed to

`ceDatabase: ceDbConfig.localTesting`

## Update the dump with new data

1. Load the db and run the app: `npm run dev-with-test-db`
2. Make changes in the UI for your user (leave the old test data alone)
3. Run `test/dump_db.sh`. This overwrites `test/test_db.dump`
4. Commit `test/test_db.dump` to source
5. Drop the testing db: `npm run destroy-test-db`

NOTE: if you run into rebase conflicts in the test_db.dump file, the easiest thing to do is `git add <file>` and then `git rebase --continue`. But then you will have to re-apply your changes to the dump.
