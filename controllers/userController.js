const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const axios = require('axios');
const nutrientry = require("../models/StoreNutri");
const ticketentry = require("../models/tickets");
const randomstring = require('randomstring');
require("dotenv").config();
const _email = process.env.EMAIL
const _password = process.env.EMAIL_PASSWORD
const hydrateentry = require("../models/Hydration");


const signup = async (req, res) => {
  try {
    const { name, email, phone, password, age, height, weight, gender, location, pstatus, astatus, nstatus, fstatus, ostatus, calrange } = req.body;
    const hasNumber = /\d/;
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
    const hasUpperCase = /[A-Z]/;
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
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const newUser = await User.create(req.body);
    return res.status(200).json({ message: "User registered", user: newUser });
  } catch (err) {
    // console.log(err);
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
      const id = isUser._id;
      const isPasswordValid = await bcrypt.compare(password, isUser.password);

      if (isPasswordValid) {
        const accessToken = await jwt.sign(
          { userId: isUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "7d",
          }
        );
        const age = isUser.age;
        const height = isUser.height;
        const weight = isUser.weight;
        const gender = isUser.gender;
        const location = isUser.location;
        const pstatus = isUser.pstatus;
        const astatus = isUser.astatus;
        const nstatus = isUser.nstatus;
        const fstatus = isUser.fstatus;
        const ostatus = isUser.ostatus;
        const calrange = isUser.calrange;
        const phone = isUser.phone
        return res.status(200).json({
          message: "Login successful",
          name: isUser.name,
          accessToken,
          age,
          height,
          weight,
          gender,
          location,
          pstatus,
          astatus,
          nstatus,
          fstatus,
          ostatus,
          calrange,
          phone
        });
      } else {
        return res.status(401).json({ message: "Invalid Credentials" });
      }
    } else {
      return res.status(404).json({ message: "User Not Found" });
    }
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email)
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
          // console.log(error);
        } else {
          // console.log('Email sent: ' + info.response);
        }
      });
      return res.status(200).json({ message: "Password Recovery Email sent successfully!!" });

    }
    else {
      return res.status(404).json({ message: "User Not Found" });
    }
  }
  catch (err) {
    // console.log(err);
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
          // console.log(error);
        } else {
          // console.log('Email sent: ' + info.response);
        }
      });

      return res.status(200).json({ message: "Password reset successful" });
    });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email)
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
      text: `Please use the following One-time-password (OTP) for Registration: ${otp}, Do not share this OTP. \n \n If you didn't request this, please Ignore this mail or let us know \n Regards, \n FoodSnap team. `
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log(error);
      } else {
        // console.log('Email sent: ' + info.response);
      }
    });
    return res.status(200).json({ message: "OTP Sent Successfully!", OTP: `${otp}` });

  }
  catch (err) {
    // console.log(err);
    return res.status(500).json({ message: "Please Request OTP again!" });
  }
}


