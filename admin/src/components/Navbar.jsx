/* eslint-disable react/prop-types */
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiHome,
  FiBell,
  FiSettings,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ setToken, user = {} }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // TODO: Replace with API call
    setNotifications([
      { id: 1, text: "New order received", time: "2 mins ago", read: false },
      {
        id: 2,
        text: "System update available",
        time: "1 hour ago",
        read: true,
      },
    ]);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    setToken("");
    navigate("/login");
    setMobileOpen(false);
  };

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", path: "/dashboard" },
    { icon: <FiSettings />, label: "Settings", path: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-50"
              aria-label="Open menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <img
                className="h-12 w-auto"
                src={assets.logo}
                alt="Forever Admin Logo"
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  window.location.pathname === item.path
                    ? "text-pink-500 border-b-2 border-pink-500"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full text-gray-500 hover:text-pink-600 hover:bg-gray-100 relative"
              >
                <FiBell className="h-5 w-5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-700">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? "bg-pink-50" : ""
                            }`}
                          >
                            <p className="text-sm text-gray-800">
                              {notification.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-sm text-gray-500">
                          No new notifications
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-medium text-pink-600 hover:text-pink-500"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-medium">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {user?.name || "Admin"}
                </span>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiUser className="mr-2" />
                        Your Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiLogOut className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
