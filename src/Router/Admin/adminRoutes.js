const express = require('express');
const router = express.Router();
const { upload, image_compress_response } = require('../../../helper/uploadimage');
const uploadimg = require('../../../helper/upload');
const Adminside = require("../../Controller/admin/admincontroller");
const EventSide = require("../../Controller/admin/eventController");
const checkAdminAuth = require("../../middleware/adminAuth");


//Admin Side
//router.post("/admin-signup", Adminside.signUp);
router.post("/admin-login", Adminside.signIn);
router.get("/getUsers", checkAdminAuth, Adminside.getUsers);
//router.get("/searchUser", checkAdminAuth, Adminside.Searchuser);


//UserSide
router.post("/admin-user-register", checkAdminAuth, uploadimg.array('profileimage'), Adminside.AddUser);
//router.post("/admin-login-User", checkAdminAuth, Adminside.LoginUser);
router.post("/admin-profile-update", checkAdminAuth, Adminside.updateAdmin);
router.post("/admin-user-update/:id", checkAdminAuth, uploadimg.array('profileimage'), Adminside.UpdateUser);
router.post("/Delete-User/:id", checkAdminAuth, Adminside.DeleteUser);
router.post("/change-password-admin", checkAdminAuth, Adminside.ChangePasswordAdmin);
router.post("/admin-changePassword-User", checkAdminAuth, Adminside.ChangePasswordUser);


//Event Side
router.post("/admin-add-event", checkAdminAuth, upload.array('image'), image_compress_response, EventSide.addEvent);
router.post("/admin-delete-event/:id", checkAdminAuth, EventSide.deleteEvent);
router.get("/getEvents", checkAdminAuth, EventSide.SearchEvent);
//router.get("/SearchEvents", checkAdminAuth, EventSide.searchEvent);
router.post("/admin-edit-event/:id", checkAdminAuth, upload.array('image'), image_compress_response, EventSide.updateEvent);




module.exports = router;      






