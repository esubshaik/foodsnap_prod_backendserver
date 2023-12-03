const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { isAuthenticated } = require("../Middleware/verifyJWT");
const express = require("express");
const {signup,signin,forgetpassword,resetpassword,sendotp,detectFood,foodAnalyzer} = require("../controllers/userController");
const userController = require("../controllers/userController");

const router = express.Router();
router.route("/register").post(signup);
router.route("/login").post(signin);
router.route("/forgetpassword").post(forgetpassword);
router.route("/resetpassword/:userId/:accessToken").post(resetpassword);
router.route('/send-otp').post(sendotp);
router.route('/analyze-food').post(isAuthenticated,foodAnalyzer);
router.post('/detect-my-food',upload.single('image'),detectFood);
router.use(isAuthenticated);
module.exports = router;