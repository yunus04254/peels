const { DataTypes } = require('sequelize');
module.exports = function (sequelize) {
    sequelize.define('Entry', {
        entryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mood: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isDraft: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: false
    });
}
