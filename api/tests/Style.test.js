process.env.NODE_ENV = "test";

const request = require("supertest");
const baseURL = "http://localhost:1234/style";
const app = require("../app");
const sequelize = require('../database');
const { authenticateMiddleware } = require("../middlewares/auth");
jest.mock("../middlewares/auth")
var cron = require("node-cron");
jest.mock("node-cron");

describe("Style", () => {
    let server;

    beforeAll(async () => {
        // intitalise the app
        server = app.listen(1234);
    });

    beforeEach(async () => {
        await new Promise((resolve) => setTimeout(() => resolve(), 500));

        // reset the database
        await sequelize.sync({ force: true });

        style1 = await sequelize.models.Style.create({
            name: "Style 1",
            description: "Description 1",
            costInBananas: 100,
            isDefault: true
        });

        style2 = await sequelize.models.Style.create({
            name: "Style 2",
            description: "Description 2",
            costInBananas: 2000,
            isDefault: false
        });

        user1 = await sequelize.models.User.create({
            username: "user1",
            email: "user@email.com",
            uid: "1234",
            bananas: 1000,
        });

        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = user1;
            next();
        });
        cron.schedule.mockImplementation((time, callback) => {});
    });

    afterAll(async () => {
        // close the server
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
        server.close();
    });

    afterEach(async () => {
        authenticateMiddleware.mockRestore();
        cron.schedule.mockRestore();
    });


    it("GET / should return all styles", async () => {
        const response = await request(baseURL).get("/");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
    });

    it("POST / should add a style to the database", async () => {
        const responseBefore = await request(baseURL).get("/");
        expect(responseBefore.status).toBe(200);
        expect(Array.isArray(responseBefore.body)).toBe(true);

        const newStyle = {
            name: "Test Style",
            description: "Test Description",
            costInBananas: 100,
            isDefault: false
        };

        const response = await request(baseURL)
            .post("/")
            .send(newStyle);
        expect(response.status).toBe(201);

        const responseAfter = await request(baseURL).get("/");
        expect(responseAfter.status).toBe(200);
        expect(Array.isArray(responseAfter.body)).toBe(true);

        const lengthBefore = responseBefore.body.length;
        const lengthAfter = responseAfter.body.length;
        expect(lengthAfter).toBe(lengthBefore + 1);
    });

    it("POST /purchase should purchase a style for a specific user when given uid and styleid", async () => {
        const responseBefore = await request(baseURL).get("/");
        expect(responseBefore.status).toBe(200);
        expect(Array.isArray(responseBefore.body)).toBe(true);

        const responseBeforeUser = await request(baseURL + "/available?uid=1234").get("");
        expect(responseBeforeUser.status).toBe(200);
        expect(Array.isArray(responseBeforeUser.body)).toBe(true);

        const styleID = style1.styleID;
        const uid = user1.uid;
        const response = await request(baseURL)
            .post("/purchase")
            .send({ uid: uid, styleID: styleID });
        expect(response.status).toBe(201);

        const responseAfterUser = await request(baseURL + "/available?uid=1234").get("");
        expect(responseAfterUser.status).toBe(200);
        expect(Array.isArray(responseAfterUser.body)).toBe(true);

        const lengthBeforeUser = responseBeforeUser.body.length;
        const lengthAfterUser = responseAfterUser.body.length;
        expect(lengthAfterUser).toBe(lengthBeforeUser - 1);
    });

    it("POST /purchase should return 401 if user not found", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {res.status(401).send("Unauthorized"); next(new Error('Unauthorized'))});
        const response = await request(baseURL)
            .post("/purchase")
            .send({ styleID: style2.styleID });
        expect(response.status).toBe(401);
    });

    it("POST /purchase should return 404 if style not found", async () => {
        const response = await request(baseURL)
            .post("/purchase")
            .send({ uid: user1.uid, styleID: 12345 });
        expect(response.status).toBe(404);
    });

    it("GET /available should return all styles not owned by a specific user", async () => {
        const response = await request(baseURL + "/available?uid=1234").get("");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
    });

    it("GET /available should return 401 if user not found", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {res.status(401).send("Unauthorized"); next(new Error('Unauthorized'))});
        const response = await request(baseURL + "/available?uid=12345").get("");
        expect(response.status).toBe(401);
    });

    it("GET /available should return 500 if error", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = null;
            next();
        });
        const response = await request(baseURL + "/available").get("");
        expect(response.status).toBe(500);
    });

    it("GET /owned should return all styles not owned by a specific user", async () => {
        const response = await request(baseURL + "/owned?uid=1234").get("");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });

    it("GET /owned should return 401 if user not found", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {res.status(401).send("Unauthorized"); next(new Error('Unauthorized'))});
        const response = await request(baseURL + "/owned?uid=12345").get("");
        expect(response.status).toBe(401);
    });

    it("GET /owned should return 500 if error", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = null;
            next();
        });
        const response = await request(baseURL + "/owned").get("");
        expect(response.status).toBe(500);
    });

    it("POST / should return 400 if name or isDefault are not provided", async () => {
        const response = await request(baseURL)
            .post("/")
            .send({ isDefault: true });
        expect(response.status).toBe(400);
    });

    it("GET / should return 500 if error", async () => {
        await sequelize.models.Style.drop();
        const response = await request(baseURL).get("/");
        expect(response.status).toBe(500);
    });

    it("POST /purchase should return 400 if uid or styleID are not provided", async () => {
        const response = await request(baseURL)
            .post("/purchase")
            .send({ uid: user1.uid });
        expect(response.status).toBe(400);
    });

    it("POST /purchase should return 500 if error", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = null;
            next();
        });
        const response = await request(baseURL)
            .post("/purchase")
            .send({ uid: user1.uid, styleID: style2.styleID });
        expect(response.status).toBe(500);
    });

    it("POST /purchase should return 403 if user does not have enough bananas", async () => {
        const response = await request(baseURL)
            .post("/purchase")
            .send({ uid: user1.uid, styleID: style2.styleID });
        expect(response.status).toBe(403);
    });
});
