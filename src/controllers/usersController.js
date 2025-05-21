import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const getUser = async (req, res) => {
  try {
    const users = await User.find();
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

export const createUser = async (req, res) => {
  const { firstName, lastName, email, profilePic, phone, password } = req.body;

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
      profilePic, 
      phone,
      password: hashPassword,
    });

    // await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
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
