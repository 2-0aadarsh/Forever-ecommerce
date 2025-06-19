/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Order Page</h3>
      <div>
        {orders.map((order, index) => {
          const address = order.address || {};
          const fullName = order.user?.name || "Unnamed User";

          return (
            <div
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 my-4 text-xs sm:text-sm text-gray-700"
              key={order._id || index}
            >
              <img
                className="w-12"
                src={assets.parcel_icon}
                alt="Parcel Icon"
              />

              <div>
                <div>
                  {order.items.map((item, idx) => (
                    <p className="py-0.5" key={idx}>
                      {item.name} x {item.quantity} <span>{item.size}</span>
                      {idx < order.items.length - 1 ? "," : ""}
                    </p>
                  ))}
                </div>

                <p className="mt-3 mb-2 font-medium">{fullName}</p>

                <div className="space-y-1">
                  <p>{address.street || "Street not provided"}</p>
                  <p>
                    {[address.city, address.state, address.country]
                      .filter(Boolean)
                      .join(", ")}
                    {address.zipcode ? `, ${address.zipcode}` : ""}
                  </p>
                </div>

                {address.phone && <p className="mt-1">{address.phone}</p>}
              </div>

              <div>
                <p className="text-sm sm:text-[15px]">
                  Items: {order.items.length}
                </p>
                <p className="mt-3">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>

              <p className="text-sm sm:text-[15px]">
                {currency}
                {order.amount}
              </p>

              <select
                onChange={(e) => statusHandler(e, order._id)}
                value={order.status}
                className="p-2 font-semibold"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
