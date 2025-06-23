import fs from "fs";
import path from "path";
import Settings from "../models/settingsModel.js";

const SETTINGS_ID = "default"; // Singleton ID

// GET /api/admin/settings
export const getSettings = async (req, res) => {
    try {
      // Find or create the default settings document
      let settings = await Settings.findOne({ "general._id": "default" });
      
      if (!settings) {
        // Create default settings if none exist
        settings = new Settings({});
        await settings.save();
      }
  
      res.json({ settings });
    } catch (err) {
      res.status(500).json({ 
        message: "Failed to fetch settings", 
        error: err.message 
      });
    }
};

// PUT /api/admin/settings
export const updateSettings = async (req, res) => {
    try {
      // Find and update the settings
      const settings = await Settings.findOneAndUpdate(
        { "general._id": "default" },
        req.body,
        { new: true, upsert: true }
      );
      res.json({ 
        message: "Settings updated successfully", 
        settings 
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Failed to update settings", 
        error: err.message 
      });
    }
};

// GET /api/admin/backup
export const createBackup = async (req, res) => {
    try {
      // This is a placeholder - implement your actual backup logic here
      const backupData = "Backup data would be here in a real implementation";
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=backup.zip');
      res.send(backupData);
    } catch (err) {
      res.status(500).json({ 
        message: "Failed to create backup", 
        error: err.message 
      });
    }
};

// POST /api/admin/restore
export const restoreBackup = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No backup file provided" });
      }
      // This is a placeholder - implement your actual restore logic here
      res.json({ message: "Backup restored successfully" });
    } catch (err) {
      res.status(500).json({ 
        message: "Failed to restore backup", 
        error: err.message 
      });
    }
};