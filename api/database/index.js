const { Sequelize } = require('sequelize');
const { readdirSync } = require('fs');
const { applyAssociations } = require('./associations');


//initialize sequelize
const sequelize = new Sequelize('db', 'user', 'password', {
    dialect: 'sqlite',
    host: './db.sqlite',
    logging: false,
})

var models = []

//import all models
readdirSync(__dirname + '/models').forEach(file => {
    models.push(require(__dirname + '/models/' + file))
})

//apply all models to sequelize
for (var model of models) {
    model(sequelize)
}


applyAssociations(sequelize)

sequelize.sync( { } );


module.exports = sequelize;