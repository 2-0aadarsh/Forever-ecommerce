/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  FiBox,
  FiTrendingUp,
  FiAward,
  FiShoppingCart,
  FiDollarSign,
  FiUsers,
  FiRefreshCw,
} from "react-icons/fi";
import axios from "axios";
import { backendUrl } from "../App";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import moment from "moment";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [data, setData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    bestsellerCount: 0,
    newCustomers: 0,
    totalRevenueChange: 0,
    totalOrdersChange: 0,
    newCustomersChange: 0,
    salesData: [],
    recentOrders: [],
    statusCounts: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
  });

  // const token = localStorage.getItem("token");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/admin/summary`, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
        params: { range: timeRange },
        withCredentials: true,
      });

      if (res.data.success) {
        setData({
          ...res.data.data,
          statusCounts: {
            pending: res.data.data.statusCounts?.pending || 0,
            processing: res.data.data.statusCounts?.processing || 0,
            shipped: res.data.data.statusCounts?.shipped || 0,
            delivered: res.data.data.statusCounts?.delivered || 0,
            cancelled: res.data.data.statusCounts?.cancelled || 0,
          },
        });
      }
    } catch (err) {
      console.error("Dashboard Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      // Only fetch if token exists
      fetchDashboardStats();
    }
  }, [timeRange, token]);

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${data?.totalRevenue?.toLocaleString() || 0}`,
      icon: <FiDollarSign className="text-blue-500" />,
      change: `${data?.totalRevenueChange?.toFixed(1) || 0}%`,
      trend: data?.totalRevenueChange >= 0 ? "up" : "down",
      chartColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Total Orders",
      value: data?.totalOrders?.toLocaleString() || 0,
      icon: <FiShoppingCart className="text-purple-500" />,
      change: `${data?.totalOrdersChange?.toFixed(1) || 0}%`,
      trend: data?.totalOrdersChange >= 0 ? "up" : "down",
      chartColor: "rgba(168, 85, 247, 0.1)",
    },
    {
      title: "Best Sellers",
      value: data?.bestsellerCount || 0,
      icon: <FiAward className="text-amber-500" />,
      change: "N/A",
      trend: "neutral",
      chartColor: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "New Customers",
      value: data?.newCustomers || 0,
      icon: <FiUsers className="text-emerald-500" />,
      change: `${data?.newCustomersChange?.toFixed(1) || 0}%`,
      trend: data?.newCustomersChange >= 0 ? "up" : "down",
      chartColor: "rgba(16, 185, 129, 0.1)",
    },
  ];

  const salesChartData = {
    labels: data.salesData.map((item) => moment(item.date).format("MMM DD")),
    datasets: [
      {
        label: "Sales",
        data: data.salesData.map((item) => item.amount),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const orderStatusData = {
    labels: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    datasets: [
      {
        label: "Orders",
        data: [
          data.statusCounts.pending,
          data.statusCounts.processing,
          data.statusCounts.shipped,
          data.statusCounts.delivered,
          data.statusCounts.cancelled,
        ],
        backgroundColor: [
          "rgba(249, 115, 22, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(168, 85, 247, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
            </select>
            <button
              onClick={fetchDashboardStats}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <FiRefreshCw
                className={`text-gray-500 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${stat.chartColor}`}>
                    <div className="text-2xl">{stat.icon}</div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trend === "up"
                        ? "bg-green-50 text-green-600"
                        : stat.trend === "down"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {stat.change}{" "}
                    {stat.trend === "up"
                      ? "↑"
                      : stat.trend === "down"
                      ? "↓"
                      : ""}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-500">
                  {stat.title}
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`h-1 ${
                  stat.trend === "up"
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : stat.trend === "down"
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : "bg-gradient-to-r from-gray-400 to-gray-500"
                }`}
              ></div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Sales Performance
              </h2>
              <div className="flex space-x-2">
                <button className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  Revenue
                </button>
                <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Orders
                </button>
              </div>
            </div>
            <div className="h-64">
              <Line
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `₹${context.raw.toLocaleString()}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${value.toLocaleString()}`,
                      },
                      grid: {
                        drawBorder: false,
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Status Distribution
            </h2>
            <div className="h-64">
              <Bar
                data={orderStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.raw} orders`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false,
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentOrders?.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{order.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Pending"
                            ? "bg-orange-100 text-orange-800"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
