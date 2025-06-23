/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiUser,
  FiChevronDown,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import moment from "moment";

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const token = localStorage.getItem("token");

  const fetchCustomers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/user/list`, {
        headers: { token },
        params: {
          page,
          limit: 10,
          search,
        },
      });

      if (res.data.success) {
        setCustomers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Customers Error:", err);
      toast.error(err.response?.data?.message || "Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(1, searchQuery);
  };

  const deleteCustomer = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;

    try {
      const res = await axios.delete(`${backendUrl}/api/user/${userId}`, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success("Customer deleted successfully");
        fetchCustomers(currentPage, searchQuery);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting customer");
    }
  };

  const startEditing = (customer) => {
    setEditingCustomer(customer._id);
    setEditFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  };

  const cancelEditing = () => {
    setEditingCustomer(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveEditedCustomer = async (userId) => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/user/${userId}`,
        editFormData,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Customer updated successfully");
        setEditingCustomer(null);
        fetchCustomers(currentPage, searchQuery);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating customer");
    }
  };

  const getStatusColor = (isVerified) => {
    return isVerified
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            Manage your customer relationships
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hidden">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="bg-white hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="bg-pink-100 text-pink-600 p-2 rounded-full">
                          <FiUser />
                        </span>
                        {editingCustomer === customer._id ? (
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditChange}
                            className="border border-gray-300 rounded px-2 py-1"
                          />
                        ) : (
                          <span>{customer.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingCustomer === customer._id ? (
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditChange}
                          className="border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        customer.email
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingCustomer === customer._id ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleEditChange}
                          className="border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        customer.phone
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {moment(customer.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`${getStatusColor(
                          customer.isVerified
                        )} px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        {customer.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingCustomer === customer._id ? (
                          <>
                            <button
                              onClick={() => saveEditedCustomer(customer._id)}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <FiSave size={16} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-800 p-1"
                            >
                              <FiX size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(customer)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteCustomer(customer._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => fetchCustomers(currentPage - 1, searchQuery)}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => fetchCustomers(currentPage + 1, searchQuery)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
