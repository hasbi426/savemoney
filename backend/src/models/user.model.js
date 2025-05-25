// backend/src/models/user.model.js
module.exports = (sequelize, DataTypes) => {
    const { hashPassword } = require('../utils/password.util');
  
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name cannot be empty' },
        },
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Birthday cannot be empty' },
          isDate: { msg: 'Invalid birthday format' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email address already in use!',
        },
        validate: {
          notEmpty: { msg: 'Email cannot be empty' },
          isEmail: { msg: 'Invalid email format' },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Password cannot be empty' },
          len: {
            args: [6, 255],
            msg: 'Password must be at least 6 characters long',
          },
        },
      },
    }, {
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await hashPassword(user.password);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await hashPassword(user.password);
          }
        },
      },
    });
  
    User.associate = (models) => {
      User.hasMany(models.Transaction, {
        foreignKey: 'userId',
        as: 'transactions',
      });
      User.hasMany(models.Bill, { // <<<--- ADD THIS ASSOCIATION
        foreignKey: 'userId',
        as: 'bills',
      });
    };
  
    return User;
  };