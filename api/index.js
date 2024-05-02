import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";

import cookieParser from "cookie-parser";
dotenv.config();

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log(error));

const app = express();

app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(3000, () => {
  console.log("Server running at port 3000!");
});
