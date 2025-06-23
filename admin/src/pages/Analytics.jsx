/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiShoppingBag,
  FiRefreshCw,
} from "react-icons/fi";
import axios from "axios";
import { backendUrl } from "../App";
import moment from "moment";
import { toast } from "react-toastify";

const COLORS = ["#8884d8", "#ec4899", "#ffbb28", "#00C49F", "#FF8042"];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRevenue: [],
    customerTypes: [],
    userGrowth: [],
    metrics: {
      totalRevenue: 0,
      totalCustomers: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    },
  });

  const token = localStorage.getItem("token");

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const summaryRes = await axios.get(`${backendUrl}/api/admin/summary`, {
        headers: { token },
        params: { range: timeRange },
      });

      const customersRes = await axios.get(`${backendUrl}/api/user/list`, {
        headers: { token },
      });

      const ordersRes = await axios.get(`${backendUrl}/api/order/admin/list`, {
        headers: { token },
        params: { limit: 100 },
      });

      if (summaryRes.data.success && customersRes.data.success) {
        const monthlyRevenue = summaryRes.data.data.salesData.map((item) => ({
          name: moment(item.date).format("MMM"),
          revenue: item.amount,
        }));

        const allCustomers = customersRes.data.users || [];
        const newCustomers = allCustomers.filter((customer) =>
          moment(customer.createdAt).isAfter(moment().subtract(1, "month"))
        ).length;

        const customerTypes = [
          { name: "New Customers", value: newCustomers },
          {
            name: "Returning Customers",
            value: allCustomers.length - newCustomers,
          },
        ];

        const userGrowth = Array(6)
          .fill()
          .map((_, i) => {
            const date = moment().subtract(5 - i, "months");
            const monthUsers = allCustomers.filter((user) =>
              moment(user.createdAt).isSame(date, "month")
            );
            return {
              name: date.format("MMM"),
              users: monthUsers.length,
            };
          });

        const orders = ordersRes.data.orders || [];
        const totalOrderValue = orders.reduce(
          (sum, order) => sum + order.amount,
          0
        );
        const avgOrderValue =
          orders.length > 0 ? totalOrderValue / orders.length : 0;

        setAnalyticsData({
          monthlyRevenue,
          customerTypes,
          userGrowth,
          metrics: {
            totalRevenue: summaryRes.data.data.totalRevenue || 0,
            totalCustomers: allCustomers.length,
            totalOrders: summaryRes.data.data.totalOrders || 0,
            avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
          },
        });
      }
    } catch (err) {
      console.error("Analytics Error:", err);
      toast.error(err.response?.data?.message || "Error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Key metrics and performance indicators
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchAnalyticsData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${analyticsData.metrics.totalRevenue.toLocaleString()}`,
            icon: <FiDollarSign size={20} />,
            color: "bg-pink-100 text-pink-600",
          },
          {
            label: "Total Customers",
            value: analyticsData.metrics.totalCustomers.toLocaleString(),
            icon: <FiUsers size={20} />,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Total Orders",
            value: analyticsData.metrics.totalOrders.toLocaleString(),
            icon: <FiShoppingBag size={20} />,
            color: "bg-purple-100 text-purple-600",
          },
          {
            label: "Avg. Order Value",
            value: `₹${analyticsData.metrics.avgOrderValue.toLocaleString()}`,
            icon: <FiDollarSign size={20} />,
            color: "bg-green-100 text-green-600",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${item.color}`}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Monthly Revenue
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-100 border-0 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
              </select>
              <button
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <FiRefreshCw
                  className={`w-5 h-5 text-gray-500 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.monthlyRevenue}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar
                dataKey="revenue"
                fill="#ec4899"
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Types Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Customer Types
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.customerTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {analyticsData.customerTypes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} customers`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          User Growth
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.userGrowth}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280" }}
            />
            <Tooltip formatter={(value) => [`${value} new users`, "Users"]} />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
