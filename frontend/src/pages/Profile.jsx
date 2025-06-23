/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const Profile = () => {
  const { userData, token, backendUrl, getUserProfile } =
    useContext(ShopContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        addresses: userData.address?.length
          ? [...userData.address]
          : [
              {
                street: "",
                city: "",
                state: "",
                zip: "",
                country: "",
              },
            ],
      });
    }
  }, [userData]);

  const handleChange = (e, addressIndex) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => {
        const newAddresses = [...prev.addresses];
        newAddresses[addressIndex] = {
          ...newAddresses[addressIndex],
          [field]: value,
        };
        return { ...prev, addresses: newAddresses };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { street: "", city: "", state: "", zip: "", country: "" },
      ],
    }));
  };

  const removeAddress = (index) => {
    if (formData.addresses.length <= 1) return;

    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.addresses,
        }),
      });

      const data = await response.json();

      if (data.success) {
        getUserProfile(token);
        setIsEditing(false);
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!userData || !formData) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-lg animate-pulse">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-3xl shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>

        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
            >
              <FaTimes /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
            >
              <FaSave /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 text-gray-700">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Personal Information
          </h3>

          <ProfileField
            icon={<FaUser />}
            label="Name"
            name="name"
            value={formData.name}
            editing={isEditing}
            onChange={handleChange}
          />

          <ProfileField
            icon={<FaEnvelope />}
            label="Email"
            value={formData.email}
            disabled={true}
          />

          <ProfileField
            icon={<FaPhone />}
            label="Phone"
            name="phone"
            value={formData.phone}
            editing={isEditing}
            onChange={handleChange}
          />
        </div>

        {/* Addresses */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 w-full">
              Addresses
            </h3>
          </div>

          <div className="space-y-6">
            {formData.addresses.map((address, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-xl border">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <FaMapMarkerAlt /> Address #{index + 1}
                  </h4>

                  {isEditing && formData.addresses.length > 1 && (
                    <button
                      onClick={() => removeAddress(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AddressField
                    label="Street"
                    name="address.street"
                    value={address.street}
                    editing={isEditing}
                    onChange={(e) => handleChange(e, index)}
                  />

                  <AddressField
                    label="City"
                    name="address.city"
                    value={address.city}
                    editing={isEditing}
                    onChange={(e) => handleChange(e, index)}
                  />

                  <AddressField
                    label="State"
                    name="address.state"
                    value={address.state}
                    editing={isEditing}
                    onChange={(e) => handleChange(e, index)}
                  />

                  <AddressField
                    label="ZIP Code"
                    name="address.zip"
                    value={address.zip}
                    editing={isEditing}
                    onChange={(e) => handleChange(e, index)}
                  />

                  <AddressField
                    label="Country"
                    name="address.country"
                    value={address.country}
                    editing={isEditing}
                    onChange={(e) => handleChange(e, index)}
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            ))}

            {isEditing && (
              <button
                onClick={addAddress}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FaPlus /> Add Another Address
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Field Components
const ProfileField = ({
  icon,
  label,
  name,
  value,
  editing,
  onChange,
  disabled = false,
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
      {icon} {label}
    </div>

    {editing && !disabled ? (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    ) : (
      <div className="font-medium text-gray-800 p-2">
        {value || <span className="text-gray-400">Not provided</span>}
      </div>
    )}
  </div>
);

const AddressField = ({
  label,
  name,
  value,
  editing,
  onChange,
  className = "",
}) => (
  <div className={className}>
    <label className="block text-sm text-gray-500 mb-1">{label}</label>

    {editing ? (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <div className="font-medium text-gray-800 p-2">
        {value || <span className="text-gray-400">-</span>}
      </div>
    )}
  </div>
);

export default Profile;