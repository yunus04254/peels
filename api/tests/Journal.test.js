process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const baseURL = "http://localhost:1234";
const sequelize = require('../database');
const { authenticateMiddleware } = require("../middlewares/auth");
jest.mock("../middlewares/auth")
var cron = require("node-cron");
jest.mock("node-cron");

describe("Journal API", () => {
    let createdJournalId;
    let server;

    beforeAll(async () => {
        server = app.listen(1234);
    });

    afterAll(async () => {
        await new Promise((resolve) => setTimeout(() => resolve(), 500));
        await sequelize.close(); 
        server.close();
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });
        const user = await sequelize.models.User.create({
            username: "user1",
            email: "test@test.com",
            uid: 3333,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });

        const journal = await sequelize.models.Journal.create({
            title: "Initial Journal Title",
            theme: "Initial Theme",
            reminder: "Initial Reminder",
            creationDate: new Date(), 
            isPrivate: false,
            UserUserID: user.userID,
        });
        createdJournalId = journal.journalID;
        owner = journal.UserUserID;

        authenticateMiddleware.mockImplementation((req, res, next) => {
            req.user = user;
            next();
        });
        cron.schedule.mockImplementation((time, callback) => {});

    });

    afterEach(async () => {
        
        await sequelize.models.Journal.destroy({ where: {} });
        authenticateMiddleware.mockRestore();
        cron.schedule.mockRestore();
    });

    it("GET /recent should return the most recent 5 journals for a user", async () => {
        
        for (let i = 0; i < 7; i++) {
          await sequelize.models.Journal.create({
            title: `Journal Title ${i}`,
            theme: `Theme ${i}`,
            reminder: "Reminder",
            creationDate: new Date(new Date().getTime() + i * 1000),
            isPrivate: false,
            UserUserID: 1,
            lastCreated: new Date(new Date().getTime() + i * 1000)
          });
        }
      
        const response = await request(app).get(`/journals/recent?id=1`);
      
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
        expect(new Date(response.body[0].lastCreated).getTime()).toBeGreaterThan(new Date(response.body[1].lastCreated).getTime());
    });

    it("GET /recent should not return the most recent 5 journals if a user is unauthenticated", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {res.status(401).send("Unauthorized"); next(new Error('Unauthorized'))});
        
        for (let i = 0; i < 7; i++) {
          await sequelize.models.Journal.create({
            title: `Journal Title ${i}`,
            theme: `Theme ${i}`,
            reminder: "Reminder",
            creationDate: new Date(new Date().getTime() + i * 1000),
            isPrivate: false,
            UserUserID: 1,
            lastCreated: new Date(new Date().getTime() + i * 1000)
          });
        }
      
        const response = await request(app).get(`/journals/recent?id=1`);
      
        expect(response.status).toBe(401);
        expect(response.text).toBe('Unauthorized');
    });
      

    it("GET /get_journal should fetch a journal by journal ID", async () => {
        const response = await request(app)
            .get(`/journals/get_journal?id=${createdJournalId}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('journalID', createdJournalId);
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('theme');
        expect(response.body).toHaveProperty('reminder');
        expect(response.body).toHaveProperty('isPrivate');

        if (response.body.Entries) {
            expect(Array.isArray(response.body.Entries)).toBe(true);
        }
    });

    it("GET /get_journal should return a 404 error when the journal does not exist", async () => {
        const nonExistentJournalId = 999;

        const response = await request(app)
            .get(`/journals/get_journal?id=${nonExistentJournalId}`);

        expect(response.status).toBe(404);
        expect(response.text).toContain('Journal not found');
    });

    it("GET /get_journal returns 500 if unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Journal, 'findByPk').mockImplementation(() => {
          throw new Error('Database error');
        });
      
        const validJournalId = 1;
        const response = await request(app).get(`/journals/get_journal?id=${validJournalId}`);
      
        expect(response.status).toBe(500);
        expect(response.text).toContain("Internal server error");
      
        sequelize.models.Journal.findByPk.mockRestore();
      });

    it("GET /get_user_journal should fetch journals for a given user ID", async () => {
        const response = await request(app)
            .get(`/journals/get_user_journal?id=1`);
    
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    
        expect(response.body.length).toBeGreaterThan(0);
    
        response.body.forEach(journal => {
            expect(journal).toHaveProperty('UserUserID', 1);
        });
    });


    it("GET /get_user_journal returns 500 if unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Journal, 'findAll').mockImplementationOnce(() => {
          throw new Error('Database error');
        });
      
        const response = await request(app).get("/journals/get_user_journal?id=1");
        expect(response.status).toBe(500);
        expect(response.text).toContain("Internal server error");
      
        sequelize.models.Journal.findAll.mockRestore(); 
    });      


    it("GET /friends_journals should fetch journals belonging to user's friends", async () => {
        const friendUser = await sequelize.models.User.create({
            username: "friendUser1",
            email: "friend@test.com",
            uid: "user1234",
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });
    
        await sequelize.models.Friend.create({
            fromID: 1,
            toID: friendUser.userID,
            status: "accepted"
        });
    
        const friendJournal = await sequelize.models.Journal.create({
            title: "Friend's Journal Title",
            theme: "Friend's Theme",
            reminder: "Friend's Reminder",
            creationDate: new Date(),
            isPrivate: false,
            UserUserID: friendUser.userID,
        });

        const response = await request(app)
        .get(`/journals/friends_journals?userID=1`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const journalOwnerUsernames = response.body.map(journal => journal.ownerUsername);
        expect(journalOwnerUsernames).toContain(friendUser.username);
    });


    it("GET /friends_journals returns 500 if an unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Friend, 'findAll').mockRejectedValue(new Error('Unexpected error'));
      
        const response = await request(app).get("/journals/friends_journals?userID=1");
        expect(response.status).toBe(500);
        expect(response.text).toContain('Internal server error');
      
        sequelize.models.Friend.findAll.mockRestore();
    });
      
    

    it("POST /journals should create a new journal", async () => {
        const newJournalData = {
            title: "journal1",
            theme: "Test Theme",
            reminder: "Reminder 1",
            isPrivate: true,
            userID: 1
        };

        const response = await request(app)
            .post('/journals')
            .send(newJournalData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('title', newJournalData.title);
        expect(response.body).toHaveProperty('theme', newJournalData.theme);
        expect(response.body).toHaveProperty('reminder', newJournalData.reminder);
        expect(response.body).toHaveProperty('isPrivate', newJournalData.isPrivate);
    });

    it("POST /journals should return a 400 error if the title is missing", async () => {
        const newJournalData = {
          theme: "Test Theme",
          reminder: "Reminder 1",
          isPrivate: true,
          userID: 1
        };
      
        const response = await request(app)
          .post('/journals')
          .send(newJournalData);
      
        expect(response.status).toBe(400);
        expect(response.text).toContain('Title is required');
    });


    it("PUT /journals/:id should update a specific journal", async () => {
    
        const updatedJournalData = {
            title: "Updated Journal Title",
            theme: "Updated Theme",
            reminder: "Updated Reminder",
            isPrivate: false,
        };

    
        const response = await request(app)
            .put(`/journals/${createdJournalId}`)
            .send(updatedJournalData);
    
        expect(response.status).toBe(200);
    
        expect(response.body).toHaveProperty('title', updatedJournalData.title);
        expect(response.body).toHaveProperty('theme', updatedJournalData.theme);
        expect(response.body).toHaveProperty('reminder', updatedJournalData.reminder);
        expect(response.body).toHaveProperty('isPrivate', updatedJournalData.isPrivate);

    });

    it("PUT /journals/:id should return an error if the journal does not exist", async () => {
        const nonExistentJournalId = 9999;
        const updatedJournalData = {
          title: "Updated Journal Title",
          theme: "Updated Theme",
        };
      
        const response = await request(app)
          .put(`/journals/${nonExistentJournalId}`)
          .send(updatedJournalData);
      
        expect(response.status).toBe(404);
        expect(response.text).toContain('Journal not found');
      });

      it("PUT /journals/:id should return an error if the user is unauthenticated", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {res.status(401).send("Unauthorized"); next(new Error('Unauthorized'))});

        const nonExistentJournalId = 9999;
        const updatedJournalData = {
          title: "Updated Journal Title",
          theme: "Updated Theme",
        };
      
        const response = await request(app)
          .put(`/journals/${nonExistentJournalId}`)
          .send(updatedJournalData);
      
        expect(response.status).toBe(401);
        expect(response.text).toContain('Unauthorized');
      });
      

    it("DELETE /journals/:id should delete a specific journal", async () => {
        const response = await request(baseURL).delete(`/journals/${createdJournalId}`);
        expect(response.status).toBe(204);
    });

    it("DELETE /journals/:id should return an error if the journal does not exist", async () => {
        const nonExistentJournalId = 9999;
      
        const response = await request(app)
          .delete(`/journals/${nonExistentJournalId}`);
      
        expect(response.status).toBe(404);
        expect(response.text).toContain('Journal not found');
    });

    it("DELETE /journals/:id should return an error if user is not authenticated", async () => {
        authenticateMiddleware.mockImplementation((req, res, next) => {res.status(401).send("Unauthorized"); next(new Error('Unauthorized'))});
        const nonExistentJournalId = 9999;
      
        const response = await request(app)
          .delete(`/journals/${nonExistentJournalId}`);
      
        expect(response.status).toBe(401);
        expect(response.text).toContain('Unauthorized');
    });



    it("POST /journals returns 500 if there is an unexpected error during journal creation", async () => {
        jest.spyOn(sequelize.models.Journal, 'create').mockRejectedValue(new Error('Unexpected error during journal creation'));
      
        const newJournalData = {
          title: "Test Journal",
          theme: "Test Theme",
          userID: "someUserID",
          reminder: "No Reminder",
          isPrivate: false,
        };
      
        const response = await request(app)
          .post('/journals')
          .send(newJournalData);
      
        expect(response.status).toBe(500);
      
        sequelize.models.Journal.create.mockRestore();
    });

    it("GET /recent returns 500 if an unexpected error occurs", async () => {
        jest.spyOn(sequelize.models.Journal, 'findAll').mockRejectedValue(new Error('Unexpected error fetching journals'));
      
        const response = await request(app).get(`/journals/recent?id=1`);
      
        expect(response.status).toBe(500);
      
        sequelize.models.Journal.findAll.mockRestore();
    });

    it("DELETE /journals/:id should return 500 error if unexpected error", async () => {
        jest.spyOn(sequelize.models.Journal, 'findAll').mockRejectedValue(new Error('Unexpected error during journal creation'));

        const response = await request(baseURL).delete(`/journals/${createdJournalId}`);
      
        expect(response.status).toBe(500);

        sequelize.models.Journal.findAll.mockRestore();
    });


    it("PUT /journals/:id should update a specific journal", async () => {
        jest.spyOn(sequelize.models.Journal, 'findAll').mockRejectedValue(new Error('Unexpected error during journal creation'));
        
        const updatedJournalData = {
            title: "Updated Journal Title",
            theme: "Updated Theme",
            reminder: "Updated Reminder",
            isPrivate: false,
        };

    
        const response = await request(app)
            .put(`/journals/${createdJournalId}`)
            .send(updatedJournalData);
    
    
        expect(response.status).toBe(500);

        sequelize.models.Journal.findAll.mockRestore();

    });
      
      
});