#!/usr/bin/env bash
# =============================================================
# MySQL initialisation script
# Executed once by the mysql:8.0 container on first start.
# Creates the two microservice databases and their dedicated
# least-privilege users from environment variables.
# =============================================================
set -euo pipefail

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL

-- ============================================================
-- ms-router
-- ============================================================
CREATE DATABASE IF NOT EXISTS \`${ROUTER_DB_NAME}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '${ROUTER_DB_USER}'@'%'
  IDENTIFIED BY '${ROUTER_DB_PASSWORD}';

GRANT SELECT, INSERT, UPDATE, DELETE,
      CREATE, DROP, INDEX, ALTER, REFERENCES,
      CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE
  ON \`${ROUTER_DB_NAME}\`.*
  TO '${ROUTER_DB_USER}'@'%';

-- ============================================================
-- ms-planifications
-- ============================================================
CREATE DATABASE IF NOT EXISTS \`${PLANIFICATIONS_DB_NAME}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '${PLANIFICATIONS_DB_USER}'@'%'
  IDENTIFIED BY '${PLANIFICATIONS_DB_PASSWORD}';

GRANT SELECT, INSERT, UPDATE, DELETE,
      CREATE, DROP, INDEX, ALTER, REFERENCES,
      CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE
  ON \`${PLANIFICATIONS_DB_NAME}\`.*
  TO '${PLANIFICATIONS_DB_USER}'@'%';

FLUSH PRIVILEGES;

EOSQL

echo "[init] Databases and users created successfully."
