const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const Friend = sequelize.define('Friend', {
        friendID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fromID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'userID',
            },
            allowNull: false,
        },
        toID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'userID',
            },
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending'
        }
    }, {
        timestamps: true
    });

    return Friend;
};
