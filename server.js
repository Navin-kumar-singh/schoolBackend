import express from "express";
import "dotenv/config";
import cors from "cors";
import db from "./src/config/db.js";

// routes
import schoolRoutes from "./src/routes/school.routes.js";

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to Node 🚀");
});

// Main API route
app.use("/api/schools", schoolRoutes);

// DB connect then server start (BEST PRACTICE)
db().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
