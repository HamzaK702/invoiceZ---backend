import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { dbConnection } from "./DB/dbConnection.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import invoiceRoutes from "./src/routes/invoiceRoutes.js";
import quoteRoutes from "./src/routes/quoteRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import businessRoutes from "./src/routes/businessRoutes.js";
import itemsRoutes from "./src/routes/itemsRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "invoices" directory
app.use("/invoices", express.static(path.join(__dirname, "src", "invoices")));

// Serve static files from "quotes" directory
app.use("/quotes", express.static(path.join(__dirname, "src", "quotes")));

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/items", itemsRoutes);

dbConnection();
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}!`));
