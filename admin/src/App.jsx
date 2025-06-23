import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Settings from "./pages/Settings";
import AdminProfile from "./pages/AdminProfile";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import AdminLogin from "./components/AdminLogin";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "Rs.";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to={token ? "/dashboard" : "/login"} />}
                />
                <Route
                  path="/dashboard"
                  element={<Dashboard token={token} />}
                />
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/Settings" element={<Settings token={token} />} />
                <Route
                  path="/profile"
                  element={<AdminProfile token={token} />}
                />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route
                  path="/customers"
                  element={<Customers token={token} />}
                />
                <Route
                  path="/analytics"
                  element={<Analytics token={token} />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
