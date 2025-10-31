const mongoose = require("mongoose");

function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file!");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
      console.error("❌ Error connecting to MongoDB:", err);
      process.exit(1);
    });
}

module.exports = connectDB;
