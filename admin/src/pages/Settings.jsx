/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import {
  FiSave,
  FiUpload,
  FiDownload,
  FiAlertCircle,
  FiMail,
  FiGlobe,
  FiLock,
  FiServer,
  FiDatabase,
  FiShield,
  FiLoader,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Toggle from "../components/Toggle";
import FileUploadModal from "../components/FileUploadModal";

const Settings = ({ token }) => {
  const [settings, setSettings] = useState({
    general: {
      siteTitle: "",
      supportEmail: "",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
    },
    maintenance: {
      enabled: false,
      message: "We're undergoing maintenance. Please check back soon.",
    },
    security: {
      twoFactorAuth: true,
      passwordExpiry: 90,
      failedAttempts: 5,
    },
    notifications: {
      emailAdmin: true,
      emailUsers: false,
      slackIntegration: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showBackupModal, setShowBackupModal] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSettings(res.data.settings);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load settings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [section, field] = name.split(".");

    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${backendUrl}/api/admin/settings`, settings, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/backup`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `backup-${new Date().toISOString()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Backup downloaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create backup");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FileUploadModal
        show={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        title="Restore Backup"
        endpoint={`${backendUrl}/api/admin/restore`}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure application settings and preferences
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-3">
          <button
            onClick={() => setShowBackupModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiDownload className="mr-2" />
            Restore Backup
          </button>
          <button
            onClick={handleBackup}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiUpload className="mr-2" />
            Create Backup
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("general")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "general"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiGlobe className="inline mr-2" />
              General
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "maintenance"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiServer className="inline mr-2" />
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiShield className="inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "notifications"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiMail className="inline mr-2" />
              Notifications
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-8">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="general.siteTitle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Site Title
                  </label>
                  <input
                    type="text"
                    name="general.siteTitle"
                    id="general.siteTitle"
                    value={settings.general.siteTitle}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="general.supportEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Support Email
                  </label>
                  <input
                    type="email"
                    name="general.supportEmail"
                    id="general.supportEmail"
                    value={settings.general.supportEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="general.timezone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Timezone
                  </label>
                  <select
                    name="general.timezone"
                    id="general.timezone"
                    value={settings.general.timezone}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="CET">Central European Time (CET)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="general.dateFormat"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date Format
                  </label>
                  <select
                    name="general.dateFormat"
                    id="general.dateFormat"
                    value={settings.general.dateFormat}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Settings */}
          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Toggle
                    enabled={settings.maintenance.enabled}
                    setEnabled={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        maintenance: {
                          ...prev.maintenance,
                          enabled: val,
                        },
                      }))
                    }
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Maintenance Mode
                  </h3>
                  <p className="text-sm text-gray-500">
                    When enabled, only administrators can access the site
                  </p>
                </div>
              </div>

              {settings.maintenance.enabled && (
                <div>
                  <label
                    htmlFor="maintenance.message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Maintenance Message
                  </label>
                  <textarea
                    name="maintenance.message"
                    id="maintenance.message"
                    rows={3}
                    value={settings.maintenance.message}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This message will be displayed to users when maintenance
                    mode is active
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Toggle
                    enabled={settings.security.twoFactorAuth}
                    setEnabled={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          twoFactorAuth: val,
                        },
                      }))
                    }
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500">
                    Require admins to use 2FA for login
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="security.passwordExpiry"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password Expiration (days)
                </label>
                <input
                  type="number"
                  name="security.passwordExpiry"
                  id="security.passwordExpiry"
                  min="1"
                  max="365"
                  value={settings.security.passwordExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Number of days before passwords expire (0 to disable)
                </p>
              </div>

              <div>
                <label
                  htmlFor="security.failedAttempts"
                  className="block text-sm font-medium text-gray-700"
                >
                  Failed Login Attempts Before Lockout
                </label>
                <input
                  type="number"
                  name="security.failedAttempts"
                  id="security.failedAttempts"
                  min="1"
                  max="10"
                  value={settings.security.failedAttempts}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Toggle
                    enabled={settings.notifications.emailAdmin}
                    setEnabled={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailAdmin: val,
                        },
                      }))
                    }
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Email Notifications (Admin)
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive system notifications via email
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Toggle
                    enabled={settings.notifications.emailUsers}
                    setEnabled={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailUsers: val,
                        },
                      }))
                    }
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Email Notifications (Users)
                  </h3>
                  <p className="text-sm text-gray-500">
                    Send email notifications to users for important events
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Toggle
                    enabled={settings.notifications.slackIntegration}
                    setEnabled={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          slackIntegration: val,
                        },
                      }))
                    }
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Slack Integration
                  </h3>
                  <p className="text-sm text-gray-500">
                    Send system notifications to Slack channel
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="-ml-1 mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
