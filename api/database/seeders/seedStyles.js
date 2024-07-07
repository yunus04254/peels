async function seedStyles(sequelize) {
    await sequelize.models.Style.findOrCreate({
        where: { name: 'Jungle Green' },
        defaults: {
            name: 'Jungle Green',
            description: 'green',
            costInBananas: 50
        }});
    await sequelize.models.Style.findOrCreate({
        where: { name: 'Pumpkin Orange' },
        defaults: {
            name: 'Pumpkin Orange',
            description: 'orange',
            costInBananas: 200
        }});
    await sequelize.models.Style.findOrCreate({
        where: { name: 'Ruby Red' },
        defaults: {
            name: 'Ruby Red',
            description: 'red',
            costInBananas: 300
        }});
    await sequelize.models.Style.findOrCreate({
        where: { name: 'Amethyst  Purple' },
        defaults: {
            name: 'Amethyst Purple',
            description: 'purple',
            costInBananas: 400
        }});
    await sequelize.models.Style.findOrCreate({
        where: { name: 'Midnight Black' },
        defaults: {
            name: 'Midnight Black',
            description: 'black',
            costInBananas: 500
        }});
}

module.exports = { seedStyles };