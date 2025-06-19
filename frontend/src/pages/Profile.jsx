/* eslint-disable react/prop-types */
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Profile = () => {
  const { userData } = useContext(ShopContext);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-lg animate-pulse">
        Loading Profile...
      </div>
    );
  }

  const { name, email, phone } = userData;
  const address = userData.address?.[0] || {}; // ✅ Fix: Safely get first address object

  return (
    <div className="max-w-3xl mx-auto mt-16 p-6 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        My Profile
      </h2>

      <div className="grid sm:grid-cols-2 gap-6 text-gray-700 text-[16px]">
        <ProfileItem icon={<FaUser />} label="Name" value={name} />
        <ProfileItem icon={<FaEnvelope />} label="Email" value={email} />
        {phone && (
          <ProfileItem icon={<FaPhone />} label="Phone" value={phone} />
        )}

        {/* Address Section */}
        {Object.values(address).some(Boolean) && (
          <div className="sm:col-span-2 bg-gray-50 p-5 rounded-xl border">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FaMapMarkerAlt /> Address Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {address.street && (
                <ProfileItem label="Street" value={address.street} compact />
              )}
              {address.city && (
                <ProfileItem label="City" value={address.city} compact />
              )}
              {address.state && (
                <ProfileItem label="State" value={address.state} compact />
              )}
              {address.zip && (
                <ProfileItem label="ZIP Code" value={address.zip} compact />
              )}
              {address.country && (
                <ProfileItem label="Country" value={address.country} compact />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Reusable profile item with optional icon
const ProfileItem = ({ icon, label, value, compact }) => (
  <div className={`flex items-start ${compact ? "gap-2" : "gap-3"}`}>
    {icon && <div className="text-blue-500 text-lg">{icon}</div>}
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  </div>
);

export default Profile;