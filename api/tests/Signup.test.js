process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const BASE_URL = "http://localhost:1234/users";
const sequelize = require("../database");

describe("User (unauthenticated) API", () => {
    let server;
    beforeAll(async () => {
        server = app.listen(1234);
    });

    afterAll(async () => {
        jest.clearAllMocks();
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
        server.close();
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });
        const user1 = await sequelize.models.User.create({
            username: "user1",
            email: "test@test.com",
            uid: 3333,
            xp: 2000,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
            daysInARow: 5,
        });

        const user2 = await sequelize.models.User.create({
            username: "user2",
            email: "test2@test2.com",
            uid: 4444,
            xp: 1000,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const user3 = await sequelize.models.User.create({
            username: "user3",
            email: "test3@test3.com",
            uid: 5555,
            xp: 500,
            registrationDate: new Date(),
            lastLoginDate: yesterday,
            daysInARow: 5,
        });

    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it("POST /register should create a new user", async () => {
        const response = await request(BASE_URL).post('/register').send({
            username: "user4",
            email: "user4@email.com",
            uid: 6666,
        });

        expect(response.status).toBe(201);
        expect(response.body.newUser).toBeTruthy();
    });

    it("POST /register should return 400 if missing fields", async () => {
        const response = await request(BASE_URL).post('/register').send({
            username: "user4",
            email: "",
            uid: 6666,
        });
        expect(response.status).toBe(400);
    });

    it("POST /register should return 409 if username already exists", async () => {
        const response = await request(BASE_URL).post('/register').send({
            username: "user1",
            email: "user4@email.com",
            uid: 6666,
        });
        expect(response.status).toBe(409);
    });

    it("POST /register should return 409 if email already exists", async () => {
        const response = await request(BASE_URL).post('/register').send({
            username: "user4",
            email: "test@test.com",
            uid: 6666,
        });

        expect(response.status).toBe(409);
    });

    it("POST /register should return 500 if error", async () => {
        const response = await request(BASE_URL).post('/register').send({
            username: "user4",
            email: { invalid: "email" },
            uid: 6666,
        });

        expect(response.status).toBe(500);
    });

    it("GET /exists should return 200 if user exists", async () => {
        const response = await request(BASE_URL).get('/exists').query({ email: "test@test.com"});
        expect(response.status).toBe(200);
    });

    it("GET /exists should return 201 if user does not exist", async () => {
        const response = await request(BASE_URL).get('/exists').query({ email: "notauser@email.com"});
        expect(response.status).toBe(201);
    });

    it("GET /exists should return 400 if missing email", async () => {
        const response = await request(BASE_URL).get('/exists');
        expect(response.status).toBe(400);
    });

    it("GET /username-exists should return 200 if username exists", async () => {
        const response = await request(BASE_URL).get('/username-exists').query({ username: "user1"});
        expect(response.status).toBe(200);
        expect(response.body.exists).toBe(true);
    });

    it("GET /username-exists should return 400 if missing username", async () => {
        const response = await request(BASE_URL).get('/username-exists');
        expect(response.status).toBe(400);
    });

    it("GET /username-exists should return 200 if username does not exist", async () => {
        const response = await request(BASE_URL).get('/username-exists').query({ username: "notauser"});
        expect(response.status).toBe(200);
        expect(response.body.exists).toBe(false);
    });

    it("GET /username-exists should return 500 if error", async () => {
        const response = await request(BASE_URL).get('/username-exists').query({ username: { invalid: "username"}});
        expect(response.status).toBe(500);
    });

    it("GET /findByUid should return user", async () => {
        const response = await request(BASE_URL).get('/findByUid').query({ uid: 3333});
        expect(response.status).toBe(200);
        expect(response.body.username).toBe("user1");
    });

    it("GET /findByUid should return 404 if user not found", async () => {
        const response = await request(BASE_URL).get('/findByUid').query({ uid: 9999});
        expect(response.status).toBe(404);
    });

    it("GET /findByUid should return 400 if missing uid", async () => {
        const response = await request(BASE_URL).get('/findByUid');
        expect(response.status).toBe(400);
    });

    it("GET /findByUid should return 500 if error", async () => {
        const response = await request(BASE_URL).get('/findByUid').query({ uid: { invalid: "uid"}});
        expect(response.status).toBe(500);
    });
});