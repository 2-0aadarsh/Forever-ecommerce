import { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaPlus, FaCheck } from "react-icons/fa";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    userData,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    email: userData?.email || "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ ...formData });

  // Set initial address selection
  useEffect(() => {
    if (userData?.address?.length > 0) {
      setSelectedAddressId(userData.address[0]._id);
    } else {
      setUseSavedAddress(false);
    }
  }, [userData]);

  // Update form data when address selection changes
  useEffect(() => {
    if (useSavedAddress && selectedAddressId && userData?.address) {
      const selectedAddress = userData.address.find(
        (addr) => addr._id === selectedAddressId
      );

      if (selectedAddress) {
        setFormData({
          email: userData.email || "",
          phone: userData.phone || "", // Use user's main phone
          street: selectedAddress.street || "",
          city: selectedAddress.city || "",
          state: selectedAddress.state || "",
          zipcode: selectedAddress.zip || "", // Map zip to zipcode
          country: selectedAddress.country || "",
        });
      }
    }
  }, [useSavedAddress, selectedAddressId, userData]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      description: "Order Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/order/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            navigate("/orders");
            setCartItems({});
          }
        } catch (error) {
          console.log(error);
          toast.error("Payment verification failed");
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate address completeness
    const requiredFields = ["street", "city", "state", "zipcode", "country"];
    const isAddressComplete = requiredFields.every((field) => formData[field]);

    if (!isAddressComplete) {
      toast.error("Please complete all address fields");
      return;
    }

    try {
      const orderItems = [];
      const productMap = new Map(products.map((p) => [p._id, p]));

      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          const quantity = cartItems[itemId][size];
          if (quantity > 0) {
            const product = productMap.get(itemId);
            if (!product) continue;

            orderItems.push({
              name: product.name,
              price: product.price,
              quantity,
              size,
              image: Array.isArray(product.image)
                ? product.image[0]
                : product.image,
              productId: product._id, // Add productId
              subtotal: product.price * quantity,
            });
          }
        }
      }

      const orderAddress = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zipcode,
        country: formData.country,
      };

      const subtotal = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
      const orderData = {
        address: orderAddress,
        items: orderItems,
        amount: subtotal + delivery_fee,
        subtotal,
      };

      // Payment method handler
      if (method === "cod") {
        const res = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          setCartItems({});
          navigate("/orders");
        } else toast.error(res.data.message);
      }

      if (method === "stripe") {
        const res = await axios.post(
          backendUrl + "/api/order/stripe",
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          window.location.replace(res.data.session_url);
        } else toast.error(res.data.message);
      }

      if (method === "razorpay") {
        const res = await axios.post(
          backendUrl + "/api/order/razorpay",
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          initPay(res.data.order);
        } else toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Order submission error:", err);
      toast.error("Order placement failed");
    }
  }; 
  
  
  const handleAddAddress = () => {
    setShowAddressForm(true);
    setUseSavedAddress(false);
  };

  const saveNewAddress = () => {
    setFormData({ ...newAddress, email: userData.email });
    setShowAddressForm(false);
    setUseSavedAddress(false);
  };

  // Check if address is complete
  const requiredFields = ["street", "city", "state", "zipcode", "country"];
  const isAddressComplete = requiredFields.every((field) => formData[field]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 pt-8 min-h-[80vh]">
      {/* Left Section - Delivery Information */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-8">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" /> Delivery Address
            </h3>

            <button
              onClick={handleAddAddress}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <FaPlus /> Add New Address
            </button>
          </div>

          {useSavedAddress && userData?.address?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-4">
                {userData.address.map((addr) => (
                  <div
                    key={addr._id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedAddressId(addr._id)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {selectedAddressId === addr._id && (
                        <FaCheck className="text-blue-500 mt-1" />
                      )}
                      <div>
                        <h4 className="font-medium">{userData.name}</h4>
                        <p className="text-gray-600 text-sm">{addr.street}</p>
                        <p className="text-gray-600 text-sm">
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        <p className="text-gray-600 text-sm">{addr.country}</p>
                        {addr.phone && (
                          <p className="text-gray-600 text-sm mt-1">
                            Phone: {addr.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="useSavedAddress"
                  checked={useSavedAddress}
                  onChange={(e) => setUseSavedAddress(e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="useSavedAddress" className="text-gray-700">
                  Use selected address
                </label>
              </div>
            </div>
          ) : showAddressForm ? (
            <div className="bg-blue-50 rounded-xl p-5 mb-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <FaPlus className="text-blue-500" /> New Address
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Street
                  </label>
                  <input
                    required
                    name="street"
                    value={newAddress.street}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    City
                  </label>
                  <input
                    required
                    name="city"
                    value={newAddress.city}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    State
                  </label>
                  <input
                    required
                    name="state"
                    value={newAddress.state}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ZIP Code
                  </label>
                  <input
                    required
                    name="zipcode"
                    value={newAddress.zipcode}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Country
                  </label>
                  <input
                    required
                    name="country"
                    value={newAddress.country}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Phone
                  </label>
                  <input
                    required
                    name="phone"
                    value={newAddress.phone}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 123-456-7890"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={saveNewAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    if (userData?.address?.length > 0) setUseSavedAddress(true);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-5 mb-4 bg-gray-50">
              <div className="text-center py-8">
                <FaMapMarkerAlt className="mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-500 mb-4">No address selected</p>
                <button
                  onClick={handleAddAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Delivery Address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Address Preview */}
        {!showAddressForm && !useSavedAddress && formData.street && (
          <div className="border-2 border-blue-300 rounded-xl p-5 mb-6 bg-blue-50">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FaCheck className="text-blue-500" /> Delivery To
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Street:</span> {formData.street}
              </div>
              <div>
                <span className="text-gray-500">City:</span> {formData.city}
              </div>
              <div>
                <span className="text-gray-500">State:</span> {formData.state}
              </div>
              <div>
                <span className="text-gray-500">ZIP:</span> {formData.zipcode}
              </div>
              <div>
                <span className="text-gray-500">Country:</span>{" "}
                {formData.country}
              </div>
              <div>
                <span className="text-gray-500">Phone:</span> {formData.phone}
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                required
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1 123-456-7890"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Order Summary & Payment */}
      <div className="lg:w-[400px]">
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
          <div className="mb-8">
            <Title text1={"ORDER"} text2={"SUMMARY"} />
            <CartTotal />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Title text1={"PAYMENT"} text2={"METHOD"} />
            </div>

            <div className="space-y-3">
              <PaymentOption
                method={method}
                setMethod={setMethod}
                value="stripe"
                logo={assets.stripe_logo}
                label="Stripe"
              />

              <PaymentOption
                method={method}
                setMethod={setMethod}
                value="razorpay"
                logo={assets.razorpay_logo}
                label="Razorpay"
              />

              <PaymentOption
                method={method}
                setMethod={setMethod}
                value="cod"
                label="Cash on Delivery"
              />
            </div>
          </div>

          <button
            type="submit"
            onClick={onSubmitHandler}
            disabled={!isAddressComplete}
            className={`w-full py-3 rounded-xl text-white font-medium ${
              !isAddressComplete
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            }`}
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Option Component
const PaymentOption = ({ method, setMethod, value, logo, label }) => (
  <div
    onClick={() => setMethod(value)}
    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
      method === value
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 hover:border-gray-300"
    }`}
  >
    <div
      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
        method === value ? "border-blue-500 bg-blue-500" : "border-gray-400"
      }`}
    >
      {method === value && (
        <div className="h-2 w-2 bg-white rounded-full"></div>
      )}
    </div>

    {logo ? (
      <img src={logo} alt={label} className="h-6" />
    ) : (
      <span className="text-gray-700 font-medium">{label}</span>
    )}
  </div>
);

export default PlaceOrder;
