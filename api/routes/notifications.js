// Route for accessing and creating user notifications
var express = require('express');
var router = express.Router();
const sequelize = require('../database');
const { Op } = require('sequelize');

router.get('/recent', async (req, res, next) => {
    var user = req.user
    if (user) {
        var notifications = await sequelize.models.Notification.findAll({
            where: {
                UserUserId: user.userID,
                isSent: false,
            },
        })

        await Promise.all(
            notifications.map(notification =>
              notification.update({ isSent: true })
            )
          );

        res.json(notifications);
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
});

router.get('/', async (req, res, next) => {
    var user = req.user
    if (user) {
        var notifications = await sequelize.models.Notification.findAll({
            where: {
                UserUserId: user.userID,
            },
        })

        res.json(notifications);
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
});


router.post("/delete", async (req, res, next) => {
    var user = req.user
    if (user) {
        var id = req.body.id;
        var notification = await sequelize.models.Notification.findOne({
            where: {
                id: id
            }
        });
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }
        if (notification.UserUserID == user.userID) {
            notification.destroy();
            res.json({ message: "Notification deleted" });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
})

router.post("/create", async (req, res, next) => {
    var user = req.user
    if (user) {
        var title = req.body.title;
        var content = req.body.content;
        var redirect = req.body.redirect;
        var icon = req.body.icon;
        var image = req.body.image;
        var notification = await sequelize.models.Notification.create({
            title: title,
            content: content,
            redirect: redirect,
            icon: icon,
            image: image,
            isSent: true
        });
        user.addNotification(notification);
        res.json(notification);
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
})

module.exports = router;