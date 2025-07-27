import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import canvaRoutes from "./routes/canvaRoutes.js";
import { setSocketIo } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend.onrender.com",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
  },
});

setSocketIo(io);

connectDB();

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api", canvaRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
