#!/bin/bash

# Dump the test db to file

DB_NAME=${1:-testingdb}
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
FILE_NAME=${2:-test_db.dump}

echo "Dumping ${dbName} to ${FILE_NAME}"

pg_dump -h localhost -U merico -d $DB_NAME -Fc > $SCRIPTPATH/$FILE_NAME

echo "Done dumping DB"
