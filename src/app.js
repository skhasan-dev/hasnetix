import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import "./cron/file_expiry_cron.js";
import { connectDatabase } from '../config/index.js';
import { default as apiRouter } from '../src/routes/api_router.js';

dotenv.config();

const app = express();

// middlewares
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(cors({
  origin: "*"
}));

// ping route
app.get('/ping', (req, res) => {
  res.send('OK');
});

// TODO: routes here

app.use('/api', apiRouter);

// global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.toString() : undefined
  });
});

// 🚀 Start server ONLY after DB connects
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDatabase(); // 👈 connect first

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();