#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER survey;
	CREATE DATABASE surveydb;
	GRANT ALL PRIVILEGES ON DATABASE surveydb TO survey;
EOSQL
