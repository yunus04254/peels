const request = require("supertest");
const app = require("../app"); // Adjust the path to your express app
const sequelize = require('../database'); // Adjust the path to your sequelize setup
const { authenticateMiddleware } = require("../middlewares/auth");
jest.mock("../middlewares/auth")
var cron = require("node-cron");
jest.mock("node-cron");

describe("Goal API Tests", () => {
    let server;
    let user;
    let createdGoalId;

    beforeAll(async () => {
        server = app.listen(1234); // Adjust the port to match your server configuration
        await sequelize.sync({ force: true });
        user = await sequelize.models.User.create({
            username: "goalUser",
            email: "goaluser@test.com",
            uid: "goalUser123",
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });
    });

    afterAll(async () => {
        await sequelize.close();
        server.close();
    });

    beforeEach(async () => {

        const goal = await sequelize.models.Goal.create({
            title: "Initial Goal Title",
            description: "Initial Goal Description",
            startDate: new Date(),
            endDate: new Date(),
            UserUserID: user.userID,
            reminderEnabled: false,
            reminderTime: null
        });
        createdGoalId = goal.goalID;
        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = user; 
            next();
        })
        cron.schedule.mockImplementation((time, callback) => {});
        jest.spyOn(console,'error').mockImplementation(() => {});
    });

    afterEach(async () => {
        await sequelize.models.Goal.destroy({ where: {} });
        jest.clearAllMocks();
        cron.schedule.mockRestore();
    });

    it("POST /goals should create a new goal", async () => {
        const newGoalData = {
            title: "New Goal",
            description: "New Goal Description",
            startDate: new Date(),
            endDate: new Date(),
            userID: user.userID,
            reminderEnabled: true,
            reminderTime: "morning"
        };

        const response = await request(app)
            .post('/goals')
            .send(newGoalData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('title', newGoalData.title);
        expect(response.body).toHaveProperty('description', newGoalData.description);
        expect(response.body).toHaveProperty('reminderEnabled', newGoalData.reminderEnabled);
        expect(response.body).toHaveProperty('reminderTime', newGoalData.reminderTime);
    });

    it("GET /goals should return all goals for a specific user", async () => {
        const response = await request(app).get(`/goals?id=${user.userID}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("PUT /goals/:goalID should update a specific goal", async () => {
        const updatedGoalData = {
            title: "Updated Goal Title",
            description: "Updated Goal Description",
            startDate: new Date(),
            endDate: new Date(),
            reminderEnabled: true,
            reminderTime: "evening"
        };

        const response = await request(app)
            .put(`/goals/${createdGoalId}`)
            .send(updatedGoalData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Goal updated successfully');
    });

    it("DELETE /goals/:goalID should delete a specific goal", async () => {
        const response = await request(app).delete(`/goals/${createdGoalId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Goal deleted successfully');
    });

    it("GET /goals should return an empty array when no goals exist for a user", async () => {
        await sequelize.models.Goal.destroy({ where: {} });
        const response = await request(app).get(`/goals?id=${user.userID}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("PUT /goals/:goalID should return a 404 error when the goal does not exist", async () => {
        const nonExistentGoalId = 9999;
        const response = await request(app).put(`/goals/${nonExistentGoalId}`).send({
            title: "Non-existent",
        });
        expect(response.status).toBe(404);
        expect(response.text).toContain('Goal not found');
    });

    it("DELETE /goals/:goalID should return a 404 error when the goal does not exist", async () => {
        const nonExistentGoalId = 9999;
        const response = await request(app).delete(`/goals/${nonExistentGoalId}`);
        expect(response.status).toBe(404);
        expect(response.text).toContain('Goal not found');
    });


    it("POST /goals should respond with 400 on invalid data", async () => {
        const invalidGoalData = {
            // Omitted required fields and added invalid userID to ensure failure
            userID: "invalidUserID", // Assuming userID is a numeric ID in your DB schema
            startDate: "invalidDate",
            endDate: "invalidDate",
        };

        const response = await request(app)
            .post('/goals')
            .send(invalidGoalData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain("notNull Violation: Goal.title cannot be null");
    });

    it("POST /goals should handle database errors gracefully", async () => {
        jest.spyOn(sequelize.models.Goal, 'create').mockRejectedValue(new Error('Database error during goal creation'));

        const newGoalData = {
            // Assuming these are valid inputs but mocking the database to fail
            title: "Goal Title",
            description: "Goal Description",
            startDate: new Date(),
            endDate: new Date(),
            userID: user.userID,
            reminderEnabled: false,
            reminderTime: null
        };

        const response = await request(app)
            .post('/goals')
            .send(newGoalData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Database error during goal creation');

        sequelize.models.Goal.create.mockRestore();
    });

    it("GET /goals should handle database errors gracefully", async () => {
        jest.spyOn(sequelize.models.Goal, 'findAll').mockRejectedValue(new Error('Database error fetching goals'));

        const response = await request(app).get(`/goals?id=${user.userID}`);

        expect(response.status).toBe(400);
        // Adjusted to expect the response text directly contains the error message
        expect(response.text).toContain('Database error fetching goals');

        sequelize.models.Goal.findAll.mockRestore();
    });

});
