const { getAuth } = require("firebase-admin/auth");
const sequelize = require('../database');

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

module.exports = getUser;