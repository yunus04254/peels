const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    sequelize.define('Bookmark', {
        bookmarkID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        // Reference to the Entry
        entryID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Entries', // name of the Entries model
                key: 'entryID',
            }
        },
        // Reference to the User
        UserUserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // name of the Users model
                key: 'userID',
            }
        }
        }, {
        // Timestamps enabled to show bookmarked entries sorted by time    
        timestamps: true 
    });
};