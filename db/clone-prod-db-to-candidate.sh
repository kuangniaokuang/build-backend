#!/bin/bash

# Display information on what is going to happen
clear;
echo -e "This script will perform the following actions:\n"
echo "1. Destroy current candidate DB"
echo "2. Create a snapshot of the current production DB"
echo "3. Sleep for 10 minutes while snapshot creates"
echo "4. Deploy new candidate DB based on production DB snapshot"

# Set and display configuration
db_snapshot=prod-dump-$(date +"%m-%d-%y")
prod_db=ce-mericobuild-production-us-west-2
candidate_db=ce-mericobuild-candidate-us-west-2
region=us-west-2
echo -e "\n------------ Configuration ------------\ndb_snapshot: '$db_snapshot'\nprod_db: '$prod_db'\ncandidate_db: '$candidate_db'\nregion: '$region'\n---------------------------------------\n";

# Get user confirmation before doing
read -p "Press any key to continue..." -n 1

# Terminate old candidate DB
echo -e "\nTerminating old candidate DB ('$candidate_db')"
aws rds delete-db-instance --db-instance-identifier $candidate_db --region $region --skip-final-snapshot >/dev/null && echo "Candidate DB has been terminated"

# Create Prod DB Snapshot
echo -e "\nCreating new DB snapshot..."
aws rds create-db-snapshot --db-snapshot-identifier $db_snapshot --db-instance-identifier $prod_db --region $region
echo "Going to sleep while snapshot is being created... (This will take a few minutes!)"

# Sleep for 10 minutes while the snapshot is being created
for a in {1..10}
    sleep 60
    echo "Still waiting for snapshot..."
done;

# Create new Candidate DB
echo "Proceeding with new candidate DB creation."

aws rds restore-db-instance-from-db-snapshot --db-instance-identifier $candidate_db --db-snapshot-identifier $db_snapshot --region $region --db-instance-class db.m5.large --db-subnet-group-name prod-vpc-dbsubnet --no-multi-az --vpc-security-group-ids sg-053eaf9e94581c4c1 sg-099910fedea41ec54 sg-01475da9c476475be