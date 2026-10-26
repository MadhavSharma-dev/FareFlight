const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;

// This code sets up a PostgreSQL database connection using Sequelize ORM.
//Loads credentials (DB name, user, password, host, port) from environment variables via dotenv
//Defaults to port 5432 if DB_PORT isn't set
//Exports the connection so other files (models, etc.) can import and use it
//In short — it's the single database connection object shared across the entire Auth Service.