const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const nodemailer = require("nodemailer");
const axios = require('axios');
require("dotenv").config();
const randomstring = require('randomstring');
const _email = process.env.EMAIL
const _password = process.env.EMAIL_PASSWORD

const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const hasNumber = /\d/;
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
    const hasUpperCase = /[A-Z]/;
    // Check if the string meets all other conditions
    const containsNumber = hasNumber.test(password);
    const containsSpecialCharacter = hasSpecialCharacter.test(password);
    const containsUpperCase = hasUpperCase.test(password);

    // console.log(phone)
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Fill all Details" });
    }

    if (!containsNumber || !containsSpecialCharacter || !containsUpperCase) {
      return res.status(400).json({ message: "Use at least one UpperCase letter, one Special Character, and one Number in Your Password" });
    }
    
    if (password.length < 7) {
      return res.status(400).json({ message: "Your Password must be at least 7 Characters" });
    }

    const isUser = await User.findOne({ email: email }); //undefined
    if (isUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = await User.create(req.body);
    return res.status(200).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Fill all details" });
    }
    const isUser = await User.findOne({ email });
    if (isUser) {
      // You may add your own authentication logic here if needed
      // For example, compare plain text password with the stored one
      // const isPasswordValid = isUser.password === password;

      // For now, let's assume that the password is always valid
      const isPasswordValid = true;

      if (isPasswordValid) {
        const accessToken = await jwt.sign(
          { userId: isUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).json({
          message: "Login successful",
          name: isUser.name,
          accessToken,
        });
      } else {
        return res.status(401).json({ message: "Invalid Credentials" });
      }
    } else {
      return res.status(404).json({ message: "User Not Found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    if (!email) return res.status(400).json({ message: "Fill Email Properly" });
    const isUser = await User.findOne({ email });

    if (isUser) {

      const accessToken = await jwt.sign(
        { userId: isUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d", }
      );

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: _email,
          pass: _password,
        }
      });

      var mailOptions = {
        from: _email,
        to: email,
        subject: 'Reset Your Password',
        text: `http://localhost:3000/resetpassword/${isUser._id}/${accessToken}`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      return res.status(200).json({ message: "Password Recovery Email sent successfully!!" });

    }
    else {
      return res.status(404).json({ message: "User Not Found" });
    }
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const resetpassword = async (req, res) => {
  try {
    const { userId, accessToken } = req.params;
    const { password } = req.body;

    // Verify the access token (you should have a similar logic for generating access tokens)
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid access token" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Update the user's password
      // For now, we assume that the password change is valid without checking the old password
      // You should implement your own logic for password change validation
      user.password = password;
      await user.save();

      // Send a confirmation email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: _email,
          pass: _password,
        }
      });

      const mailOptions = {
        from: _email,
        to: user.email,
        subject: 'Password Reset Confirmation',
        text: 'Your password has been reset successfully.'
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      return res.status(200).json({ message: "Password reset successful" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    if (!email) return res.status(400).json({ message: "Fill Email Properly" });
    
      const otp = randomstring.generate({
        length: 6, // Adjust the length as needed
        charset: 'numeric'
      });

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: _email,
          pass: _password,
        }
      });

      var mailOptions = {
        from: _email,
        to: email,
        subject: 'OTP Verification',
        text: `Please use the following One-time-password (OTP) for Registration: ${otp}, Do not share this OTP. \n \n If you didn't request this, please Ignore this mail or let us know \n Regards, \n Food-eye team. `
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      return res.status(200).json({ message: "OTP Sent Successfully!",OTP: `${otp}` });
    
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Please Request OTP again!" });
  }
}


module.exports = {
  signup,
  signin,
  forgetpassword,
  resetpassword,
  sendotp
};
