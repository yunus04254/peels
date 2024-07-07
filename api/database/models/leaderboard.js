const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const Leaderboard = sequelize.define('Leaderboard', {
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
        }, {
        timestamps: false
    });
}
