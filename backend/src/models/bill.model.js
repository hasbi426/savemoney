// backend/src/models/bill.model.js
module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define('Bill', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Bill name cannot be empty' } },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { isDecimal: { msg: 'Amount must be a decimal' }, min: { args: [0.01], msg: 'Amount must be positive' } },
    },
    dueDate: { // Field name in JS model (Sequelize maps to due_date in DB by default)
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: { msg: 'Invalid due date' } },
    },
    recurrence: {
      type: DataTypes.ENUM('monthly', 'yearly', 'one-time', 'weekly', 'bi-weekly', 'quarterly'),
      allowNull: false,
      defaultValue: 'monthly',
      validate: { isIn: { args: [['monthly', 'yearly', 'one-time', 'weekly', 'bi-weekly', 'quarterly']], msg: 'Invalid recurrence type' } },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('unpaid', 'paid', 'upcoming', 'overdue'),
      allowNull: false,
      defaultValue: 'upcoming',
      validate: { isIn: { args: [['unpaid', 'paid', 'upcoming', 'overdue']], msg: 'Invalid status' } },
    },
    reminderDate: { // Field name in JS model (Sequelize maps to reminder_date in DB)
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: { isDate: { msg: 'Invalid reminder date' } },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // userId is added via association
  }, {
    tableName: 'bills',
    timestamps: true,
    // If you want Sequelize to also use snake_case for fields in JS (e.g., bill.due_date), add:
    // underscored: true,
  });

  Bill.associate = (models) => {
    Bill.belongsTo(models.User, {
      foreignKey: 'userId', // This will create 'user_id' column in the 'bills' table
      as: 'user',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Bill;
};