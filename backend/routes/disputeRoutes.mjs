import express from "express";
import {
    raiseDispute,
    getMyDisputes,
    getAllDisputes,
    resolveDispute,
} from "../controllers/disputeController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { adminMiddleware } from "../middleware/adminMiddleware.mjs";

const router = express.Router();
router.use(authMiddleware);

router.post("/", raiseDispute);                          // citizen
router.get("/", getMyDisputes);                          // citizen
router.get("/all", adminMiddleware, getAllDisputes);      // admin
router.put("/:id", adminMiddleware, resolveDispute);     // admin

export default router;
