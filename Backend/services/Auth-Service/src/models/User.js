const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
//Imports the Sequelize connection from db.js to attach this model to the database

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
}, {
  timestamps: true,//timestamps: true automatically adds createdAt and updatedAt columns
});

module.exports = User; //this model to the database => Exports the User model so controllers can use it to query/create/update user