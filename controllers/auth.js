import bcryptjs from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

import createError from "../utils/createError.js";

export const signup = async (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return next(
      createError({ status: 400, message: "Name, email, Password is required" })
    );
  }
  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(req.body.password, salt);

    const newUSer = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUSer.save();
    return res.status(201).json("new user created");
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
export const login = async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(
      createError({ status: 401, message: "Required field : email password" })
    );
  }
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "name email password"
    );
    if (!user) {
      return res.status(404).json("No user found");
    }

    const isPasswordCorrect = await bcryptjs.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    const payload = {
      id: user._id,
      name: user.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: "login successful" });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export const logout = async (req, res) => {
  try {
    await res.clearCookie("access_token");
    return res.status(200).json({ message: "logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const isLoggedIn = (req, res) => {
  const token = req.cookies.access_token;
  console.log(token, "token");
  if (!token) {
    return res.json(false);
  }
  return jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      console.log("error occured");
      return res.json(false);
    }
    return res.json(true);
  });
};
