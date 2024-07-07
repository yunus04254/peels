var express = require('express');
var router = express.Router();
const sequelize = require('../database');
const { log_xp } = require('../helpers/experience');

router.post('/register', async (req, res, next) => {
	const { username, email, uid } = req.body;

	if (!username || !email || !uid) {
		return res.status(400).send('Username, email, and UID are required.');
	}
	try {
		// Check if username already exists
		const existingUsername = await sequelize.models.User.findOne({ where: { username } });
		if (existingUsername) {
			return res.status(409).send('Username already exists.');
		}

		// Check if email already exists
		const existingEmail = await sequelize.models.User.findOne({ where: { email } });
		if (existingEmail) {
			return res.status(409).send('Email already exists.');
		}


		// Create a new user instance
		const newUser = await sequelize.models.User.create({
			username,
			email,
			uid, // Store Firebase UID
			registrationDate: new Date(),
			// You can set other default values or remove fields not used
			favPfp: "monkey.png",
		});

		const newJournal = await sequelize.models.Journal.create({
			title: username + "'s Journal",
            theme: "turquoise",
            reminder: "Reminder 1",
            creationDate: new Date(), 
            isPrivate: true,
            image: "",
            
		});
		newUser.addJournal(newJournal);
		const [character,isNew] = await sequelize.models.Character.findOrCreate({
			where: { description: "monkey.png" },
			defaults: {
				description: "monkey.png",
				cost: 0, 
				name: "Default Monkey",
			}
		});


		await sequelize.models.UserCharacter.create({
			UserUserID: newUser.userID,
			CharacterCharacterID: character.characterID, 
		});

		res.status(201).send({ newUser });
		log_xp(0, newUser.userID);
	} catch (error) {
		console.error(error);
		res.status(500).send(error.message);
	}
});

router.get('/exists', async (req, res, next) => {
	const email = req.query.email;
	if (email) {
		const user = await sequelize.models.User.findOne({ where: { email } });
		if (user) {
			res.status(200).send(user);
		} else {
			res.status(201).send('User does not exist with that email');
		}
	}
	else {
		res.status(400).send('Email is required.');
	}
});


router.get('/username-exists', async (req, res, next) => {
	const { username } = req.query;
	if (!username) {
		return res.status(400).send('Username is required.');
	}

	try {
		const user = await sequelize.models.User.findOne({ where: { username } });
		res.status(200).send({ exists: !!user }); // Send true or false based on the user existence
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.get('/findByUid', async (req, res) => {
	const { uid } = req.query;
	if (!uid) {
		return res.status(400).send('UID is required.');
	}

	try {
		const user = await sequelize.models.User.findOne({ where: { uid } });
		if (user) {
			res.status(200).send(user);
		} else {
			res.status(404).send('User not found');
		}
	} catch (error) {
		res.status(500).send(error.message);
	}
});


module.exports = router;