import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getSettings,
  updateSettings,
  createBackup,
  restoreBackup,
} from "../controllers/settingsController.js";
import upload from "../middleware/multer.js";
import { validateSettings } from "../middleware/settingsValidator.js";

const settingsRouter = express.Router();

settingsRouter.use(adminAuth);

settingsRouter.get("/settings", getSettings);
settingsRouter.put("/settings", validateSettings, updateSettings);
settingsRouter.get("/backup", createBackup);
settingsRouter.post("/restore", upload.single("file"), restoreBackup); // 👈 use multer here

export default settingsRouter;