const request = require("supertest");
const baseURL = "http://localhost:1234/notifications";
const app = require("../app");
const sequelize = require("../database");
const { authenticateMiddleware } = require("../middlewares/auth");
const { auth } = require("firebase-admin");
var cron = require("node-cron");
jest.mock("node-cron");

jest.mock("../middlewares/auth")
describe("Templates", () => {
    let server;

    beforeAll(async () => {
        // intitalise the app
        server = app.listen(1234);
    });

    afterAll(async () => { 
        // close the server
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
        server.close();
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });

        user1 = await sequelize.models.User.create({
            username: "user1",
            email: "user1@test.com",
            uid: "uid1",
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });
        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = user1;
            next();
        });
        cron.schedule.mockImplementation((time, callback) => {});
    });

    afterEach(async () => {
        authenticateMiddleware.mockRestore();
        cron.schedule.mockRestore();
    });
    
    describe("GET /notifications", () => {
        it("should return 200", async () => {
            const res = await request(baseURL).get("/");
            expect(res.statusCode).toEqual(200);
        });
        it("should return 401 if user is not authenticated", async () => {
            authenticateMiddleware.mockImplementation((req, res, next) => {
                req.user = null;
                next();
            });
            const res = await request(baseURL).get("/");
            expect(res.statusCode).toEqual(401);
        });
    });

    describe("POST /notifications/delete", () => {
        it("should return 200", async () => {
            const notification = await sequelize.models.Notification.create({
                title: "title",
                content: "content",
                redirect: "redirect",
                icon: "icon",
                image: "image",
                UserUserID: user1.userID,
            });
            const res = await request(baseURL).post("/delete").send({ id: notification.id });
            expect(res.statusCode).toEqual(200);
        });
        it("should return 404 if notification is not found", async () => {
            const res = await request(baseURL).post("/delete").send({ id: 1 });
            expect(res.statusCode).toEqual(404);
        });
        it("should return 401 if user is not authenticated", async () => {
            authenticateMiddleware.mockImplementation((req, res, next) => {
                req.user = null;
                next();
            });
            const res = await request(baseURL).post("/delete").send({ id: 1 });
            expect(res.statusCode).toEqual(401);
        });
        it("should only be able to delete stuff that belongs to the user", async () => {
            var user2 = await sequelize.models.User.create({
                username: "user2",
                email: "user2@test.com",
                uid: "uid2",
                registrationDate: new Date(),
                lastLoginDate: new Date(),
            });
            const notification = await sequelize.models.Notification.create({
                title: "title",
                content: "content",
                redirect: "redirect",
                icon: "icon",
                image: "image",
                UserUserID: user2.userID,
            });
            user2.addNotification(notification);
            const res = await request(baseURL).post("/delete").send({ id: notification.id });
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual("Unauthorized");
        })
    });

    describe("POST /notifications/create", () => {
        it("should return 200", async () => {
            const res = await request(baseURL).post("/create").send({
                title: "title",
                content: "content",
                redirect: "redirect",
                icon: "icon",
                image: "image",
            });
            expect(res.statusCode).toEqual(200);
        });
        it("should return 401 if user is not authenticated", async () => {
            authenticateMiddleware.mockImplementation((req, res, next) => {
                req.user = null;
                next();
            });
            const res = await request(baseURL).post("/create").send({
                title: "title",
                content: "content",
                redirect: "redirect",
                icon: "icon",
                image: "image",
            });
            expect(res.statusCode).toEqual(401);
        });
        it("requires title", async () => {
            const res = await request(baseURL).post("/create").send({
                content: "content",
                redirect: "redirect",
                icon: "icon",
                image: "image",
            });
            expect(res.statusCode).toEqual(400);
        })
        it("requires content", async () => {
            const res = await request(baseURL).post("/create").send({
                title: "title",
                redirect: "redirect",
                icon: "icon",
                image: "image",
            });
            expect(res.statusCode).toEqual(400);
        })
        it("requires redirect", async () => {
            const res = await request(baseURL).post("/create").send({
                title: "title",
                content: "content",
                icon: "icon",
                image: "image",
            });
            expect(res.statusCode).toEqual(400);
        })

        it("issent default false", async () => {
            const res = await request(baseURL).post("/create").send({
                title: "title",
                content: "content",
                redirect: "redirect",
                icon: "icon",
                image: "image",
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body.isSent).toEqual(false);
        })
        
    
    });

    



})