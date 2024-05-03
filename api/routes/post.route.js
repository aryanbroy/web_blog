import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  create,
  deletePost,
  getPosts,
  getRecentPosts,
  updatePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create", verifyToken, create);
router.get("/getPosts", getPosts);
router.delete("/deletepost/:postId/:userId", verifyToken, deletePost);
router.put("/updatepost/:postId/:userId", verifyToken, updatePost);
router.get("/getRecentPosts", getRecentPosts);

export default router;
