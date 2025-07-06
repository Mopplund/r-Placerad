import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import canvaRoutes from "./routes/canvaRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servern fungerar!");
});

app.use("/api", canvaRoutes);

app.listen(PORT, () => {
  console.log(`Servern körs på port ${PORT}`);
});
