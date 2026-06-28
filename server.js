require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const connectDB = require("./config/db");
connectDB();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});