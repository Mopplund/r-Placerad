import express from "express";
import { getCanva, createCanva, updatePixel } from "../controllers/canvaController.js";

const router = express.Router();

router.get("/canva", getCanva);
router.post("/canva", createCanva);
router.put("/canva/pixel", updatePixel);

export default router;
