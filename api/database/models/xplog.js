const { DataTypes } = require('sequelize');
const { Op } = require('sequelize');

module.exports = function(sequelize){
    const XPLog = sequelize.define('XPLog', {
        logID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        xp_change: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        }, {
        timestamps: true,
        createdAt: 'date',
        updatedAt: false,
    });

    XPLog.addHook('afterCreate', async (xpLog, options) => {
        // Calculate the date 2 months ago
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        await XPLog.destroy({
            where: {
                date: {
                    [Op.lt] : twoMonthsAgo
                },
            },
        });
    });

    return XPLog;
}
