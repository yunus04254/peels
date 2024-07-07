// Routing for pre-defined entry templates
var express = require('express');
var router = express.Router();
const sequelize = require('../database');
const { Op } = require('sequelize');


function validateTemplate(name, description, content){
	if (!name) {
		return 'Name is required.';
	}
	else if (!content) {
		return 'Content is required.';
	}
	else if (name.length > 18){
		return 'Name is too long.';
	}
	else if (name.length < 3){
		return 'Name is too short.';
	}
	else if (description && description.length > 70){
		return 'Description is too long.';
	}
	else if (content.length > 1000){
		return 'Content is too long.';
	}
	return null;

}

router.get('/', async (req, res, next) => {
	var user = req.user
	const templates = await sequelize.models.Template.findAll({
		where: {
			[Op.or]: [
				{ UserUserId: user.userID },
				{ UserUserId: null }
			]

		},

	});
	res.send(templates);
});

router.post("/create", async (req, res) => {
	var user = req.user
	const { name, description, content } = req.body;

		const validationError = validateTemplate(name, description, content);
		if (validationError) {
			res.status(400).send(validationError);
			return;
		}

	try {
		const template = await sequelize.models.Template.build({
			name: name,
			description: description,
			content: content,
		});


		await template.save();
		await user.addTemplate(template);
		res.send(template);
	} catch (error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}


})

router.post("/delete", async (req, res) => {
	var user = req.user
	const { id } = req.body;
	console.log(req.body, id);
	if (!id) {
		res.status(400).send('ID is required.');
		return;
	}


	try {
		const template = await sequelize.models.Template.findOne({
			where: {
				templateID: id,
				UserUserId: user.userID,
			}
		});
		if (!template) {
			console.log("Template not found.", id, user.userID)
			res.status(404).send('Template not found.');
			return;
		}
		await template.destroy();
		res.send('Template deleted.');
	} catch (error) {
		console.log(error.message)
		res.status(500).send(error.message);
	}
})

router.post("/update", async (req, res) => {
	var user = req.user
	const { id, name, description, content } = req.body;
	if (!id) {
		res.status(400).send('ID is required.');
		return;
	}
	const validationError = validateTemplate(name, description, content);
	if (validationError) {
		res.status(400).send(validationError);
		return;
	}
	try {
		const template = await sequelize.models.Template.findOne({
			where: {
				templateID: id,
				UserUserId: user.userID,
			}
		});
		if (!template) {
			res.status(404).send('Template not found.');
			return;
		}
		template.name = name;
		if (description){
			template.description = description;
		} else {
			template.description = "";

		}
		template.content = content;
		await template.save();
		res.send(template);
	} catch (error) {
		res.status(500).send(error.message);
	}
})


module.exports = router;
