import mongoose from "mongoose";

export let dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("DB Connected Successfully 💥");
    })
    .catch(() => {
      console.log("DB Failed to connect 🚫");
    });
};
