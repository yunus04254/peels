const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Goal = sequelize.define('Goal', {
    goalID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    reminderEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reminderTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    timestamps: false
  });

  return Goal;
};
