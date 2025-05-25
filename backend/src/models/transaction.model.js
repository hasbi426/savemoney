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
        type: DataTypes.DECIMAL(10, 2),
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
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: { msg: 'Invalid date format' },
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true, // Or false if you want it mandatory
      },
      // userId is added via association
    }, {
      tableName: 'transactions',
      timestamps: true, // Adds createdAt and updatedAt fields
      // Sequelize automatically converts camelCase model fields to snake_case table columns
      // underscored: true, // if you prefer snake_case in your JS code too
    });
  
    Transaction.associate = (models) => {
      Transaction.belongsTo(models.User, {
        foreignKey: 'userId', // This will create 'userId' field in Transaction table
                              // Sequelize will create it as user_id in the DB by default if underscored: true
        as: 'user',        // Alias for the association
      });
    };
  
    return Transaction;
  };