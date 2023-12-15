const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { isAuthenticated } = require("../Middleware/verifyJWT");
const express = require("express");
const {signup,signin,forgetpassword,resetpassword,sendotp,detectFood,foodAnalyzer,addNutriData,getNutriData,req_calories,addhydrate,gethydrateData} = require("../controllers/userController");
const userController = require("../controllers/userController");

const router = express.Router();
router.route("/register").post(signup);
router.route("/login").post(signin);
router.route("/forgetpassword").post(forgetpassword);
router.route("/resetpassword/:userId/:accessToken").post(resetpassword);
router.route('/send-otp').post(sendotp);
router.route('/analyze-food').post(foodAnalyzer);
router.route('/store-nutridata').post(isAuthenticated,addNutriData);
router.route('/get-nutridata').get(isAuthenticated,getNutriData);
router.post('/detect-my-food',upload.single('image'),detectFood);
router.route("/req-calories/:age/:gender").get(req_calories);
// ,
//  
router.route('/store-hydrate').post(isAuthenticated,addhydrate);
router.route('/get-hydrate').get(isAuthenticated,gethydrateData);
router.use(isAuthenticated);
module.exports = router;