const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const UserCharacter = sequelize.define('UserCharacter', {
        
    }, {
        timestamps: false
    });
}
