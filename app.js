const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const userRouter = require("./routes/userRoute");
const { isAuthenticated } = require("./Middleware/verifyJWT");
const bodyParser = require('body-parser');

const mongoURI = process.env.MONGODB_URL;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    // console.error("Error connecting to MongoDB Atlas:", error);
  });


//   const { Expo } = require('expo-server-sdk');
// const cron = require('node-cron');

// // Create a new Expo client
// const expo = new Expo();

// const notifyarr = [
//   {
//     title: '⏰ 𝗧𝗶𝗺𝗲 𝗳𝗼𝗿 𝗮 𝗙𝗼𝗼𝗱𝗦𝗻𝗮𝗽 𝗨𝗽𝗱𝗮𝘁𝗲! ⏰',
//     body: "🍎 Don't forget to log your latest meal. Your journey to a healthier lifestyle starts with every entry. 🌿",
//   },
//   {
//     title: '⚡ 𝗤𝘂𝗶𝗰𝗸 𝗨𝗽𝗱𝗮𝘁𝗲: 𝗠𝗲𝗮𝗹 𝗧𝗶𝗺𝗲! ⚡',
//     body: "🥗 Don't miss out on recording your latest meal. Each entry counts towards a healthier lifestyle journey. 🥦 ",
//   },
//   {
//     title: '🍇 𝗙𝗼𝗼𝗱𝗦𝗻𝗮𝗽 𝗔𝗹𝗲𝗿𝘁: 𝗧𝗶𝗺𝗲 𝘁𝗼 𝗟𝗼𝗴! 🍇 ',
//     body: "🥑 Your meal log awaits! Make every entry count on your path to a healthier and happier you. 🏋️‍♀️",
//   },
// ];

// function sendExpoNotification(expoPushToken, message) {
//   const notification = {
//     to: expoPushToken,
//     sound: 'default',
//     title: notifyarr[0].title,
//     body: notifyarr[0].body,
//   };

//   expo.sendPushNotificationsAsync([notification])
//     .then((receipts) => {
//       console.log('Notification sent successfully:', receipts);
//     })
//     .catch((error) => {
//       console.error('Error sending notification:', error);
//     });
// }

// const notificationMessage = 'Your Notification Message';

// cron.schedule('* * * * *', () => {
//   const expoPushToken = 'ExponentPushToken[8LSRkkItMdZQGn_lGWdF1V]';
//   sendExpoNotification(expoPushToken, notificationMessage);
// }, {
//   timezone: 'Asia/Kolkata',
// });


app.use("/api/user", userRouter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen(8000, () => {
  console.log("server started in terminal");
});
