const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const Marketplace = sequelize.define('Marketplace', {
        itemID: {
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
            allowNull: false,
        },
        itemType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        }, {
            timestamps: false
    });
}

