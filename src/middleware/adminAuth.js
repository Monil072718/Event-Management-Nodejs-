const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

var checkAdminAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const { adminID } = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = await Admin.findById(adminID).select('-password');
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
module.exports = checkAdminAuth;


