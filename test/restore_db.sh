#!/bin/bash

# Restore test db from file

DB_NAME=${1:-IntegrationTestDB-CE}
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
HOST_NAME=${2:-postgres_ci_test}
PASSWORD=${3:-postgres123}
USER=${4:-merico}
FILE_NAME=${5:-test_db.dump}

echo "Restoring ${DB_NAME} from ${SCRIPTPATH}/${FILE_NAME}"

export PGPASSWORD=$PASSWORD; pg_restore -h $HOST_NAME -U $USER -d $DB_NAME < "${SCRIPTPATH}/${FILE_NAME}"

echo "Done restoring DB"
