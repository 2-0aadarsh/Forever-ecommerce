/* eslint-disable react/prop-types */
// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const ProtectedRoute = ({ children }) => {
  const { token, userData } = useContext(ShopContext);

  if (!token || !userData) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
