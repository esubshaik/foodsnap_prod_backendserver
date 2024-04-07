const cron = require('node-cron');
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const User = require("../models/User");
const _email = process.env.EMAIL
const _password = process.env.EMAIL_PASSWORD
require("dotenv").config();
// MongoDB setup
// const { MongoClient } = require('mongodb');
// const mongoClient = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: _email,
        pass: _password
    }
});

async function sendEmailWithPDF(user, start, end, type, _subject) {
    try {
        // Format start and end dates with timezone offset
        const formatWithTimezoneOffset = (date) => {
            const timezoneOffset = date.getTimezoneOffset();
            const hoursOffset = Math.abs(Math.floor(timezoneOffset / 60));
            const minutesOffset = Math.abs(timezoneOffset % 60);
            const sign = timezoneOffset < 0 ? '+' : '-';

            const formattedOffset = `${sign}${hoursOffset.toString().padStart(2, '0')}:${minutesOffset.toString().padStart(2, '0')}`;

            return date.toISOString().replace('Z', formattedOffset);
        };


        const form = new FormData();
        form.append("type", type);
        form.append("user_id", user._id.toString());
        form.append("start", formatWithTimezoneOffset(start));
        form.append("end", formatWithTimezoneOffset(end));
        if (user.name == "V Muralidhar"){
            console.log("Skipping sir email");
            return 
        }

        const response = await axios.post(
            process.env.HOSTED_API_URL + `/get_pdf`,
            form,
            {
                responseType: 'arraybuffer',
                timeout: 25000
            }
        );

        // Save PDF to a file
        const pdfFileName = `report_${user._id}.pdf`;
        const myfile = await response.data;
        await fs.writeFileSync(pdfFileName, await response.data, 'binary');

        // Sending email
        await transporter.sendMail({
            from: _email,
            //   to: user.email,
            to: user.email,
            subject: _subject,
            text: `Dear ${user.name} \n Below is the Attached PDF of your Auto-generated Diet report. Thank you \n \n Regards, \nFoodsnap Team.`,
            attachments: [{ filename: pdfFileName, path: pdfFileName }]
        });

        // Delete the PDF file after sending
        console.log(`email send to -- ${user.name}`);
        await fs.unlinkSync(pdfFileName);
    } catch (error) {
        console.error(error);
    }
}

async function sendEmailsToAllUsers7() {
    try {
        const users = await User.find();
        // console.log(users);
        const start = new Date();
        const end = new Date();
        start.setDate(start.getDate() - 7);
        const type = 1;
        const _subject = "Your Weekly Diet Report from FoodSnap"
        for (const user of users) {
            await sendEmailWithPDF(user, start, end, type, _subject);
        }
    } catch (error) {
        console.error(error);
    }
}
async function sendEmailsToAllUsers30() {
    try {
        const users = await User.find();
        // console.log(users);
        const start = new Date();
        const end = new Date();

        // Set start date to the first day of the previous month
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0); // Set time to 00:00:00:000

        // Set end date to the last day of the previous month at 11:59 PM
        end.setMonth(end.getMonth(), 0); // Set to last day of previous month
        end.setHours(23, 59, 59, 999);
        const type = 2;
        const _subject = "Your Monthly Diet Report from FoodSnap"
        
        for (const user of users) {
            await sendEmailWithPDF(user, start, end, type, _subject);
        }
    } catch (error) {
        console.error(error);
    }
}


async function sendEmailsToAllUsers365() {
    try {
        const users = await User.find();
        // console.log(users);
        const currentDate = new Date();

        // Set start date to the first day of the previous year
        const start = new Date(currentDate.getFullYear() - 1, 0, 1);
        start.setHours(0, 0, 0, 0); // Set time to 00:00:00

        // Set end date to the last day of the previous year at 11:59 PM
        const end = new Date(currentDate.getFullYear(), 0, 0);
        end.setHours(23, 59, 59, 999);
        const type = 3;
        const _subject = "Your Yearly Diet Report from FoodSnap"
        for (const user of users) {
            await sendEmailWithPDF(user, start, end, type, _subject);
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    sendEmailsToAllUsers7,
    sendEmailsToAllUsers30,
    sendEmailsToAllUsers365,
}
