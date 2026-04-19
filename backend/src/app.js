require("dotenv").config()
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
))

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const recommendationRouter = require("./routes/recommendation");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/api", recommendationRouter);
app.use("/", chatRouter);

// Initialize Socket.IO
const { initializeSocket } = require("./socket/socketHandler");
initializeSocket(io);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(3000, () => {
      console.log("Server is successfully listening on port 3000...");
    });
  })
  .catch(e => {
    console.error("Database cannot be connected!!", e);
  });