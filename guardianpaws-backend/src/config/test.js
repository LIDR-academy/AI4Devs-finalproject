const { Client } = require('pg');

const client = new Client({
  host: "guardianpaws-db.c4jyg8saer66.us-east-1.rds.amazonaws.com",
  port: 5432,
  user: "guardianpaws_admin",
  password: "TU_PASSWORD",
  database: "guardianpaws"
});

client.connect()
  .then(() => console.log("Connected to database"))
  .catch(err => console.error("Connection error", err.stack))
  .finally(() => client.end());
