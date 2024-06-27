const jwt = require("jsonwebtoken");
const User = require("../models/User");
var checkUserAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const { userID } = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(userID).select('-password')
            next()
        } catch (error) {
            console.log(error)
            res.status(401).send({ "status": "failed", "message": "Unauthorised User!" })
        }
    }
    if (!token) {
        res.status(401).send({ "status": "failed", "message": "Uauthorised User,No Token" })
    }
}
module.exports = checkUserAuth;









