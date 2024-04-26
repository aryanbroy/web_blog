import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log(error));

const app = express();

app.listen(3000, () => {
  console.log("Server running at port 3000!");
});
