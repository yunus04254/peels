var express = require('express');
var router = express.Router();
const sequelize = require('../database');

/* GET all styles */
router.get('/', async (req, res, next) => {
  try {
  const styles = await sequelize.models.Style.findAll();
  res.send(styles);
  }
  catch (error) {
    res.status(500).send(error.message);
  }
});

/* GET all styles not owned by a specific user */
router.get('/available', async (req, res, next) => {
  try {
    const user = await req.user;
    const styles = await sequelize.models.Style.findAll();
    const ownedStyles = await user.getStyles();
    /* filter out styles the user already owns by comparing the styleIDs */
    const availableStyles = styles.filter(style => !ownedStyles.some(ownedStyle => ownedStyle.dataValues.styleID === style.styleID));
    res.send(availableStyles);
  }
  catch (error) {
    res.status(500).send(error.message);
  }
});

/* GET all styles owned by a specific user */
router.get('/owned', async (req, res, next) => {
  const user = req.user;
  try {
    const ownedStyles = await user.getStyles();
    res.send(ownedStyles);
  }
  catch (error) {
    res.status(500).send(error.message);
  }
});

/* Add a style */
router.post('/', async (req, res, next) => {
  const { name, description, costInBananas, isDefault } = req.body;
  if (!name || isDefault == null) {
    return res.status(400).send('Name and isDefault are required.');
  }
  try {
    const style = await sequelize.models.Style.create({ name, description, costInBananas, isDefault });
    res.status(201).send(style);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/* Purchase a style for a specific user */
router.post('/purchase', async (req, res, next) => {
  const { styleID } = req.body;
  if (!styleID) {
    return res.status(400).send('styleID IS required.');
  }
  try {
    const user = req.user
    const style = await sequelize.models.Style.findOne({ where: { styleID: styleID } });
    if (!style) {
      return res.status(404).send('Style not found');
    }
    if (user.bananas < style.costInBananas) {
      return res.status(403).send('Not enough bananas');
    }
    await sequelize.models.User.update({ bananas: user.bananas - style.costInBananas }, { where: { userID: user.userID } });
    await style.addUser(user);
    await user.addStyle(style);

    res.status(201).send('Style purchased');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;