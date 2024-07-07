process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const sequelize = require('../database');
const { authenticateMiddleware } = require("../middlewares/auth");
jest.mock('../auth/verify');
jest.mock("../middlewares/auth");
var cron = require("node-cron");
jest.mock("node-cron");

describe("Statistics API", () => {
    let server;
    let testUserId;

    beforeAll(async () => {
        server = app.listen(1234);
    });

    afterAll(async () => {
        await sequelize.close();
        server.close();
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });

        const user = await sequelize.models.User.create({
            username: "testUser",
            email: "testUser@example.com",
            uid: "testUser-UID",
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });
        testUserId = user.userID;

        const journal = await sequelize.models.Journal.create({
            title: "Test Journal",
            theme: "Nature",
            reminder: 5,
            creationDate: new Date(),
            isPrivate: false,
            image: "",
            UserUserID: testUserId
        });

        await sequelize.models.Entry.bulkCreate([
            {
                date: new Date(),
                title: "First Entry",
                content: "Content of the first entry",
                mood: "😄",
                isDraft: false,
                image: "",
                JournalJournalID: journal.journalID
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() - 1)),
                title: "Second Entry",
                content: "Content of the second entry",
                mood: "😐",
                isDraft: false,
                image: "",
                JournalJournalID: journal.journalID
            }
        ]);

        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = user;
            next();
        })
        cron.schedule.mockImplementation((time, callback) => {});

    });

    afterEach(async () => {
        await sequelize.models.Entry.destroy({ where: {} });
        await sequelize.models.Journal.destroy({ where: {} });
        authenticateMiddleware.mockRestore();
        cron.schedule.mockRestore();
    });

    it("should calculate streaks correctly with a gap in entries", async () => {
        await sequelize.models.User.create({
            username: "streakUser",
            email: "streakUser@example.com",
            uid: "streakUser-UID",
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });

        const journal = await sequelize.models.Journal.create({
            title: "Streak Journal",
            theme: "Consistency",
            reminder: 1,
            creationDate: new Date(),
            isPrivate: false,
            UserUserID: 1
        });

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        await sequelize.models.Entry.bulkCreate([
            {
                date: threeDaysAgo,
                content: "Entry 3 days ago",
                mood: "😐",
                isDraft: false,
                JournalJournalID: journal.journalID
            },
            {
                date: yesterday,
                content: "Entry yesterday",
                mood: "😐",
                isDraft: false,
                JournalJournalID: journal.journalID
            },
            {
                date: today,
                content: "Entry today",
                mood: "😄",
                isDraft: false,
                JournalJournalID: journal.journalID
            }
        ]);

        const response = await request(app).get(`/statistics?id=1`);
        expect(response.status).toBe(200);
        expect(response.body.currentStreak).toBe(2);
        expect(response.body.longestStreak).toBe(2);
    });


    it("should handle errors when fetching statistics fails", async () => {
        // Mock the findAll method to throw an error
        jest.spyOn(sequelize.models.Entry, 'findAll').mockImplementationOnce(() => {
            throw new Error('Test error');
        });

        const response = await request(app).get(`/statistics?id=${testUserId}`);
        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal server error');

        sequelize.models.Entry.findAll.mockRestore();
    });

    it("should correctly accumulate mood scores by date", async () => {
        const sameDay = new Date();
        const differentDay = new Date(new Date().setDate(new Date().getDate() - 1));

        await sequelize.models.Entry.bulkCreate([
            {
                date: sameDay,
                title: "Additional Entry Today",
                content: "Extra content for today",
                mood: "🙂",
                isDraft: false,
                image: "",
                JournalJournalID: 1
            },
            {
                date: differentDay,
                title: "Entry Yesterday",
                content: "Content from yesterday",
                mood: "😡",
                isDraft: false,
                image: "",
                JournalJournalID: 1
            }
        ]);

        const response = await request(app).get(`/statistics/graphs?startDate=${differentDay.toISOString()}&endDate=${sameDay.toISOString()}&id=${testUserId}`);

        expect(response.status).toBe(200);

        // Further assertions can be made
        // For example, checking that the dates are keys in the response,
        // and their sum and count match the expected values
    });

    it("should handle errors when fetching graph data fails", async () => {

        jest.spyOn(sequelize.models.Entry, 'findAll').mockImplementationOnce(() => {
            throw new Error('Graph data fetch error');
        });

        const response = await request(app).get(`/statistics/graphs?startDate=2023-01-01&endDate=2023-01-31&id=${testUserId}`);

        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal server error');

        sequelize.models.Entry.findAll.mockRestore();
    });

    it("should return zero streaks when there are no entries", async () => {
        await sequelize.models.Entry.destroy({ where: {} });

        const response = await request(app).get(`/statistics?id=${testUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.longestStreak).toBe(0);
        expect(response.body.currentStreak).toBe(0);
    });


    it("should reset current streak to 0 if the last entry is more than one day ago", async () => {
        await sequelize.models.Entry.destroy({ where: {} });

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        await sequelize.models.Entry.create({
            date: twoDaysAgo,
            title: "Entry Two Days Ago",
            content: "This is an entry from two days ago.",
            mood: "😐",
            isDraft: false,
            image: "",
            JournalJournalID: 1
        });

        const response = await request(app).get(`/statistics?id=${testUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.currentStreak).toBe(0);
    });


    it("should default to 0 for unmapped emojis in mood aggregation", async () => {
        await sequelize.models.Entry.destroy({ where: {} });
        await sequelize.models.Entry.create({
            date: new Date(),
            title: "Unmapped Emoji Mood Entry",
            content: "Testing with an unmapped emoji",
            mood: "👾", // This emoji is not in moodMapping
            isDraft: false,
            JournalJournalID: 1
        });

        const response = await request(app).get(`/statistics/graphs?id=${testUserId}`);

        expect(response.status).toBe(200);
        const moodData = response.body.moodOverTimeData;

        const defaultMoodScore = "0.00";
        expect(moodData.datasets[0].data).toContain(defaultMoodScore);
    });

});
