import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";
import OTP from "../models/otpModel.js";
import { sendOTPEmail } from "../services/emailService.js";

export const createUser = async (req, res) => {
  const { firstName, lastName, email, profilePic, phone, password ,role} = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }
    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      profilePic:req.file ? req.file.path : null, 
      phone,
      role,
      password: hashPassword,
    });

     await newUser.save();
     const otp = Math.floor(1000 + Math.random() * 9000);
    const newOtp = new OTP({ email, otp });
    await newOtp.save();

    await sendOTPEmail(email, otp);
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for the OTP.",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const payload = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    const token = generateToken(payload);

    const { password:removedPassword, _, ...userWithoutPassword } = user._doc


    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: token,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};



export const getUser = async (req, res) => {
  try {
    const users = await User.find();
  
    if(users.length === 0){
      return res.status(200).json({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// export const createUser = (req, res) => {
//    const user = req.body;
//    const newUser =new User(user);
//    newUser.save().then((result) => {
//        res.status(201).json(result);

//    }).catch((err) => {
//        res.status(500).json(err);
//    })
// }


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.UserId);
   
    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};



export const updateUser =async (req, res) => {
  try {
   const user = await User.findById(req.params.UserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user information
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.profilePic = req.file ? req.file.path : user.profilePic;
    user.role = req.body.role || user.role;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    
   const updateUSer =await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updateUSer,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }

 
 
}



export const deleteUser =async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.UserId);

  if(!user){
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
}


export const getUserprofile = async (req, res) => {
  const user = req.user; 
  

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  } else {
    return res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  }
};



//validate otp

export const verifyemail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find latest OTP sent to this email
    const otpEntries = await OTP.find({ email }).sort({ date: -1 });

    if (otpEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
      });
    }

    const latestOtp = otpEntries[0];

    // Check if OTP is expired (10 minutes)
    const otpAge = Date.now() - new Date(latestOtp.date).getTime();
    if (otpAge > 10 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Make sure both are numbers before comparing
    if (Number(latestOtp.otp) === Number(otp)) {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { isEmailVerified: true },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User email verified successfully",
        data: updatedUser,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};





export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    // Delete old OTPs for this email
    await OTP.deleteMany({ email });

    const otp = Math.floor(1000 + Math.random() * 9000);
    await OTP.create({ email, otp });
    await sendOTPEmail(email, otp);

    return res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to resend OTP", error: error.message });
  }
};

