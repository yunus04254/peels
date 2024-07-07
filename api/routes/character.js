var express = require('express');
var router = express.Router();
const sequelize = require('../database');

/* GET all characters */
router.get('/', async (req, res, next) => {
  try {
    const characters = await sequelize.models.Character.findAll();
    res.send(characters);
  }
  catch (error) {
    res.status(500).send(error.message);
  }
});

/* GET all characters not owned by a specific user */
router.get('/available', async (req, res, next) => {
  try {
    const user = req.user
    const characters = await sequelize.models.Character.findAll();
    const ownedCharacters = await user.getCharacters();
    /* filter out characters the user already owns by comparing the characterIDs */
    const availableCharacters = characters.filter(character => !ownedCharacters.some(ownedCharacter => ownedCharacter.dataValues.characterID === character.characterID));
    res.send(availableCharacters);
  }
  catch (error) {
    res.status(500).send(error.message);
  }
});

/* Add a character */
router.post('/', async (req, res, next) => {
  const { name, description, costInBananas, isDefault } = req.body;
  if (!name || isDefault == null) {
    return res.status(400).send('Name and isDefault are required.');
  }
  try {
    const character = await sequelize.models.Character.create({ name, description, costInBananas, isDefault });
    res.status(201).send(character);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/* Purchase a character for a specific user */
router.post('/purchase', async (req, res, next) => {
  const { characterID } = req.body;
  if (!characterID) {
    return res.status(400).send('characterID is required.');
  }
  try {
    const user = req.user
    const character = await sequelize.models.Character.findOne({ where: { characterID: characterID } });
    if (!character) {
      return res.status(404).send('Character not found');
    }
    if (user.bananas < character.costInBananas) {
      return res.status(403).send('Not enough bananas');
    }
    await sequelize.models.User.update({ bananas: user.bananas - character.costInBananas }, { where: { userID: user.userID } });
    await character.addUser(user);
    await user.addCharacter(character);
    // it adds, but does not save? (after reloading the api its no longer in table)
    res.status(201).send('Character purchased');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;