const sequelize = require('../database');
/*
    Simple function to add a new notification to the database for a user

    @param user: The user object to send the notification to
    @param title: The title of the notification
    @param content: The content of the notification
    @param redirect: The URL to redirect to when the notification is clicked
    @param icon: The icon to display with the notification (default bell)
    @param image: The image to display with the notification
    @return: The notification object created
*/
async function sendNotification(user, title, content, redirect, icon, image){
    var notification = await sequelize.models.Notification.create({
        title: title,
        content: content,
        redirect: redirect,
        icon: icon,
        image: image,
    });
    user.addNotification(notification);
    return notification;
}

module.exports = {sendNotification};