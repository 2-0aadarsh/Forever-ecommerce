/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";

const AddressSelection = ({ selectedAddress, setSelectedAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setAddresses(res.data.user.address);
        }
      } catch (error) {
        console.error("Failed to load addresses:", error);
      }
    };

    fetchUserAddresses();
  }, []);

  const handleNewAddressSubmit = (e) => {
    e.preventDefault();

    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zip ||
      !newAddress.country
    ) {
      alert("Please fill all fields.");
      return;
    }

    setSelectedAddress(newAddress);
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

      {!showNewAddressForm ? (
        <>
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((addr, idx) => (
                <label
                  key={idx}
                  className="block border p-4 rounded cursor-pointer hover:border-black"
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === addr}
                    onChange={() => setSelectedAddress(addr)}
                    className="mr-3"
                  />
                  <span>
                    {addr.street}, {addr.city}, {addr.state} - {addr.zip},{" "}
                    {addr.country}
                  </span>
                </label>
              ))}
              <button
                className="text-blue-500 mt-2 underline"
                onClick={() => setShowNewAddressForm(true)}
              >
                + Add new address
              </button>
            </div>
          ) : (
            <>
              <p>No saved addresses found.</p>
              <button
                className="text-blue-500 mt-2 underline"
                onClick={() => setShowNewAddressForm(true)}
              >
                + Add new address
              </button>
            </>
          )}
        </>
      ) : (
        <form onSubmit={handleNewAddressSubmit} className="space-y-3">
          {["street", "city", "state", "zip", "country"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={newAddress[field]}
              onChange={(e) =>
                setNewAddress({ ...newAddress, [field]: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          ))}

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Use This Address
            </button>
            <button
              type="button"
              className="text-gray-600"
              onClick={() => setShowNewAddressForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressSelection;