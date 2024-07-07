const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const Notifications = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        redirect: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isSent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
          },

    });
}
