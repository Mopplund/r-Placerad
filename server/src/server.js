import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.get("/", (req, res) => {
  res.send("Servern fungerar!");
});

app.get("/api/pixel", (req, res) => {
  res.status(200).send("Hämtar alla pixlar");
});

app.put("/api/pixel/:id", (req, res) => {
  res.status(201).json({ message: "Pixel updaterad skapad" });
});

app.listen(PORT, () => {
  console.log(`Servern körs på port ${PORT}`);
});
