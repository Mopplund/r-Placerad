import Canva from "../models/Canva.js";
import { getSocketIo } from "../socket.js";

export async function getCanva(req, res) {
  try {
    const canva = await Canva.findOne();
    if (!canva) {
      return res.status(404).json({ message: "Canvas not found" });
    }
    res.status(200).json(canva);
  } catch (error) {
    console.error("Error fetching canvas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createCanva(req, res) {
  try {
    const existing = await Canva.findOne();
    if (existing) {
      return res.status(400).json({ message: "Canvas already exists" });
    }

    const fieldWidth = 200;
    const fieldHeight = 100;

    const field = Array(fieldHeight)
      .fill(null)
      .map(() => Array(fieldWidth).fill("#FFFFFF"));

    const newCanva = new Canva({ field, fieldWidth, fieldHeight });
    await newCanva.save();

    res.status(201).json(newCanva);
  } catch (error) {
    console.error("Error creating canvas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updatePixel(req, res) {
  try {
    const { x, y, color } = req.body;

    if (x === undefined || y === undefined || !color) {
      return res.status(400).json({ message: "Missing x, y, or color" });
    }

    const canva = await Canva.findOne();
    if (!canva) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    if (y < 0 || y >= canva.fieldHeight || x < 0 || x >= canva.fieldWidth) {
      return res.status(400).json({ message: "Invalid pixel coordinates" });
    }

    canva.field[y][x] = color;
    await canva.save();

    const io = getSocketIo();
    if (io) {
      io.emit("pixel-updated", { x, y, color });
    }

    res.status(200).json(canva);
  } catch (error) {
    console.error("Error updating pixel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
