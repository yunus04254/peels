const { DataTypes, DATE } = require('sequelize');
module.exports = function(sequelize){
    const Journal = sequelize.define('Journal', {
        journalID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        creationDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        isPrivate: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },

        theme: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        reminder: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        lastReminder: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },

        lastCreated: {
            type: DataTypes.DATE,
            allowNull: true, // Initially, this can be null if no entries exist
        },


        }, {
        timestamps: false
    });

}
