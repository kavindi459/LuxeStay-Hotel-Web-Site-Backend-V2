import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";


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
      profilePic, 
      phone,
      role,
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
    user.profilePic = req.body.profilePic || user.profilePic;
    user.role = req.body.role || user.role;

    
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
    await User.findByIdAndDelete(req.params.UserId);

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
