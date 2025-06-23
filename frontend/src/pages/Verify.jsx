// ✅ CLEANED Verify.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const { backendUrl, getUserProfile } = useContext(ShopContext);
  const navigate = useNavigate();

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("pendingEmail");
    if (!emailFromStorage) {
      navigate("/login");
    } else {
      setEmail(emailFromStorage);
    }
  }, [navigate]);

  useEffect(() => {
    let interval = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/verify-otp`,
        { email, otp },
        { withCredentials: true } // Send cookies
      );

      if (response.data.success) {
        localStorage.removeItem("pendingEmail");
        await getUserProfile(); // Get profile after verifying
        toast.success("Verified successfully!");
        navigate("/"); // Redirect to home instead of /profile
      } else {
        console.log("Error", response.data.message)
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("OTP verification failed");
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/resend-otp`, {
        email,
      });

      if (response.data.success) {
        toast.success("OTP resent to your email.");
        setCooldown(30);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend OTP. Try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center mt-24 gap-4 text-gray-700">
      <h2 className="text-2xl font-semibold">Email Verification</h2>
      <p className="text-sm">
        Enter the OTP sent to <strong>{email}</strong>
      </p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border px-4 py-2 rounded w-60"
      />

      <button
        onClick={handleVerify}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Verify OTP
      </button>

      <button
        onClick={handleResendOtp}
        disabled={cooldown > 0}
        className={`px-6 py-2 rounded border ${
          cooldown > 0
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "text-blue-600 border-blue-500 hover:bg-blue-50"
        }`}
      >
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
      </button>
    </div>
  );
};

export default Verify;