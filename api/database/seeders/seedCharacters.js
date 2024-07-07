async function seedCharacters(sequelize) {
    //name
    //description
    //costInBananas
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Explorer' },
        defaults: {
            name: 'Explorer',
            description: 'pfp1.png',
            costInBananas: 20
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Astronaut' },
        defaults: {
            name: 'Astronaut',
            description: 'pfp2.png',
            costInBananas: 20
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Pirate' },
        defaults: {
            name: 'Pirate',
            description: 'pfp3.png',
            costInBananas: 30
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Tranquility' },
        defaults: {
            name: 'Tranquility',
            description: 'pfp4.png',
            costInBananas: 35
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'DJ' },
        defaults: {
            name: 'DJ',
            description: 'pfp5.png',
            costInBananas: 50
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Witch' },
        defaults: {
            name: 'Witch',
            description: 'pfp6.png',
            costInBananas: 75
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Chef' },
        defaults: {
            name: 'Chef',
            description: 'pfp7.png',
            costInBananas: 80
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Reader' },
        defaults: {
            name: 'Reader',
            description: 'pfp8.png',
            costInBananas: 100
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Superman' },
        defaults: {
            name: 'Superman',
            description: 'pfp9.png',
            costInBananas: 150
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Treasurer' },
        defaults: {
            name: 'Treasurer',
            description: 'pfp10.png',
            costInBananas: 1000
        }
    })
    await sequelize.models.Character.findOrCreate({
        where: { name: 'Magician' },
        defaults: {
            name: 'Magician',
            description: 'pfp11.png',
            costInBananas: 200
        }
    })
}

module.exports = { seedCharacters };