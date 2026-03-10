import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  resetPassword,
  uploadAvatar,
} from "../controllers/userController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
  }
});


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


router.get("/profile", authMiddleware, getProfile);
router.post("/profile/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

export default router;