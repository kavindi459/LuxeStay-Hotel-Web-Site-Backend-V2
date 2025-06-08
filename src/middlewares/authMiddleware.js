import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {JWT_SECRET} from "./../config/env.js"
// Middleware to protect routes with JWT authentication
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Add user to request object (without password and OTP fields)
      req.user = await User.findById(decoded.id).select(
        "-password "
      );

      if (!req.user) {
        res.status(401);
        throw new Error("User associated with this token no longer exists");
      }

      next();
    } catch (error) {
      console.error(`Auth error: ${error.message}`);
      res.status(401);
      throw new Error("Not authorized, invalid or expired token");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

// Middleware to check admin rights
export const adminProtect = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "Admin")) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
});


// Middleware for verification status check
export const verifiedProtect = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.verified === "Verified") {
    next();
  } else {
    res.status(403);
    throw new Error("Account not verified");
  }
});



export const customerProtect = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "User")) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as customer");
  }
});



