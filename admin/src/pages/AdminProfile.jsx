/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiSave,
  FiLoader,
  FiEdit2,
  FiX,
  FiLock,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import ChangePasswordModal from "../components/ChangePasswordModal.jsx";

const AdminProfile = ({ token }) => {
  console.log("AdminProfile", token);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    createdAt: "",
    lastLogin: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setProfile({
          ...res.data.admin,
          createdAt: new Date(res.data.admin.createdAt).toLocaleDateString(),
          lastLogin: res.data.admin.lastLogin
            ? new Date(res.data.admin.lastLogin).toLocaleString()
            : "Never logged in",
        });
        setLoading(false)
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error(
          err.response?.data?.message || "Failed to load profile data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    if (!profile.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profile.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(profile.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!profile.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!phoneRegex.test(profile.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
    try {
      const { createdAt, lastLogin, ...updateData } = profile;
      await axios.put(`${backendUrl}/api/admin/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update failed", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    // Refetch original data
    axios
      .get(`${backendUrl}/api/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) =>
        setProfile({
          ...res.data.admin,
          createdAt: new Date(res.data.admin.createdAt).toLocaleDateString(),
          lastLogin: res.data.admin.lastLogin
            ? new Date(res.data.admin.lastLogin).toLocaleString()
            : "Never logged in",
        })
      );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(()=> {
    console.log("profile", profile);
  },[profile])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        token={token}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your administrator account details and security settings
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FiEdit2 className="mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FiLoader className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Personal Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal details
                  </p>
                </div>

                {/* Name Field */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-2 ${
                          isEditing ? "bg-white" : "bg-gray-50"
                        } border ${
                          errors.name
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        } rounded-md shadow-sm sm:text-sm`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profile.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-2 ${
                          isEditing ? "bg-white" : "bg-gray-50"
                        } border ${
                          errors.email
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        } rounded-md shadow-sm sm:text-sm`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Field */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone number
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-2 ${
                          isEditing ? "bg-white" : "bg-gray-50"
                        } border ${
                          errors.phone
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        } rounded-md shadow-sm sm:text-sm`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role Field (Read-only) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Role
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiShield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="role"
                        id="role"
                        value={profile.role}
                        readOnly
                        className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Account Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Details about your account
                  </p>
                </div>

                {/* Created At */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="createdAt"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Account created
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="createdAt"
                        id="createdAt"
                        value={profile.createdAt}
                        readOnly
                        className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Last Login */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="lastLogin"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last login
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="lastLogin"
                        id="lastLogin"
                        value={profile.lastLogin}
                        readOnly
                        className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 transition-colors duration-200"
                    >
                      {updating ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Security Section */}
        <div className="bg-gray-50 px-4 py-5 sm:px-6 border-t border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Security
          </h3>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              <p>Keep your account secure with a strong password</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FiLock className="mr-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
