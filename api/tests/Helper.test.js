process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const BASE_URL = "http://localhost:1234";
const sequelize = require('../database');
const {add_xp_to_user, calculateLevel, log_xp, log_error} = require('../helpers/experience');
const helperModule = require('../helpers/experience');
const { add } = require("date-fns");
var cron = require("node-cron");
jest.mock("node-cron");

describe ("Helper functions", () => {
    let server;

    beforeAll(async () => {
        // intitalise the app
        server = app.listen(1234);
    });

    afterAll(async () => {
        // close the server
        jest.clearAllMocks();
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
        server.close();
    });

    beforeEach(async () => {
        await sequelize.sync({force:true});
        cron.schedule.mockImplementation((time, callback) => {});
    });

    afterEach(async () => {
        cron.schedule.mockRestore();
    });

    it("should not log error message under test environments", async () => {
        const testObject = { test : "test" };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        log_error("Error message", testObject);
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it("should log error message under non test environment", async () => {
        const testObject = { test : "test" };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        process.env.NODE_ENV = "development";
        log_error("Error message", testObject);
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("Error message", testObject);
        consoleSpy.mockRestore();
        process.env.NODE_ENV = "test";
    });

    it("should log xp with the correct parameters", async () => {
        const xp = 100;
        const userID = 1;
        const createSpy = jest.spyOn(sequelize.models.XPLog, "create").mockImplementation(() => {});
        await log_xp(xp, userID);
        expect(createSpy).toHaveBeenCalled();
        expect(createSpy).toHaveBeenCalledWith({ xp_change: xp, UserUserID: userID });
        createSpy.mockRestore();
    });

    it("should not log xp if an error occurs", async () => {
        const xp = 100;
        const userID = 1;
        const createSpy = jest.spyOn(sequelize.models.XPLog, "create").mockImplementation(() => {throw new Error()});
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        process.env.NODE_ENV = "development";
        await log_xp(xp, userID);
        expect(createSpy).toHaveBeenCalled();
        expect(createSpy).toHaveBeenCalledWith({ xp_change: xp, UserUserID: userID });
        expect(consoleSpy).toHaveBeenCalled();
        createSpy.mockRestore();
        consoleSpy.mockRestore();
        process.env.NODE_ENV = "test";
    });

    it("should calculate the correct level", async () => {
        expect(calculateLevel(0)).toBe(1);
        expect(calculateLevel(19)).toBe(1);
        expect(calculateLevel(20)).toBe(2);
        expect(calculateLevel(44)).toBe(2);
        expect(calculateLevel(45)).toBe(3);
    });

    it("should add xp to a user", async () => {
        const user = await sequelize.models.User.create({ username: "test",
                                                        password: "test",
                                                        email: "test@email.com",
                                                        xp: 0,
                                                        level: 1,
                                                        entryCount: 0,
                                                        uid: 1111,
                                                        bananas: 0,
                                                        daysInARow: 0,
                                                        lastLoginDate: new Date(),
                                                        registrationDate: new Date()});

        add_xp_to_user(user, 21);
        expect(user.xp).toBe(21);
        expect(user.level).toBe(2);
    });

});