const detectFood = async (req, res) => {
  try {
    const foodimage = req.file;
    // console.log(foodimage);
    const formData = new FormData();
    const filedata = await req.file.buffer;
    // console.log(filedata);
    formData.append('image', new Blob([filedata]), 'myfoodimage.jpg');
    const APIResponse = await axios.post(process.env.HOSTED_FOOD_DETECTION_URL, formData, {
    });
    return res.status(200).json({ data: APIResponse.data });

  }
  catch (err) {
    // console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const foodAnalyzer = async (req, res) => {
  // console.log(req.body);
  const foodname = await req.body['foodname'];
  // console.log(foodname);
  try {
    const response = await axios.get(process.env.HOSTED_API_URL + `/get_nutrition?food_name=${foodname}`);
    // console.log(response);
    return res.status(200).json({ data: response.data });
  }

  catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


const addNutriData = async (req, res) => {
  try {
    const { nutridata, food_name } = req.body;
    const newEntry = new nutrientry({
      foodname: food_name,
      nutridata: nutridata,
      user: req.userId
    });

    await newEntry.save();
    return res.status(200).json({ message: "Nutrition Info Recorded" });
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }

};

const getNutriData = async (req, res) => {
  try {
    const userId = req.userId;
    const nutridata = await User.findById(userId).populate("nutrientries"); // Populate the user's entries

    const entries = nutridata.nutrientries; // Access the populated entries
    const allentries = entries;
    // Filter entries created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entriesToday = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    // console.log(entriesToday);
    return res.status(200).json({ entries: entriesToday, allentries: allentries });
  } catch (error) {
    // console.error("Error fetching entries:", error);
    return res.status(500).json({ message: error.message });
  }
};


const req_calories = async (req, res) => {
  const { age, gender } = req.params;
  let c_gender = "";
  if (gender == "male") {
    c_gender = 'men';
  }
  else {
    c_gender = 'women';
  }
  try {
    const response = await axios.get(process.env.HOSTED_API_URL + `/get_minmax_calorie?user_age=${age}&user_gender=${c_gender}`);
    return res.status(200).json({ data: response.data });
  }
  catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

const addhydrate = async (req, res) => {
  // hydrateentres
  try {
    const { hydratedata } = req.body;
    const newEntry = new hydrateentry({
      hydrate: hydratedata,
      user: req.userId
    });

    await newEntry.save();
    return res.status(200).json({ message: "Hydration Info Recorded" });
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const gethydrateData = async (req, res) => {
  try {
    const userId = req.userId;
    const hydata = await User.findById(userId).populate("hydrateentries"); // Populate the user's entries

    const entries = hydata.hydrateentries; // Access the populated entries

    // Filter entries created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entriesToday = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    // console.log(entriesToday);
    return res.status(200).json({ entries: entriesToday });
  } catch (error) {
    // console.error("Error fetching hydration entries:", error);
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {

  const { age, height, weight, gender, location } = req.body;
  const id = req.userId;
  let c_gender = "";
  if (gender == "male") {
    c_gender = 'men';
  }
  else {
    c_gender = 'women';
  }
  try {
    const minMax = await axios.get(process.env.HOSTED_API_URL + `/get_minmax_calorie?user_age=${age}&user_gender=${c_gender}`);
    const mincalperday = minMax.data['min_calories'];
    const maxcalperday = minMax.data['max_calories'];
    const calrange = mincalperday + " - " + maxcalperday;
    const updatedEntry = await User.findByIdAndUpdate(id, {
      age,
      height,
      weight,
      gender,
      calrange,
      location
    });
    if (updatedEntry) {
      return res.status(200).json({ message: "Profile Updated Successfully" });
    }
  }
  catch (error) {
    // console.error("Error fetching user :", error);
    return res.status(500).json({ message: error.message });
  }
}
const getUserProfile = async (req, res) => {
  try {
    const _id = req.userId;
    // console.log(_id);
    const isUser = await User.findOne({ _id: _id });
    return res.status(200).json({ age: isUser.age, height: isUser.height, weight: isUser.weight, gender: isUser.gender, calrange: isUser.calrange, location: isUser.location })
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const deleteFood = async (req, res) => {
  const foodid = req.body.itemid; // Corrected line
  try {
    await nutrientry.findByIdAndDelete(foodid);
    return res.status(200).json({ message: 'Successfully deleted.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { pstatus, astatus, nstatus, fstatus, ostatus } = req.body;
  const id = req.userId;
  try {
    const updatedEntry = await User.findByIdAndUpdate(id, {
      pstatus,
      astatus,
      nstatus,
      fstatus,
      ostatus
    });
    if (updatedEntry) {
      return res.status(200).json({ message: "Profile updated successfully" });
    }
  }
  catch (error) {
    // console.error("Error fetching user :", error);
    return res.status(500).json({ message: error.message });
  }
}

const getRecommendations = async (req, res) => {

  const foodname = await req.body['foodname'];
  const id = req.userId;
  const user = await User.findById(id);
  const weight = user.weight;
  const height = user.height;
  try {
    const response = await axios.get(process.env.HOSTED_API_URL + `/get_recommendations?weight=${weight}&height=${height}&foodname=${foodname}`);
    return res.status(200).json({ data: response.data });
  }

  catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
const getmoreDescription = async (req, res) => {
  const foodname = await req.body['foodname'];
  try {
    const response = await axios.get(process.env.HOSTED_API_URL + `/get_description?foodname=${foodname}`);
    return res.status(200).json({ data: response.data });
  }
  catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
const getDietReport = async (req, res) => {
  const id = req.userId;
  try {
    const form = new FormData();
    form.append("type", 1);
    form.append("user_id", id);
    form.append("start", "2024-01-01T00:00:00.000+00:00");
    form.append("end", "2024-01-13T00:00:00.000+00:00");

    const response = await axios.post(
      process.env.HOSTED_API_URL + `/get_pdf`,
      form,
      {
        responseType: 'arraybuffer',
        timeout: 25000
      } // Set responseType to 'arraybuffer'
    );

    res.status(200).end(await response.data, 'binary');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const registerPushNotification = async (req, res) => {
  const pushtoken = await req.body['pushtoken'];
  const id = req.userId;
  try {
    const updatedEntry = await User.findByIdAndUpdate(id, {
      pushtoken
    });
    if (updatedEntry) {
      return res.status(200).json({ message: "Successfull" });
    }
  }
  catch (error) {
    // console.error("Error fetching user :", error);
    return res.status(500).json({ message: error.message });
  }
}
const saveTicket = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newEntry = new ticketentry({
      title: title,
      content: content,
      status: 0,
      user: req.userId
    });
    await newEntry.save();
    return res.status(200).json({ message: "Support request successfull" });
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
const getTicket = async (req, res) => {
  try {
    const id = req.userId;
    const ticketdata = await User.findById(id).populate("ticketentries"); // Populate the user's entries
    const entries = ticketdata.ticketentries;
    return res.status(200).json({ tickets: entries });
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
const updateFullProfile = async (req, res) => {
  try {
    const { name, email, phone, location, age, height, weight, currpass, newpass, confirmpass } = req.body;
    console.log(req.body);
    if (newpass != confirmpass) {
      return res.status(500).json({ message: "New passwords doesn't match" });
    }
    const isuser = User.findById(req.userId);

    // const isPasswordValid = await bcrypt.compare(currpass, isuser.password);
    // const isuser = await User.findById(req.userId);

    if (!isuser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = isuser.password ? await bcrypt.compare(currpass, isuser.password) : false;

    if (isPasswordValid) {
      const updatedUser = await User.findByIdAndUpdate(req.userId, {
        name: name,
        email: email,
        phone: phone,
        age: age,
        height: height,
        location: location,
        weight: weight,
      });
      if (newpass) {
        const hasNumber = /\d/;
        const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
        const hasUpperCase = /[A-Z]/;
        const containsNumber = hasNumber.test(newpass);
        const containsSpecialCharacter = hasSpecialCharacter.test(newpass);
        const containsUpperCase = hasUpperCase.test(newpass);


        if (!containsNumber || !containsSpecialCharacter || !containsUpperCase) {
          return res.status(400).json({ message: "Use at least one UpperCase letter, one Special Character, and one Number in Your Password" });
        }

        if (newpass.length < 7) {
          return res.status(400).json({ message: "Your Password must be at least 7 Characters" });
        }
        const hashedPassword = await bcrypt.hash(newpass, 10);
        const updatedPass = await User.findByIdAndUpdate(req.userId, {
          password: hashedPassword
        });
        if (updatedPass) {
          return res.status(200).json({ message: "Profile updated Successfully" });
        }
      }
      if (updatedUser) {
        return res.status(200).json({ message: "Profile updated Successfully" });
      }
      else {
        return res.status(400).json({ message: "One or more required fields are missing" });
      }
    }
    return res.status(400).json({ message: "Please Enter a valid password" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }

}


module.exports = {
  signup,
  signin,
  forgetpassword,
  resetpassword,
  sendotp,
  detectFood,
  foodAnalyzer,
  addNutriData,
  getNutriData,
  req_calories,
  gethydrateData,
  addhydrate,
  updateProfile,
  getUserProfile,
  deleteFood,
  updateStatus,
  getRecommendations,
  getmoreDescription,
  registerPushNotification,
  getDietReport,
  saveTicket,
  getTicket,
  updateFullProfile
};