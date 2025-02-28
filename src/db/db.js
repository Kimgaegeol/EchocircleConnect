const { Pool } = require("pg");

const client = new Pool({
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  host: process.env.DBHOST,
  database: process.env.DBDATABASE,
  port: process.env.DBPORT,
  max: 10,
});

client.connect();

module.exports = client;
