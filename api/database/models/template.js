const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const Template = sequelize.define('Template', {
        templateID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3, 18]
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [0, 70]
            },
            defaultValue: ''
        },
        content: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 1000]
            }
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        }
        // another isDefault?
        }, {
        timestamps: false
    });
}
