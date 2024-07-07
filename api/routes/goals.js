const express = require('express');
const cron = require('node-cron');
const sequelize = require('../database'); // Adjust the path to your sequelize setup
const router = express.Router();
const { sendNotification } = require('../helpers/notifications');

// POST endpoint for creating goals
router.post('/', async (req, res) => {
    const userID = req.user.userID;
    const { title, description, startDate, endDate, reminderEnabled, reminderTime } = req.body;
    try {
        const goal = await sequelize.models.Goal.create({
            title,
            description,
            startDate,
            endDate,
            UserUserID: userID,
            reminderEnabled,
            reminderTime
        });
        res.status(201).json(goal);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// GET endpoint for fetching goals
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userID;
        const goals = await sequelize.models.Goal.findAll({
            where: { UserUserID: userId }
        });

        res.json(goals);
    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(400).send(error.message);
    }
});

// PUT endpoint for updating goals
router.put('/:goalID', async (req, res) => {
    const { title, description, startDate, endDate, reminderEnabled, reminderTime } = req.body;
    const { goalID } = req.params;
    try {
        const goal = await sequelize.models.Goal.update(
            { title, description, startDate, endDate, reminderEnabled, reminderTime },
            { where: { goalID } }
        );
        if (goal[0] > 0) {
            res.json({ message: 'Goal updated successfully' });
        } else {
            res.status(404).send('Goal not found');
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

// DELETE endpoint for deleting goals
router.delete('/:goalID', async (req, res) => {
    const { goalID } = req.params;
    try {
        const count = await sequelize.models.Goal.destroy({
            where: { goalID, UserUserID: req.user.userID}
        });
        if (count > 0) {
            res.status(200).send({ message: 'Goal deleted successfully' });
        } else {
            res.status(404).send('Goal not found');
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

module.exports = router;

const reminderSchedules = {
    morning: '0 8 * * *', // 8:00 AM every day
    afternoon: '0 13 * * *', // 1:00 PM every day
    evening: '0 18 * * *', // 6:00 PM every day
};
if (process.env.NODE_ENV !== "test"){
    Object.entries(reminderSchedules).forEach(([time, schedule]) => {
        cron.schedule(schedule, async () => {
            console.log(`Running task for ${time} reminders`);
            const goals = await sequelize.models.Goal.findAll({
                where: {
                    reminderEnabled: true,
                    reminderTime: time
                }
            });
    
            for (let goal of goals) {
                if (goal.UserUserID) {
                    await sendNotification(goal.UserUserID, 'Goal Reminder', `Don't forget about your goal: ${goal.title}`, '/home', true, 'bell');
                }
            }
        });
    })
    
}
