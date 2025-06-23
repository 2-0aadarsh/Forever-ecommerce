import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import moment from "moment";
import { FaUserAlt } from "react-icons/fa";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/order/admin/list`, {
        headers: { token },
      });

      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/order/status/${orderId}`,
        { status: event.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order status updated");
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const getAddressString = (address) => {
    if (!address) return "No address available";
    return [
      address.street,
      address.city,
      address.state,
      address.country,
      address.zip,
    ]
      .filter(Boolean)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500 text-lg animate-pulse">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">
        Order Management
      </h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {[
                "Order ID",
                "Customer",
                "Shipping Address",
                "Items",
                "Amount",
                "Date",
                "Status",
                "Action",
              ].map((title) => (
                <th
                  key={title}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono text-indigo-600">
                  #{order._id.toString().slice(-6).toUpperCase()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaUserAlt className="text-gray-400 text-sm" />
                    <div>
                      <div className="font-semibold">
                        {order.userId?.name || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.userId?.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {getAddressString(
                    order.address ||
                      order.shippingAddress ||
                      order.userId?.address?.[0]
                  )}
                </td>

                <td className="px-6 py-4 text-sm leading-relaxed">
                  {order.items.map((item, i) => (
                    <div key={i} className="text-gray-700 mb-1">
                      <span className="font-medium">{item.name}</span>{" "}
                      <span className="text-xs text-gray-500">
                        ({item.size}) × {item.quantity}
                      </span>
                    </div>
                  ))}
                </td>

                <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                  {currency}
                  {order.amount.toLocaleString()}
                </td>

                <td className="px-6 py-4 text-xs text-gray-500">
                  {moment(order.createdAt).format("DD MMM YYYY, hh:mm A")}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Shipped"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <select
                    onChange={(e) => statusHandler(e, order._id)}
                    value={order.status}
                    className="block w-full rounded border border-gray-300 text-sm px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-150 ease-in-out"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center text-gray-500 py-12">No orders found</div>
        )}
      </div>
    </div>
  );
};

export default Orders;