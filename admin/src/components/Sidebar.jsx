import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiPlus,
  FiList,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiPieChart,
  FiChevronRight,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const location = useLocation();

  const navItems = [
    {
      icon: <FiPlus size={20} />,
      label: "Add Items",
      path: "/add",
    },
    {
      icon: <FiList size={20} />,
      label: "List Items",
      path: "/list",
    },
    {
      icon: <FiShoppingBag size={20} />,
      label: "Orders",
      path: "/orders",
    //   submenu: [
    //     { label: "New Orders", path: "/orders/new" },
    //     { label: "Completed", path: "/orders/completed" },
    //     { label: "Cancelled", path: "/orders/cancelled" },
    //   ],
    },
    {
      icon: <FiUsers size={20} />,
      label: "Customers",
      path: "/customers",
    },
    {
      icon: <FiPieChart size={20} />,
      label: "Analytics",
      path: "/analytics",
    },
    {
      icon: <FiSettings size={20} />,
      label: "Settings",
      path: "/settings",
    //   submenu: [
    //     { label: "General", path: "/settings/general" },
    //     { label: "Permissions", path: "/settings/permissions" },
    //     { label: "Integrations", path: "/settings/integrations" },
    //   ],
    },
  ];

  useEffect(() => {
    setMobileOpen(false);
    const currentItem = navItems.find(
      (item) =>
        item.submenu &&
        item.submenu.some((sub) => sub.path === location.pathname)
    );
    if (currentItem) {
      setActiveSubmenu(currentItem.label);
    }
  }, [location]);

  const renderNavItems = (isMobile = false) => (
    <div className={`flex-1 mt-4 overflow-y-auto ${isMobile ? "py-2" : ""}`}>
      {navItems.map((item) => (
        <React.Fragment key={item.label}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-pink-50 text-pink-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
            onClick={() =>
              item.submenu &&
              setActiveSubmenu(activeSubmenu === item.label ? null : item.label)
            }
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {expanded && <span className="ml-3">{item.label}</span>}
            {item.submenu && expanded && (
              <FiChevronRight
                className={`ml-auto transition-transform ${
                  activeSubmenu === item.label ? "rotate-90" : ""
                }`}
              />
            )}
          </NavLink>

          {item.submenu && activeSubmenu === item.label && expanded && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="ml-10 pl-2 border-l border-gray-200">
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block py-2 px-3 my-1 rounded text-sm ${
                          isActive
                            ? "text-pink-600 font-medium"
                            : "text-gray-500 hover:text-gray-700"
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow text-gray-600"
      >
        <FiMenu size={24} />
      </button>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ width: expanded ? "18rem" : "5rem" }}
        animate={{ width: expanded ? "18rem" : "5rem" }}
        className="hidden md:flex flex-col h-[calc(100vh-64px)] bg-white border-r border-gray-200 sticky top-16" // Adjusted for navbar height
      >
        {/* Edge Toggle Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute -right-6 top-10 transform -translate-y-1/2 z-50 bg-white border border-gray-300 shadow-md w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
        >
          <FiChevronRight
            size={26}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {/* Navigation */}
        {renderNavItems(false)}

        {/* User Footer */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-pink-600 font-medium">
              A
            </div>
            {expanded && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <p className="text-lg font-semibold">Menu</p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderNavItems(true)}
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-pink-600 font-medium">
                    A
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Admin</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
