const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { isAuthenticated } = require("../Middleware/verifyJWT");
const express = require("express");
const {signup,signin,forgetpassword,resetpassword,sendotp,detectFood,foodAnalyzer,
addNutriData,getNutriData,req_calories,addhydrate,gethydrateData,updateProfile,
getUserProfile,deleteFood,updateStatus,getRecommendations,getmoreDescription,
registerPushNotification,getDietReport,saveTicket,getTicket} = require("../controllers/userController");
const userController = require("../controllers/userController");

const router = express.Router();
router.route("/register").post(signup);
router.route("/login").post(signin);
router.route("/forgetpassword").post(forgetpassword);
router.route("/resetpassword/:userId/:accessToken").post(resetpassword);
router.route('/send-otp').post(sendotp);
router.route('/analyze-food').post(foodAnalyzer);
router.route('/store-nutridata').post(isAuthenticated,addNutriData);
router.route('/delete-nutridata').post(deleteFood);
router.route('/update-profile').put(isAuthenticated,updateProfile);
router.route('/get-nutridata').get(isAuthenticated,getNutriData);
router.post('/detect-my-food',upload.single('image'),detectFood);
router.route("/req-calories/:age/:gender").get(req_calories);
router.route('/get-user-profile').get(isAuthenticated,getUserProfile);
router.route('/update-status').put(isAuthenticated,updateStatus);
router.route('/get_recommendations').post(isAuthenticated,getRecommendations);
router.route('/get_more_description').post(getmoreDescription);
router.route('/register-push-notification').put(isAuthenticated,registerPushNotification);
router.route('/diet-report').post(isAuthenticated,getDietReport);
router.route('/support-request').post(isAuthenticated,saveTicket);
router.route('/support-request').get(isAuthenticated,getTicket);

// 
//  
router.route('/store-hydrate').post(isAuthenticated,addhydrate);
router.route('/get-hydrate').get(isAuthenticated,gethydrateData);
router.use(isAuthenticated);
module.exports = router;