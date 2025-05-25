// backend/migrations/YYYYMMDDHHMMSS-create-bill.js (Replace YYYYMMDDHHMMSS with actual timestamp)
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bills', { // Table name is 'bills'
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      due_date: { // Column name in DB
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      recurrence: {
        type: Sequelize.ENUM('monthly', 'yearly', 'one-time', 'weekly', 'bi-weekly', 'quarterly'),
        allowNull: false,
        defaultValue: 'monthly',
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'upcoming', 'overdue'),
        allowNull: false,
        defaultValue: 'upcoming',
      },
      reminder_date: { // Column name in DB
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      user_id: { // Foreign key
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // Name of the users table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bills');
  }
};