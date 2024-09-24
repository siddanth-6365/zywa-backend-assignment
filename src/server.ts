import express from "express";
import dotenv from "dotenv";
import cardRoutes from "./routes/cardRoutes";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/", cardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});