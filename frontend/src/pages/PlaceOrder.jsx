import { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

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

  const emptyForm = {
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    if (useSavedAddress && userData?.address?.length > 0) {
      if (!selectedAddressId) {
        setSelectedAddressId(userData.address[0]._id);
        return;
      }
      const selectedAddress = userData.address.find(
        (addr) => addr._id === selectedAddressId
      );
      if (selectedAddress) {
        setFormData({
          ...selectedAddress,
          email: userData.email || "",
          phone: selectedAddress.phone || "",
        });
      }
    } else {
      setFormData(emptyForm);
    }
  }, [useSavedAddress, selectedAddressId, userData]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      let orderItems = [];

      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          if (cartItems[itemId][size] > 0) {
            const itemInfo = structuredClone(
              products.find((p) => p._id === itemId)
            );
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = cartItems[itemId][size];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      let finalAddress = formData;
      if (useSavedAddress && selectedAddressId) {
        const selected = userData.address.find(
          (addr) => addr._id === selectedAddressId
        );
        if (selected) {
          finalAddress = selected;
        }
      }

      const orderData = {
        address: finalAddress,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      if (method === "cod") {
        const res = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          {
            headers: { token },
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
            headers: { token },
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
            headers: { token },
          }
        );
        if (res.data.success) {
          initPay(res.data.order);
        } else toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Order placement failed");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* ---------- Left Side Form -------------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label className="font-medium">Use saved address:</label>
          <input
            type="checkbox"
            checked={useSavedAddress}
            onChange={(e) => {
              setUseSavedAddress(e.target.checked);
              if (!e.target.checked) setSelectedAddressId("");
            }}
          />
        </div>

        {useSavedAddress && userData?.address?.length > 0 && (
          <div className="mb-4">
            <label className="font-medium">Select saved address:</label>
            <select
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              required
            >
              <option value="">-- Select Address --</option>
              {userData.address.map((addr) => (
                <option key={addr._id} value={addr._id}>
                  {userData.name}, {addr.street}, {addr.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          required
          disabled={useSavedAddress}
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          required
          disabled={useSavedAddress}
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            required
            disabled={useSavedAddress}
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            disabled={useSavedAddress}
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            disabled={useSavedAddress}
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            disabled={useSavedAddress}
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          disabled={useSavedAddress}
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />
      </div>

      {/* ---------- Right Side: Cart + Payment ---------- */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-green-400" : ""
                }`}
              />
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "razorpay" ? "bg-green-400" : ""
                }`}
              />
              <img
                className="h-5 mx-4"
                src={assets.razorpay_logo}
                alt="Razorpay"
              />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              />
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
