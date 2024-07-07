const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const { Op } = require('sequelize');


async function calculateStreaks(entries) {
    if (entries.length === 0) return { longestStreak: 0, currentStreak: 0 };

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let longestStreak = 1, currentStreak = 1;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastEntryDate = new Date(entries[entries.length - 1].date);
    lastEntryDate.setHours(0, 0, 0, 0);

    const diffTime = today - lastEntryDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 1) currentStreak = 0;

    for (let i = 1; i < entries.length; i++) {
        const prevDate = new Date(entries[i - 1].date);
        const currentDate = new Date(entries[i].date);
        prevDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        const diff = currentDate - prevDate;
        const daysDiff = diff / (1000 * 60 * 60 * 24);

        if (daysDiff === 1) {
            console.log(`Entering daysDiff === 1 branch. Current streak before update: ${currentStreak}`);
            currentStreak = currentStreak + 1;
        } else if (daysDiff > 1) {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { longestStreak, currentStreak };
}

router.get('/', async (req, res) => {
    try {
        const user = req.user
        const userId = user.userID
        const userJournals = await sequelize.models.Journal.findAll({
            where: { UserUserID: userId },
        });

        const journalIds = userJournals.map(j => j.journalID);

        const totalEntries = await sequelize.models.Entry.count({
            where: { JournalJournalID: { [Op.in]: journalIds } }
        });
        const totalJournals = userJournals.length;

        const allEntries = await sequelize.models.Entry.findAll({
            where: { JournalJournalID: { [Op.in]: journalIds } },
            attributes: ['date'],
            order: [['date', 'ASC']],
        });
        const { longestStreak, currentStreak } = await calculateStreaks(allEntries.map(e => e.toJSON()));

        res.json({
            totalEntries,
            totalJournals,
            longestStreak,
            currentStreak
        });
    } catch (error) {
        console.error('Failed to fetch statistics:', error);
        res.status(500).send('Internal server error');
    }
});

router.get('/graphs', async (req, res) => {
    const { startDate, endDate } = req.query;
    const user = req.user;
    const userId = user.userID;

    const userJournals = await sequelize.models.Journal.findAll({
        where: { UserUserID: userId },
    });

    const journalIds = userJournals.map(j => j.journalID);


    const moodMapping = {
        '😢': 1,
        '😡': 2,
        '😐': 3,
        '🤔': 4,
        '😯': 5,
        '🙂': 6,
        '😄': 7
      };

    const emojiToNumber = (emoji) => moodMapping[emoji] || 0;

    const adjustDateRangeForQuery = (startDate, endDate) => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    let whereClause = {};
    if (startDate && endDate) {
        const { start, end } = adjustDateRangeForQuery(startDate, endDate);
        whereClause.date = { [Op.between]: [start, end] };
    }

    try {
        const moodEntries = await sequelize.models.Entry.findAll({
            where: {
                ...whereClause,
                JournalJournalID: { [Op.in]: journalIds }
            },
            attributes: ['date', 'mood'],
            order: [['date', 'ASC']],
        });

        const moodDataByDate = moodEntries.reduce((acc, { date, mood }) => {
            const dateString = date.toISOString().split('T')[0];
            const moodScore = emojiToNumber(mood);
            if (!acc[dateString]) {
                acc[dateString] = { sum: moodScore, count: 1 };
            } else {
                acc[dateString].sum += moodScore;
                acc[dateString].count += 1;
            }
            return acc;
        }, {});

        const moodOverTimeData = {
            labels: Object.keys(moodDataByDate),
            datasets: [{
                label: 'Mood Over Time',
                data: Object.values(moodDataByDate).map(data => (data.sum / data.count).toFixed(2)),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        const moodData = await sequelize.models.Entry.findAll({
            where: {
                ...whereClause,
                JournalJournalID: { [Op.in]: journalIds }
            },
            attributes: [
                'mood',
                [sequelize.fn('COUNT', sequelize.col('mood')), 'count']
            ],
            group: ['mood'],
        });

        const formattedMoodData = {
            labels: moodData.map(m => m.getDataValue('mood')),
            datasets: [{
                data: moodData.map(m => m.getDataValue('count')),
                backgroundColor: ['#5A6FA7', '#9E2A2B', '#9CAB7C', '#D7C49E', '#487A7B', '#D17A54', '#7A8B99'],
            }]
        };

        const entriesOverTimeData = await sequelize.models.Entry.findAll({
            where: {
                ...whereClause,
                JournalJournalID: { [Op.in]: journalIds }
            },
            attributes: ['date', [sequelize.fn('DATE', sequelize.col('date')), 'day'], [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
            group: ['day'],
            order: [['date', 'ASC']],
        });

        const entriesDataForGraph = {
            labels: entriesOverTimeData.map(e => e.getDataValue('day')),
            datasets: [{
                label: 'Entries Over Time',
                data: entriesOverTimeData.map(e => e.getDataValue('count')),
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.5)',
                fill: true,
                tension: 0.1
            }]
        };
        const entriesWithWordCount = await sequelize.models.Entry.findAll({
            where: {
                ...whereClause,
                JournalJournalID: { [Op.in]: journalIds }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date')), 'day'],
                [sequelize.fn('AVG', sequelize.literal("LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1")), 'averageWords'],
            ],
            group: [sequelize.fn('DATE', sequelize.col('date'))],
            order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']],
        });

        const wordsPerEntryData = {
            labels: entriesWithWordCount.map(e => e.getDataValue('day')),
            datasets: [{
                label: 'Average Words Per Entry',
                data: entriesWithWordCount.map(e => Math.round(e.getDataValue('averageWords'))),
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        };

        res.json({
            moodData: formattedMoodData,
            entriesData: entriesDataForGraph,
            moodOverTimeData,
            wordsPerEntryData

        });

    } catch (error) {
        console.error('Failed to fetch graph data:', error);
        res.status(500).send('Internal server error');
    }
});


module.exports = router;