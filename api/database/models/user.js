const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
    const User = sequelize.define('User', {
        userID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
        },
        uid: {
            type: DataTypes.STRING,
            unique: true,
        },
        bananas: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        registrationDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        lastLoginDate: {
            type: DataTypes.DATE,
        },
        daysInARow: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // Experience points
        },
        entryCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // Start with zero entries for new users
        },
        favBadge: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        favPfp: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        earnedBadges: {
            type: DataTypes.TEXT, // Use TEXT to store a stringified JSON array
            defaultValue: '[]', // Default value as an empty array in string format
            get() {
                const rawValue = this.getDataValue('earnedBadges');
                return JSON.parse(rawValue || '[]'); // Ensure parsing does not fail
            },
            set(value) {
                this.setDataValue('earnedBadges', JSON.stringify(value));
            },
        },
    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['username']
            },
            {
                unique: true,
                fields: ['email']
            },
            {
                unique: true,
                fields: ['uid']
            },
        ]
    });

    return User;
};