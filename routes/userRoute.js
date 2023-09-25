const { isAuthenticated } = require("../Middleware/verifyJWT");
const express = require("express");
const {signup,signin,forgetpassword,resetpassword} = require("../controllers/userController");
const userController = require("../controllers/userController");

const router = express.Router();
router.route("/register").post(signup);
router.route("/login").post(signin);
router.route("/forgetpassword").post(forgetpassword);
router.route("/resetpassword/:userId/:accessToken").post(resetpassword);
router.use(isAuthenticated);
module.exports = router;
