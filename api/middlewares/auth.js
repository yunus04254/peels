const { getAuth } = require("firebase-admin/auth");
const sequelize = require('../database');
/*
	Authenticates the user from the request by verifying the firebase auth token
	Fetches the corresponding user from the database
	@param request: The express request object
*/
async function getUser(request){
    if (!request.headers.authorization) return null;
    const idToken = request.headers.authorization.split('Bearer ')[1];
    const auth = getAuth();
    try {
        const user = await auth.verifyIdToken(idToken);
        if (!user) return null;
        const userData = await sequelize.models.User.findOne({where:{uid:user.uid}});
        if (!userData) return null;

        return userData;
    
    } catch (error) {
        return null;
    }
}
/*
	Middleware used for automatically authenticating routes
	and adding user object to the request object
	@param req: The express request object
	@param res: The express response object
	@param next: The next middleware function

*/
async function authenticateMiddleware(req, res, next) {
	try {
		const user = await getUser(req)
		if (user) {
			req.user = user
			next()
		} else {
			res.status(401).send("Unauthorized")
			next(new Error("Unauthorized"))
		}
	
	} catch (error) {
		res.status(401).send("Unauthorized")
		next(new Error("Unauthorized"))
	}
}


module.exports = {authenticateMiddleware};