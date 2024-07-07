const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Banana = sequelize.define('Banana', {
    userID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: false
  });

  return Banana;
};
