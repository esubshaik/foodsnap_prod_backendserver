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
const User = require("./models/User");
const emailScheduler = require('./controllers/emailSender.js');
const cron = require('node-cron');
// Now you can call the functions defined in emailScheduler.js
// For example, to start the email sending process:


const mongoURI = process.env.MONGODB_URL;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

  

// Schedule the function to run every Sunday
cron.schedule('0 0 * * 0', async () => {
  emailScheduler.sendEmailsToAllUsers7();
});

// Schedule the function to run on the 1st day of every month
cron.schedule('0 0 1 * *', async () => {
  emailScheduler.sendEmailsToAllUsers30();
});

// Schedule the function to run on the 1st day of every year
cron.schedule('0 0 1 1 *', async () => {
  emailScheduler.sendEmailsToAllUsers365();
});


app.use("/api/user", userRouter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen(8000, () => {
  console.log("server started in terminal");
});
