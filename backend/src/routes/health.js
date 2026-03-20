import { Router } from "express";
import {
  getDatabaseName,
  isDatabaseConfigured,
  isDatabaseConnected,
} from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    databaseConfigured: isDatabaseConfigured(),
    databaseConnected: isDatabaseConnected(),
    databaseName: getDatabaseName() || null,
    timestamp: new Date().toISOString(),
  });
});

export default router;
