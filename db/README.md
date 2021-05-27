# Installing Postgres

## On mac

### Install postgres with homebrew

```
brew install postgresql
brew services start postgresql # start postgresql service
which psql # verify psql can be found
```

To stop the service, run

```
brew services stop postgresql
```

### Init a database

```
psql postgres -c "CREATE DATABASE cebackend"
psql postgres -c "CREATE SCHEMA cebackend"
psql postgres -c "CREATE USER merico PASSWORD 'merico'"
psql postgres -c "ALTER USER merico WITH SUPERUSER"
psql postgres -c "GRANT ALL ON ALL TABLES IN SCHEMA cebackend to merico"
psql postgres -c "GRANT ALL ON ALL TABLES IN SCHEMA public to merico"
psql postgres -c "GRANT ALL ON SCHEMA cebackend to merico"
```

### Insert a fask table as a test

```
psql postgres -c "CREATE TABLE test (coltest varchar(20));"
psql postgres -c "insert into test (coltest) values ('It works!');"
psql postgres -c "SELECT * from test"
psql postgres -c "DROP TABLE test"
```

You should see the message "It works!" in the results of the select

## Migrating your database to have the correct tables

https://sequelize.org/master/manual/migrations.html

The configuration for migrations is stored in a different file than the server at config/config.js

### Generate a new migration

`npx sequelize-cli migration:generate --name add-user-fileds`

But remember, you will also need to modify the class in `db/models`

### Run all migrations

```
npx sequelize-cli db:migrate
```

Some other useful commands:

```
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-create-posts.js
npx sequelize-cli db:migrate:undo:all
```

on staging: `npx sequelize db:migrate --url 'postgresql://username:password@XXX/postgres'`

## DB GUI Tool - PG Admin 4

https://www.pgadmin.org/download/

## Query a model in Node code

```
const { User } = require('../../db/models')
const ceQuery = require('../util/ceQuery')

// This is some sample code for reference
module.exports = {
  test: async (req, res)=>{
    const jane = await User.create({ firstName: "Jane", lastName: "Doe" });
    let sql = 'SELECT * FROM public."Users" where id = ?;'
    let variables = [1]
    ceQuery.execute(sql, variables, res, (data)=>{
        return res.status(200).send({data, jane})
    })
  }
}
```

## Backing up a database and restoring it somewhere else

### Backup

```
pg_dumpall --username=postgres --host=100.20.156.140 --port=30005 -l vdev  --password > globals.sql
// pg_dump -Fp -s -v -f db-schema.sql --username=postgres --host=100.20.156.140 --port=30005 --dbname=vdev
// pg_dump -Fc -v -f full.dump --username=postgres --host=100.20.156.140 --port=30005 --dbname=vdev
```

### Restore

```
psql  -f globals.sql postgresql://username:password@path.to.db.machine.rds.amazonaws.com:5432/postgres
// psql  -f db-schema.sql postgresql://username:password@path.to.db.machine.rds.amazonaws.com:5432/postgres
// pg_restore -a -Fc full.dump postgresql://username:password@path.to.db.machine.rds.amazonaws.com:5432/postgres
```
