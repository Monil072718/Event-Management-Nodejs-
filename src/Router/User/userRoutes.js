const express = require('express');
const router = express.Router();
const uploadimg = require('../../../helper/upload');
const UserSide = require("../../Controller/user/userController");
const checkUserAuth = require("../../middleware/userAuth");
const Password = require('../../Controller/user/password');

router.post("/changepassword", checkUserAuth, UserSide.changeUserPassword);

router.post("/userregister", uploadimg.array('profileimage', 12), UserSide.registerUser);
router.post("/userlogin", UserSide.userLogin);
router.post("/forgotPassword", UserSide.forgotPassword);
router.post("/reset-password/:id/:token", UserSide.userPasswordReset);

router.post('/recover', Password.recover);
router.get('/reset/:token', Password.reset);
router.post('/reset/:token', Password.resetPassword);


router.get("/getprofile", checkUserAuth, UserSide.getProfile);
router.post("/updateprofile", uploadimg.array('profileimage'), checkUserAuth, UserSide.updateprofile);
router.get("/searchEvent", checkUserAuth, UserSide.searchEvent);
router.post("/bookevent/:id",checkUserAuth ,UserSide.bookEvent);
router.post("/addCard",checkUserAuth,UserSide.addCard);
router.post("/createcharges",UserSide.createCharges);
router.delete("/cancelEvent/:id",checkUserAuth,UserSide.cancelEvent);
router.post("/create-checkout-session",UserSide.paymentCheckOut);
router.post("/create-customer/:id",checkUserAuth ,UserSide.createCustomer);





module.exports = router;



