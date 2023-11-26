import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import allroutes from "./routes/index.js";

const PORT = process.env.PORT || 8005;
const app = express();
const corsOptions = {
  origin: "*",
  credentials: true,
};

//middlewares
app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api", allroutes);

//error handler from utils
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(status).json({ message, stack: err.stack });
});

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("mongo db connected ");
    console.log("Connected to database:", connection.connections[0].name);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

app.listen(PORT, () => {
  connectDB();
  console.log(`server is running on port ${PORT}`);
});
