const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const Style = sequelize.define('Style', {
        styleID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        costInBananas: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        }, {
        timestamps: false
    });
}

