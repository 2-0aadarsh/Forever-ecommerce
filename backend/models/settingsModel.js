import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  general: {
    _id: { type: String, default: "default" }, // Enforce singleton
    siteTitle: { type: String, default: "Forever Admin" },
    supportEmail: { type: String, default: "support@forever.com" },
    timezone: { type: String, default: "UTC" },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
  },
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: {
      type: String,
      default: "We're undergoing maintenance. Please check back soon.",
    },
  },
  security: {
    twoFactorAuth: { type: Boolean, default: true },
    passwordExpiry: { type: Number, default: 90 },
    failedAttempts: { type: Number, default: 5 },
  },
  notifications: {
    emailAdmin: { type: Boolean, default: true },
    emailUsers: { type: Boolean, default: false },
    slackIntegration: { type: Boolean, default: false },
  },
});

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;