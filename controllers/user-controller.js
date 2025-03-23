import express from "express";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

export const getUserById = async (req, res) => {
  try {
    // get userId
    const userId = req.query.user;
    if (!userId)
      return res
        .status(404)
        .json({ success: false, msg: "User ID is required" });
    // search in user model
    const userFound = await User.findById(userId);
    // return user
    return res.status(200).json({
      success: true,
      msg: "User Found",
      userFound,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
