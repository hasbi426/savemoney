// backend/src/models/transaction.model.js
module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Description cannot be empty' },
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2), // Suitable for currency
        allowNull: false,
        validate: {
          isDecimal: { msg: 'Amount must be a decimal number' },
          min: { args: [0.01], msg: 'Amount must be greater than 0' },
        },
      },
      type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['income', 'expense']],
            msg: 'Type must be either "income" or "expense"',
          },
        },
      },
      date: {
        type: DataTypes.DATEONLY, // Stores YYYY-MM-DD
        allowNull: false,
        validate: {
          isDate: { msg: 'Invalid date format' },
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true, // Can be made mandatory by setting to false
      },
      // userId is added via association by Sequelize
    }, {
      tableName: 'transactions',
      timestamps: true,
      // underscored: true, // if you want field names in JS to be snake_case as well.
                          // By default, Sequelize converts camelCase (userId) to snake_case (user_id) in DB.
    });
  
    Transaction.associate = (models) => {
      Transaction.belongsTo(models.User, {
        foreignKey: 'userId', // This name (userId) will be used in JS
                             // It will create 'user_id' column in the 'transactions' table
        as: 'user',
        onDelete: 'CASCADE', // If a user is deleted, their transactions are also deleted
        onUpdate: 'CASCADE',
      });
    };
  
    return Transaction;
  };