import express from "express";
const router = express.Router();

import {
  searchUsers,
  getUserById,
  getUserStats,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

router.get("/search", protect, searchUsers);
router.get("/:userId", getUserById);
router.get("/:userId/stats", protect, getUserStats);
router.delete("/:userId", protect, deleteUser);

export default router;
