import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);

  const handleReset = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("resetEmail");

    if (!email) return toast.error("No email found. Please try again.");

    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/reset-password`,
        {
          email,
          otp,
          newPassword,
        }
      );

      if (response.data.success) {
        toast.success("Password reset successful! Please log in.");
        localStorage.removeItem("resetEmail");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Reset failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleReset} className="max-w-sm mx-auto mt-16 space-y-4">
      <h2 className="text-xl font-semibold">Reset Password</h2>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP sent to email"
        required
        className="w-full p-3 border rounded"
      />

      {/* New Password Field */}
      <div className="relative">
        <input
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setPasswordMismatch(false);
          }}
          placeholder="New Password"
          required
          className="w-full p-3 pr-10 border rounded"
        />
        <div
          className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
          onClick={() => setShowNewPassword(!showNewPassword)}
        >
          {showNewPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordMismatch(false);
          }}
          placeholder="Confirm New Password"
          required
          className="w-full p-3 pr-10 border rounded"
        />
        <div
          className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </div>
      </div>

      {passwordMismatch && (
        <p className="text-sm text-red-500">Passwords do not match.</p>
      )}

      <button className="bg-black text-white px-4 py-2 w-full">
        Reset Password
      </button>
    </form>
  );
};

export default ResetPassword;